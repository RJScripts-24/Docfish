import OpenAI from 'openai';
import Document from '../models/Document.model';
import promptService from './prompt.service';
import validationService, {
  ExtractedInvoiceData,
  ValidationResult,
} from './validation.service';
import storageService from './storage.service';
import { extractTextFromPdf } from '../utils/pdfParser';

export interface ProcessDocumentInput {
  documentId: string;
  filePath: string;
  originalFilename: string;
  mimeType?: string;
  userId?: string;
}

export interface ExtractionOutput {
  extractedData: ExtractedInvoiceData;
  validation: ValidationResult;
  rawText: string;
  promptVersion: number;
  processingTimeMs: number;
}

class ExtractionService {
  private getLlmClient() {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return null;
    }

    return new OpenAI({
      apiKey,
      baseURL: process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1',
    });
  }

  private safeJsonParse(content: string) {
    const cleaned = content
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    try {
      return JSON.parse(cleaned);
    } catch (_error) {
      const objectMatch = cleaned.match(/\{[\s\S]*\}/);

      if (!objectMatch) {
        throw new Error('Unable to parse model JSON output');
      }

      return JSON.parse(objectMatch[0]);
    }
  }

  private normalizeTextForHeuristics(text: string) {
    return text
      .replace(/\u0000/g, ' ')
      .replace(/[ \t]+/g, ' ')
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  private extractVendorName(text: string, lines: string[]) {
    const vendorMatch = text.match(/(?:vendor|supplier|seller|from)\s*[:\-]\s*([^\n]+)/i);

    if (vendorMatch?.[1]) {
      return vendorMatch[1].trim();
    }

    return lines[0] || null;
  }

  private extractLineItems(text: string) {
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    const parsedItems = lines
      .map((line) => {
        const compact = line.replace(/\s+/g, ' ').trim();

        // Common row format: description qty unit_price line_total
        const rowMatch = compact.match(
          /^(.*?)(?:\s{1,}|\t+)(\d+(?:\.\d+)?)\s+([0-9,]+(?:\.\d{1,2})?)\s+([0-9,]+(?:\.\d{1,2})?)$/
        );

        if (!rowMatch) {
          return null;
        }

        const description = rowMatch[1]?.trim();

        if (!description || /invoice|subtotal|total|tax|gst|vat/i.test(description)) {
          return null;
        }

        return {
          description,
          quantity: Number(rowMatch[2]),
          unit_price: Number(rowMatch[3].replace(/,/g, '')),
          line_total: Number(rowMatch[4].replace(/,/g, '')),
        };
      })
      .filter(Boolean);

    return parsedItems as Array<{
      description: string;
      quantity: number;
      unit_price: number;
      line_total: number;
    }>;
  }

  private extractCurrencySymbol(text: string) {
    if (text.includes('₹')) {
      return 'INR';
    }

    if (text.includes('$')) {
      return 'USD';
    }

    if (text.includes('€')) {
      return 'EUR';
    }

    if (text.includes('£')) {
      return 'GBP';
    }

    return null;
  }

  private extractInvoiceNumber(text: string) {
    const patterns = [
      /invoice\s*(?:number|no|#)\s*[:\-]?\s*([A-Z0-9\-\/]+)/i,
      /bill\s*(?:id|number|#)\s*[:\-]?\s*([A-Z0-9\-\/]+)/i,
      /inv\s*#\s*[:\-]?\s*([A-Z0-9\-\/]+)/i,
      /reference\s*(?:number|no|#)\s*[:\-]?\s*([A-Z0-9\-\/]+)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match?.[1]) {
        return match[1].trim();
      }
    }

    return null;
  }

  private extractDate(text: string) {
    const match = text.match(
      /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}|[A-Za-z]{3,9}\s+\d{1,2},\s+\d{4})\b/
    );
    return match?.[1] || null;
  }

  private extractAmount(label: string, text: string) {
    const regex = new RegExp(
      `${label}\\s*[:\\-]?\\s*(?:INR|USD|EUR|GBP|Rs\\.?|\\$|€|£)?\\s*([0-9,]+(?:\\.[0-9]{1,2})?)`,
      'i'
    );
    const match = text.match(regex);
    return match?.[1] || null;
  }

  private buildFallbackExtraction(text: string): Partial<ExtractedInvoiceData> {
    const normalizedText = this.normalizeTextForHeuristics(text);
    const lines = normalizedText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    const vendorName = this.extractVendorName(normalizedText, lines);
    const lineItems = this.extractLineItems(normalizedText);

    return {
      vendor_name: vendorName,
      invoice_number: this.extractInvoiceNumber(normalizedText),
      invoice_date: this.extractDate(normalizedText),
      currency: this.extractCurrencySymbol(normalizedText),
      total_amount: this.extractAmount('total|grand total|amount due|net payable', normalizedText) as any,
      tax_amount: this.extractAmount('tax|vat|gst|sales tax', normalizedText) as any,
      line_items: lineItems,
    };
  }

  private async runLlmExtraction(rawText: string) {
    const prompt = await promptService.getActivePrompt('invoice_extraction');
    const llmClient = this.getLlmClient();

    if (!llmClient) {
      return {
        data: this.buildFallbackExtraction(rawText),
        promptVersion: prompt.version,
      };
    }

    const completion = await llmClient.chat.completions.create({
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      temperature: 0,
      messages: [
        {
          role: 'system',
          content: `${prompt.systemPrompt}\n\nReturn strict JSON only. Do not wrap output in markdown code fences.`,
        },
        {
          role: 'user',
          content: `${prompt.userPrompt}\n\nInvoice text:\n${rawText}`,
        },
      ],
    });

    const outputText = completion.choices?.[0]?.message?.content;

    if (!outputText || typeof outputText !== 'string') {
      throw new Error('LLM returned empty content');
    }

    let parsed: Partial<ExtractedInvoiceData>;

    try {
      parsed = this.safeJsonParse(outputText);
    } catch (_error) {
      // If the model responds with non-JSON text, fall back to deterministic extraction.
      parsed = this.buildFallbackExtraction(rawText);
    }

    return {
      data: parsed,
      promptVersion: prompt.version,
    };
  }

  async extractFromPdf(filePath: string): Promise<ExtractionOutput> {
    const startedAt = Date.now();
    const rawText = await extractTextFromPdf(filePath);
    const llmResult = await this.runLlmExtraction(rawText);
    const validation = validationService.validate(llmResult.data);
    const processingTimeMs = Date.now() - startedAt;

    return {
      extractedData: validation.normalizedData,
      validation,
      rawText,
      promptVersion: llmResult.promptVersion,
      processingTimeMs,
    };
  }

  async processDocument(input: ProcessDocumentInput) {
    const document = await Document.findById(input.documentId);

    if (!document) {
      throw new Error('Document not found');
    }

    document.status = 'PROCESSING';
    document.processingStartedAt = new Date();
    await document.save();

    try {
      const result = await this.extractFromPdf(input.filePath);

      document.status = 'PROCESSED';
      document.extractedData = result.extractedData;
      document.validationErrors = result.validation.validationErrors;
      document.confidenceScore = result.validation.confidenceScore;
      document.processingTimeMs = result.processingTimeMs;
      document.rawText = result.rawText;
      document.promptVersion = result.promptVersion;
      document.processedAt = new Date();

      await document.save();
      await storageService.saveJsonResult(document._id.toString(), {
        extractedData: result.extractedData,
        validation: result.validation,
        rawText: result.rawText,
        promptVersion: result.promptVersion,
        processingTimeMs: result.processingTimeMs,
      });

      return document;
    } catch (error: any) {
      document.status = 'FAILED';
      document.errorMessage = error.message || 'Extraction failed';
      document.processedAt = new Date();
      await document.save();
      throw error;
    }
  }

  async reprocessDocument(documentId: string) {
    const document = await Document.findById(documentId);

    if (!document) {
      throw new Error('Document not found');
    }

    if (!document.filePath) {
      throw new Error('Original file path not found');
    }

    return this.processDocument({
      documentId,
      filePath: document.filePath,
      originalFilename: document.originalFilename,
      mimeType: document.mimeType,
      userId: document.uploadedBy?.toString(),
    });
  }
}

export default new ExtractionService();
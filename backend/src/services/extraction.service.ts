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
  private getOpenAiClient() {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return null;
    }

    return new OpenAI({ apiKey });
  }

  private safeJsonParse(content: string) {
    const cleaned = content
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    return JSON.parse(cleaned);
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
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    const vendorName = lines[0] || null;

    return {
      vendor_name: vendorName,
      invoice_number: this.extractInvoiceNumber(text),
      invoice_date: this.extractDate(text),
      currency: this.extractCurrencySymbol(text),
      total_amount: this.extractAmount('total|grand total|amount due', text) as any,
      tax_amount: this.extractAmount('tax|vat|gst', text) as any,
      line_items: [],
    };
  }

  private async runLlmExtraction(rawText: string) {
    const prompt = await promptService.getActivePrompt('invoice_extraction');
    const openai = this.getOpenAiClient();

    if (!openai) {
      return {
        data: this.buildFallbackExtraction(rawText),
        promptVersion: prompt.version,
      };
    }

    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
      temperature: 0,
      input: [
        {
          role: 'system',
          content: [{ type: 'input_text', text: prompt.systemPrompt }],
        },
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: `${prompt.userPrompt}\n\nInvoice text:\n${rawText}`,
            },
          ],
        },
      ],
    });

    const outputText =
      response.output_text ||
      response.output
        ?.flatMap((item: any) => item.content || [])
        ?.map((item: any) => item.text || '')
        ?.join('') ||
      '';

    const parsed = this.safeJsonParse(outputText);

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
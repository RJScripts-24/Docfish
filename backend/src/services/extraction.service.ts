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
  private toErrorDetails(error: unknown) {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    return {
      message: String(error),
    };
  }

  private isRecoverablePdfError(error: unknown) {
    const message =
      error instanceof Error ? error.message.toLowerCase() : String(error || '').toLowerCase();

    return /xref|pdf|eof|invalid\s+pdf|bad\s+xref/.test(message);
  }

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

    if (parsedItems.length > 0) {
      return parsedItems as Array<{
        description: string;
        quantity: number;
        unit_price: number;
        line_total: number;
      }>;
    }

    const amountFromToken = (token: string) => {
      const match = token.match(
        /(?:INR|USD|EUR|GBP|Rs\.?|\$|€|£)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i
      );

      if (!match?.[1]) {
        return null;
      }

      return Number(match[1].replace(/,/g, ''));
    };

    const quantityFromToken = (token: string) => {
      if (!/^\d+(?:\.\d+)?$/.test(token.trim())) {
        return null;
      }

      return Number(token);
    };

    const headerIndex = lines.findIndex((line, index) => {
      const normalized = line.toLowerCase();
      return (
        normalized === 'description' &&
        lines[index + 1]?.toLowerCase() === 'qty' &&
        /unit\s*price/i.test(lines[index + 2] || '')
      );
    });

    if (headerIndex === -1) {
      return [];
    }

    const sequenceItems: Array<{
      description: string;
      quantity: number;
      unit_price: number;
      line_total: number;
    }> = [];

    let cursor = headerIndex + 4;

    while (cursor < lines.length) {
      const description = lines[cursor] || '';

      if (!description || /^total\s*amount/i.test(description) || /^tax\b/i.test(description)) {
        break;
      }

      const quantity = quantityFromToken(lines[cursor + 1] || '');
      const unitPrice = amountFromToken(lines[cursor + 2] || '');
      const lineTotal = amountFromToken(lines[cursor + 3] || '');

      if (
        quantity !== null &&
        unitPrice !== null &&
        lineTotal !== null &&
        !/invoice|subtotal|total|tax|gst|vat|amount|qty|unit\s*price/i.test(description)
      ) {
        sequenceItems.push({
          description,
          quantity,
          unit_price: unitPrice,
          line_total: lineTotal,
        });
        cursor += 4;
        continue;
      }

      cursor += 1;
    }

    return sequenceItems;
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
      /invoice\s*id\s*[:\-]?\s*([A-Z0-9\-\/]+)/i,
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
    let promptVersion = 0;
    let systemPrompt =
      'You extract invoice data into structured JSON with strong field fidelity.';
    let userPrompt =
      'Extract vendor_name, invoice_number, invoice_date, currency, total_amount, tax_amount, and line_items from the provided invoice text. Return JSON only.';

    try {
      const prompt = await promptService.getActivePrompt('invoice_extraction');
      promptVersion = prompt.version;
      systemPrompt = prompt.systemPrompt;
      userPrompt = prompt.userPrompt;
    } catch (error) {
      console.warn('[Extraction] Failed to load active prompt, using default fallback prompt', {
        error: this.toErrorDetails(error),
      });
    }

    const llmClient = this.getLlmClient();

    if (!llmClient) {
      return {
        data: this.buildFallbackExtraction(rawText),
        promptVersion,
      };
    }

    let completion;

    try {
      completion = await llmClient.chat.completions.create({
        model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        temperature: 0,
        messages: [
          {
            role: 'system',
            content: `${systemPrompt}\n\nReturn strict JSON only. Do not wrap output in markdown code fences.`,
          },
          {
            role: 'user',
            content: `${userPrompt}\n\nInvoice text:\n${rawText}`,
          },
        ],
      });
    } catch (error) {
      console.warn('[Extraction] LLM request failed, using heuristic extraction fallback', {
        error: this.toErrorDetails(error),
      });

      return {
        data: this.buildFallbackExtraction(rawText),
        promptVersion,
      };
    }

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
      promptVersion,
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

    console.info('[Extraction] Started processing document', {
      documentId: input.documentId,
      filename: input.originalFilename,
      mimeType: input.mimeType,
      filePath: input.filePath,
      userId: input.userId || null,
    });

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

      console.info('[Extraction] Completed processing document', {
        documentId: input.documentId,
        status: document.status,
        processingTimeMs: result.processingTimeMs,
        validationErrorCount: result.validation.validationErrors.length,
      });

      return document;
    } catch (error: any) {
      if (this.isRecoverablePdfError(error)) {
        const validation = validationService.validate({
          vendor_name: null,
          invoice_number: null,
          invoice_date: null,
          currency: null,
          total_amount: null,
          tax_amount: null,
          line_items: [],
        });

        validation.validationErrors.unshift({
          field: 'document',
          code: 'PDF_PARSE_WARNING',
          message:
            'Text extraction failed for this PDF. The file was uploaded and sent to manual review.',
        });

        const processingTimeMs = document.processingStartedAt
          ? Date.now() - document.processingStartedAt.getTime()
          : null;

        document.status = 'PROCESSED';
        document.extractedData = validation.normalizedData;
        document.validationErrors = validation.validationErrors;
        document.confidenceScore = validation.confidenceScore;
        document.processingTimeMs = processingTimeMs;
        document.rawText = '';
        document.errorMessage = null;
        document.processedAt = new Date();

        await document.save();
        await storageService.saveJsonResult(document._id.toString(), {
          extractedData: validation.normalizedData,
          validation,
          rawText: '',
          promptVersion: null,
          processingTimeMs: processingTimeMs || 0,
        });

        console.warn('[Extraction] Recovered from PDF parse error and moved document to review', {
          documentId: input.documentId,
          filename: input.originalFilename,
          processingTimeMs,
          error: this.toErrorDetails(error),
        });

        return document;
      }

      document.status = 'FAILED';
      document.errorMessage = error.message || 'Extraction failed';
      document.processedAt = new Date();
      await document.save();

      console.error('[Extraction] Failed processing document', {
        documentId: input.documentId,
        filename: input.originalFilename,
        status: document.status,
        error: this.toErrorDetails(error),
      });

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
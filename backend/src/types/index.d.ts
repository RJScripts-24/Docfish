export interface LineItem {
  description: string;
  quantity: number | null;
  unit_price: number | null;
  line_total: number | null;
}

export interface ExtractedInvoiceData {
  vendor_name: string | null;
  invoice_number: string | null;
  invoice_date: string | null;
  currency: string | null;
  total_amount: number | null;
  tax_amount: number | null;
  line_items: LineItem[];
}

export interface ValidationErrorItem {
  field: string;
  message: string;
  code: string;
}

export interface ProcessingMetadata {
  status: 'UPLOADED' | 'PROCESSING' | 'PROCESSED' | 'FAILED';
  confidenceScore: number;
  validationErrors: ValidationErrorItem[];
  processingTimeMs: number;
  promptVersion: number;
  processedAt?: Date | string | null;
  processingStartedAt?: Date | string | null;
  errorMessage?: string | null;
}

export interface DocumentApiResponse {
  id: string;
  originalFilename: string;
  mimeType: string;
  filePath: string;
  extractedData: ExtractedInvoiceData;
  metadata: ProcessingMetadata;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface PromptPayload {
  id?: string;
  name: string;
  version: number;
  systemPrompt: string;
  userPrompt: string;
  description?: string;
  isActive: boolean;
  createdBy?: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
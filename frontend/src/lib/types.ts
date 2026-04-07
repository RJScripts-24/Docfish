export type DocumentStatus = 'success' | 'review' | 'failed';
export type UploadStatus = 'uploading' | 'uploaded' | 'processing' | 'done' | 'error';
export type ErrorType = 'parsing' | 'validation' | 'missing' | 'unknown';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  isGuest?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export interface DashboardMetrics {
  totalDocuments: number;
  avgProcessingTime: string;
  successRate: number;
  validationErrors: number;
}

export interface DocumentChartPoint {
  label: string;
  documents: number;
}

export interface InvoiceDocument {
  id: string;
  name: string;
  vendor: string | null;
  invoiceDate: string | null;
  amount: number | null;
  status: DocumentStatus;
  confidence: number;
  processingTime: string | null;
}

export interface DocumentListResponse {
  data: InvoiceDocument[];
  totalCount: number;
  page: number;
  limit: number;
}

export interface ExtractedField {
  value: string | null;
  confidence: number;
  isEdited: boolean;
  originalValue: string | null;
}

export interface EditableLineItem {
  id: number;
  description: string;
  quantity: number | null;
  unitPrice: number | null;
  total: number | null;
}

export interface ValidationResult {
  passed: boolean;
  title: string;
  message: string;
  severity: 'ok' | 'warning' | 'error';
}

export interface DocumentDetails {
  id: string;
  status: DocumentStatus;
  processingTime: string | null;
  overallConfidence: number;
  extractionMethod?: 'llm' | 'heuristic' | 'ocr_heuristic' | 'manual' | null;
  manuallyEdited?: boolean;
  lastManualEditAt?: string | null;
  documentUrl: string;
  extractedFields: Record<string, ExtractedField>;
  lineItems: EditableLineItem[];
  validationResults: ValidationResult[];
}

export interface UploadJob {
  id: string;
  name: string;
  size: number;
  status: UploadStatus;
  progress: number;
  documentId?: string;
  errorMessage?: string;
}

export interface ErrorDocument {
  id: string;
  name: string;
  vendor: string;
  errorType: ErrorType;
  errorMessage: string;
  status: 'failed' | 'review';
  lastAttempt: string;
  retryCount: number;
}

export interface ErrorSummary {
  failedCount: number;
  reviewCount: number;
  validationFailuresCount: number;
  successRate: number;
}

export interface PromptVersion {
  id: string;
  name: string;
  description: string;
  content: string;
  timestamp: string;
  status: 'active' | 'draft';
  tags: string[];
}

export interface PromptTestResult {
  promptId: string;
  promptVersion: number;
  extractionMethod: 'llm' | 'heuristic' | 'ocr_heuristic' | 'manual';
  modelBacked: boolean;
  degradedMode: boolean;
  degradedModeReason: string | null;
  extractedFields: Record<string, ExtractedField>;
  normalizedOutput: Record<string, unknown>;
  validationResults: Array<{
    passed: boolean;
    title: string;
    message: string;
    severity: 'ok' | 'warning' | 'error';
    field: string | null;
    code: string | null;
  }>;
  rawModelOutput: string | null;
  rawOutput: string;
  processingTime: string;
  processingTimeMs: number;
  overallConfidence: number;
}

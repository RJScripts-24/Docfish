import path from 'path';
import { Request } from 'express';

interface DocumentLike {
  _id: any;
  originalFilename?: string;
  filePath?: string;
  status?: string;
  confidenceScore?: number | null;
  processingTimeMs?: number | null;
  extractedData?: any;
  validationErrors?: Array<{ code?: string; message?: string }>;
  errorMessage?: string | null;
  updatedAt?: Date | string;
  retryCount?: number;
  fileSizeBytes?: number;
}

interface PromptLike {
  _id: any;
  name?: string;
  description?: string;
  userPrompt?: string;
  isActive?: boolean;
  tags?: string[];
  updatedAt?: Date | string;
}

export type PublicDocumentStatus = 'success' | 'review' | 'failed';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const toStringValue = (value: unknown): string | null => {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  return String(value);
};

const toDateOnly = (value: unknown): string => {
  const raw = toStringValue(value);

  if (!raw) {
    return new Date().toISOString().slice(0, 10);
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return raw;
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }

  return parsed.toISOString().slice(0, 10);
};

export const toProcessingTime = (processingTimeMs?: number | null) => {
  if (!processingTimeMs || processingTimeMs <= 0) {
    return '0.0s';
  }

  return `${(processingTimeMs / 1000).toFixed(1)}s`;
};

export const toConfidencePercent = (confidenceScore?: number | null) => {
  const score = typeof confidenceScore === 'number' ? confidenceScore : 0;
  return clamp(Math.round(score * 100), 0, 100);
};

export const toPublicStatus = (doc: DocumentLike): PublicDocumentStatus => {
  if (doc.status === 'FAILED') {
    return 'failed';
  }

  if (doc.status === 'PROCESSED' && (!doc.validationErrors || doc.validationErrors.length === 0)) {
    return 'success';
  }

  return 'review';
};

export const toErrorStatus = (doc: DocumentLike): 'failed' | 'review' => {
  return doc.status === 'FAILED' ? 'failed' : 'review';
};

export const toUploadedFileStatus = (
  doc: DocumentLike
): 'uploading' | 'uploaded' | 'processing' | 'done' | 'error' => {
  if (doc.status === 'FAILED') {
    return 'error';
  }

  if (doc.status === 'PROCESSED') {
    return 'done';
  }

  if (doc.status === 'PROCESSING') {
    return 'processing';
  }

  return 'uploaded';
};

const toUploadProgress = (status: 'uploading' | 'uploaded' | 'processing' | 'done' | 'error') => {
  if (status === 'done') {
    return 100;
  }

  if (status === 'processing') {
    return 75;
  }

  if (status === 'uploaded') {
    return 20;
  }

  if (status === 'error') {
    return 100;
  }

  return 10;
};

export const toExtractedField = (value: unknown, confidencePercent: number) => ({
  value: toStringValue(value),
  confidence: clamp(confidencePercent / 100, 0, 1),
  isEdited: false,
  originalValue: null,
});

const toValidationSeverity = (code: string | undefined) => {
  if (!code) {
    return 'error';
  }

  if (code.startsWith('MISSING_')) {
    return 'warning';
  }

  return 'error';
};

export const buildDocumentUrl = (req: Request, doc: DocumentLike) => {
  const filename = path.basename(doc.filePath || '');

  if (!filename) {
    return '';
  }

  return `${req.protocol}://${req.get('host')}/uploads/${encodeURIComponent(filename)}`;
};

export const toInvoiceDocument = (doc: DocumentLike) => {
  const confidence = toConfidencePercent(doc.confidenceScore);

  return {
    id: String(doc._id),
    name: doc.originalFilename || 'unknown.pdf',
    vendor: toStringValue(doc.extractedData?.vendor_name) || 'Unknown Vendor',
    invoiceDate: toDateOnly(doc.extractedData?.invoice_date),
    amount: Number(doc.extractedData?.total_amount || 0),
    status: toPublicStatus(doc),
    confidence,
    processingTime: toProcessingTime(doc.processingTimeMs),
  };
};

export const toDocumentDetails = (req: Request, doc: DocumentLike) => {
  const confidence = toConfidencePercent(doc.confidenceScore);
  const lineItems = Array.isArray(doc.extractedData?.line_items) ? doc.extractedData.line_items : [];
  const validationErrors = Array.isArray(doc.validationErrors) ? doc.validationErrors : [];

  const validationResults =
    validationErrors.length > 0
      ? validationErrors.map((error: any) => ({
          passed: false,
          title: (error.code || 'VALIDATION_ERROR').replace(/_/g, ' '),
          message: error.message || 'Validation failed',
          severity: toValidationSeverity(error.code),
        }))
      : [
          {
            passed: true,
            title: 'Total Amount Verified',
            message: 'Sum of line items matches total amount',
            severity: 'ok',
          },
        ];

  return {
    id: String(doc._id),
    status: toPublicStatus(doc),
    processingTime: toProcessingTime(doc.processingTimeMs),
    overallConfidence: confidence,
    documentUrl: buildDocumentUrl(req, doc),
    extractedFields: {
      vendorName: toExtractedField(doc.extractedData?.vendor_name, confidence),
      invoiceNumber: toExtractedField(doc.extractedData?.invoice_number, confidence),
      invoiceDate: toExtractedField(doc.extractedData?.invoice_date, confidence),
      dueDate: toExtractedField(null, confidence),
      currency: toExtractedField(doc.extractedData?.currency, confidence),
      totalAmount: toExtractedField(doc.extractedData?.total_amount, confidence),
      taxAmount: toExtractedField(doc.extractedData?.tax_amount, confidence),
      taxRate: toExtractedField(null, confidence),
      subtotal: toExtractedField(
        typeof doc.extractedData?.total_amount === 'number' && typeof doc.extractedData?.tax_amount === 'number'
          ? doc.extractedData.total_amount - doc.extractedData.tax_amount
          : null,
        confidence
      ),
      paymentTerms: toExtractedField(null, confidence),
      notes: toExtractedField(null, confidence),
    },
    lineItems: lineItems.map((item: any, index: number) => ({
      id: index + 1,
      description: toStringValue(item?.description) || '',
      quantity: Number(item?.quantity || 0),
      unitPrice: Number(item?.unit_price || 0),
      total: Number(item?.line_total || 0),
    })),
    validationResults,
  };
};

export const classifyErrorType = (doc: DocumentLike): 'parsing' | 'missing' | 'validation' | 'unknown' => {
  const message = (doc.errorMessage || '').toLowerCase();
  const validationErrors = Array.isArray(doc.validationErrors) ? doc.validationErrors : [];

  if (doc.status === 'FAILED' && /parse|corrupt|encrypted|pdf|read/.test(message)) {
    return 'parsing';
  }

  if (validationErrors.some((item) => (item.code || '').startsWith('MISSING_'))) {
    return 'missing';
  }

  if (validationErrors.length > 0) {
    return 'validation';
  }

  if (doc.status === 'FAILED') {
    return 'unknown';
  }

  return 'validation';
};

export const toErrorDocument = (doc: DocumentLike) => {
  const status = toErrorStatus(doc);
  const validationErrors = Array.isArray(doc.validationErrors) ? doc.validationErrors : [];

  return {
    id: String(doc._id),
    name: doc.originalFilename || 'unknown.pdf',
    vendor: toStringValue(doc.extractedData?.vendor_name) || 'Unknown Vendor',
    errorType: classifyErrorType(doc),
    errorMessage:
      doc.errorMessage || validationErrors[0]?.message || 'Document requires manual review after extraction',
    status,
    lastAttempt: new Date(doc.updatedAt || Date.now()).toISOString(),
    retryCount: Number(doc.retryCount || 0),
  };
};

const humanizeRecency = (value: Date | string | undefined) => {
  if (!value) {
    return 'Updated just now';
  }

  const updatedAt = new Date(value);
  const ms = Date.now() - updatedAt.getTime();

  if (ms < 60 * 1000) {
    return 'Updated just now';
  }

  const minutes = Math.floor(ms / (60 * 1000));
  if (minutes < 60) {
    return `Updated ${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `Updated ${hours} hour${hours === 1 ? '' : 's'} ago`;
  }

  const days = Math.floor(hours / 24);
  return `Updated ${days} day${days === 1 ? '' : 's'} ago`;
};

export const toPromptVersion = (prompt: PromptLike) => ({
  id: String(prompt._id),
  name: prompt.name || 'Unnamed prompt',
  description: prompt.description || '',
  content: prompt.userPrompt || '',
  timestamp: humanizeRecency(prompt.updatedAt),
  status: prompt.isActive ? 'active' : 'draft',
  tags: Array.isArray(prompt.tags) ? prompt.tags : [],
});

export const toUploadedFile = (doc: DocumentLike) => {
  const status = toUploadedFileStatus(doc);

  return {
    id: String(doc._id),
    name: doc.originalFilename || 'unknown.pdf',
    size: Number(doc.fileSizeBytes || 0),
    status,
    progress: toUploadProgress(status),
    documentId: status === 'done' ? String(doc._id) : undefined,
  };
};

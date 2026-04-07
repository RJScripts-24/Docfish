import mongoose, { Schema, Document } from 'mongoose';

export interface ILineItem {
  description: string;
  quantity: number | null;
  unit_price: number | null;
  line_total: number | null;
}

export interface IExtractedData {
  vendor_name: string | null;
  invoice_number: string | null;
  invoice_date: string | null;
  currency: string | null;
  total_amount: number | null;
  tax_amount: number | null;
  line_items: ILineItem[];
}

export interface IValidationError {
  field: string;
  message: string;
  code: string;
}

export interface IDocument extends Document {
  originalFilename: string;
  mimeType: string;
  filePath: string;
  fileSizeBytes?: number;
  status: 'UPLOADED' | 'PROCESSING' | 'PROCESSED' | 'FAILED';
  extractedData: IExtractedData;
  confidenceScore?: number;
  validationErrors?: IValidationError[];
  processingTimeMs?: number;
  promptVersion?: number;
  rawText?: string;
  processingOptions?: {
    autoProcess: boolean;
    extractionMode: 'fast' | 'accurate';
    runValidation: boolean;
  };
  resultPayload?: {
    extractedData: IExtractedData;
    validation: {
      normalizedData: IExtractedData;
      confidenceScore: number;
      validationErrors: IValidationError[];
      isValid: boolean;
      extractionMethod: string;
    };
    rawText: string;
    promptVersion: number | null;
    processingTimeMs: number;
    extractionMethod: string;
    manuallyEdited?: boolean;
    manualEdits?: Array<{
      editedAt: Date;
      editedBy?: mongoose.Types.ObjectId | null;
      changedFields: string[];
    }>;
  };
  uploadedBy?: mongoose.Types.ObjectId;
  processingStartedAt?: Date;
  processedAt?: Date;
  errorMessage?: string;
  extractionMethod?: 'llm' | 'heuristic' | 'ocr_heuristic' | 'manual' | null;
  manuallyEdited?: boolean;
  manualEdits?: Array<{
    editedAt: Date;
    editedBy?: mongoose.Types.ObjectId | null;
    changedFields: string[];
  }>;
  retryCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const LineItemSchema: Schema = new Schema({
  description: { type: String, default: '' },
  quantity: { type: Number, default: null },
  unit_price: { type: Number, default: null },
  line_total: { type: Number, default: null }
}, { _id: false });

const ExtractedDataSchema: Schema = new Schema({
  vendor_name: { type: String, default: null },
  invoice_number: { type: String, default: null },
  invoice_date: { type: String, default: null },
  currency: { type: String, default: null },
  total_amount: { type: Number, default: null },
  tax_amount: { type: Number, default: null },
  line_items: { type: [LineItemSchema], default: [] },
}, { _id: false });

const ValidationErrorSchema: Schema = new Schema({
  field: { type: String, required: true },
  message: { type: String, required: true },
  code: { type: String, required: true },
}, { _id: false });

const DocumentSchema: Schema = new Schema({
  originalFilename: { type: String, required: true },
  mimeType: { type: String, required: true, default: 'application/pdf' },
  filePath: { type: String, required: true },
  fileSizeBytes: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['UPLOADED', 'PROCESSING', 'PROCESSED', 'FAILED'],
    default: 'UPLOADED'
  },
  extractedData: { type: ExtractedDataSchema, default: () => ({}) },
  confidenceScore: { type: Number, min: 0, max: 1, default: null },
  validationErrors: { type: [ValidationErrorSchema], default: [] },
  processingTimeMs: { type: Number, default: null },
  promptVersion: { type: Number, default: null },
  rawText: { type: String, default: '' },
  processingOptions: {
    autoProcess: { type: Boolean, default: true },
    extractionMode: {
      type: String,
      enum: ['fast', 'accurate'],
      default: 'accurate',
    },
    runValidation: { type: Boolean, default: true },
  },
  resultPayload: { type: Schema.Types.Mixed, default: null },
  extractionMethod: {
    type: String,
    enum: ['llm', 'heuristic', 'ocr_heuristic', 'manual'],
    default: null,
  },
  manuallyEdited: { type: Boolean, default: false },
  manualEdits: {
    type: [
      new Schema(
        {
          editedAt: { type: Date, required: true, default: Date.now },
          editedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
          changedFields: { type: [String], default: [] },
        },
        { _id: false }
      ),
    ],
    default: [],
  },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  processingStartedAt: { type: Date, default: null },
  processedAt: { type: Date, default: null },
  errorMessage: { type: String, default: null },
  retryCount: { type: Number, default: 0 },
}, {
  timestamps: true
});

DocumentSchema.index({ status: 1 });
DocumentSchema.index({ uploadedBy: 1, createdAt: -1 });

export default mongoose.model<IDocument>('Document', DocumentSchema);
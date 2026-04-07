import extractionService from '../../src/services/extraction.service';

const findById = jest.fn();
const saveJsonResult = jest.fn();
const getActivePrompt = jest.fn();
const getPromptById = jest.fn();
const extractTextFromPdf = jest.fn();
const extractTextViaOcr = jest.fn();

jest.mock('../../src/models/Document.model', () => ({
  __esModule: true,
  default: {
    findById: (...args: any[]) => findById(...args),
  },
}));

jest.mock('../../src/services/storage.service', () => ({
  __esModule: true,
  default: {
    saveJsonResult: (...args: any[]) => saveJsonResult(...args),
  },
}));

jest.mock('../../src/services/prompt.service', () => ({
  __esModule: true,
  default: {
    getActivePrompt: (...args: any[]) => getActivePrompt(...args),
    getPromptById: (...args: any[]) => getPromptById(...args),
  },
}));

jest.mock('../../src/utils/pdfParser', () => ({
  __esModule: true,
  extractTextFromPdf: (...args: any[]) => extractTextFromPdf(...args),
}));

jest.mock('../../src/utils/ocrParser', () => ({
  __esModule: true,
  extractTextViaOcr: (...args: any[]) => extractTextViaOcr(...args),
}));

describe('extractionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.GROQ_API_KEY;
  });

  it('uses OCR fallback for low-text documents and marks extraction as ocr_heuristic', async () => {
    extractTextFromPdf.mockResolvedValue('');
    extractTextViaOcr.mockResolvedValue(
      'Vendor: Acme Corp\nInvoice Number: INV-2026-1\nTotal Amount: 120.00\nTax Amount: 20.00\nDescription 1 100.00 100.00'
    );

    const result = await extractionService.extractFromPdf('/tmp/scan.pdf', {
      extractionMode: 'accurate',
    });

    expect(extractTextViaOcr).toHaveBeenCalled();
    expect(result.extractionMethod).toBe('ocr_heuristic');
    expect(result.rawText).toContain('Invoice Number');
  });

  it('recovers document processing for recoverable PDF parse errors', async () => {
    const documentRecord: any = {
      _id: { toString: () => 'doc-1' },
      originalFilename: 'invoice.pdf',
      mimeType: 'application/pdf',
      filePath: '/tmp/invoice.pdf',
      uploadedBy: null,
      processingStartedAt: new Date(),
      status: 'UPLOADED',
      save: jest.fn().mockResolvedValue(undefined),
    };

    findById.mockResolvedValue(documentRecord);

    const extractSpy = jest
      .spyOn(extractionService, 'extractFromPdf')
      .mockRejectedValue(new Error('bad xref table in pdf stream'));

    const result = await extractionService.processDocument({
      documentId: 'doc-1',
      filePath: '/tmp/invoice.pdf',
      originalFilename: 'invoice.pdf',
      mimeType: 'application/pdf',
      extractionMode: 'accurate',
    });

    expect(result.status).toBe('PROCESSED');
    expect(result.extractionMethod).toBe('ocr_heuristic');
    expect(result.validationErrors.some((item: any) => item.code === 'PDF_PARSE_WARNING')).toBe(true);
    expect(saveJsonResult).toHaveBeenCalled();

    extractSpy.mockRestore();
  });

  it('returns degraded prompt-test output when model credentials are unavailable', async () => {
    getPromptById.mockResolvedValue({
      _id: 'prompt-1',
      version: 3,
      systemPrompt: 'Extract invoice fields',
      userPrompt: 'Return JSON',
    });

    const result = await extractionService.testPromptVersion(
      'prompt-1',
      'Vendor: Acme\nInvoice Number: INV-9\nTotal Amount: 100\nTax Amount: 0'
    );

    expect(result.promptId).toBe('prompt-1');
    expect(result.promptVersion).toBe(3);
    expect(result.degradedMode).toBe(true);
    expect(result.degradedModeReason).toBe('MODEL_UNAVAILABLE');
    expect(result.modelBacked).toBe(false);
    expect(result.extractionMethod).toBe('heuristic');
  });
});

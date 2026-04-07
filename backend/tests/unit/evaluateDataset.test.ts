import fs from 'fs/promises';
import os from 'os';
import path from 'path';

describe('evaluateDataset runner', () => {
  const extractFromPdf = jest.fn();
  let tempRoot = '';

  beforeEach(async () => {
    jest.resetModules();
    extractFromPdf.mockReset();

    tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'docfish-eval-test-'));
    await fs.mkdir(path.join(tempRoot, 'dataset'), { recursive: true });
    await fs.mkdir(path.join(tempRoot, 'reports'), { recursive: true });

    await fs.writeFile(path.join(tempRoot, 'dataset', 'a.pdf'), Buffer.from('pdf-a'));
    await fs.writeFile(path.join(tempRoot, 'dataset', 'b.pdf'), Buffer.from('pdf-b'));
    await fs.writeFile(path.join(tempRoot, 'ground-truth.json'), JSON.stringify({}, null, 2));

    process.env.EVAL_DATASET_DIR = path.join(tempRoot, 'dataset');
    process.env.EVAL_OUTPUT_DIR = path.join(tempRoot, 'reports');
    process.env.EVAL_GROUND_TRUTH = path.join(tempRoot, 'ground-truth.json');

    jest.doMock('../../src/services/extraction.service', () => ({
      __esModule: true,
      default: {
        extractFromPdf: (...args: any[]) => extractFromPdf(...args),
      },
    }));
  });

  afterEach(async () => {
    delete process.env.EVAL_DATASET_DIR;
    delete process.env.EVAL_OUTPUT_DIR;
    delete process.env.EVAL_GROUND_TRUTH;

    if (tempRoot) {
      await fs.rm(tempRoot, { recursive: true, force: true });
    }
  });

  it('generates JSON and markdown reports with extraction path usage', async () => {
    extractFromPdf.mockResolvedValueOnce({
      extractedData: {
        vendor_name: 'A',
        invoice_number: 'INV-A',
        invoice_date: '2026-04-01',
        currency: 'USD',
        total_amount: 100,
        tax_amount: 0,
        line_items: [],
      },
      validation: {
        normalizedData: {
          vendor_name: 'A',
          invoice_number: 'INV-A',
          invoice_date: '2026-04-01',
          currency: 'USD',
          total_amount: 100,
          tax_amount: 0,
          line_items: [],
        },
        confidenceScore: 0.9,
        validationErrors: [],
        isValid: true,
        extractionMethod: 'llm',
      },
      rawText: 'invoice a',
      promptVersion: 1,
      processingTimeMs: 120,
      extractionMethod: 'llm',
    });

    extractFromPdf.mockResolvedValueOnce({
      extractedData: {
        vendor_name: 'B',
        invoice_number: null,
        invoice_date: null,
        currency: null,
        total_amount: null,
        tax_amount: null,
        line_items: [],
      },
      validation: {
        normalizedData: {
          vendor_name: 'B',
          invoice_number: null,
          invoice_date: null,
          currency: null,
          total_amount: null,
          tax_amount: null,
          line_items: [],
        },
        confidenceScore: 0.4,
        validationErrors: [
          {
            field: 'invoice_number',
            code: 'MISSING_FIELD',
            message: 'invoice_number is missing',
          },
        ],
        isValid: false,
        extractionMethod: 'ocr_heuristic',
      },
      rawText: 'invoice b',
      promptVersion: 1,
      processingTimeMs: 260,
      extractionMethod: 'ocr_heuristic',
    });

    const { runDatasetEvaluation } = require('../../src/scripts/evaluateDataset');
    const result = await runDatasetEvaluation();

    expect(result.report.summary.totalDocuments).toBe(2);
    expect(result.report.extractionPathUsage.llm).toBe(1);
    expect(result.report.extractionPathUsage.ocr_heuristic).toBe(1);

    const markdown = await fs.readFile(result.markdownReportPath, 'utf-8');
    expect(markdown).toContain('## Extraction Path Usage');

    const json = await fs.readFile(result.jsonReportPath, 'utf-8');
    expect(json).toContain('"extractionPathUsage"');
  });
});

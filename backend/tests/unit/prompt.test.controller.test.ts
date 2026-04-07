const testPromptVersion = jest.fn();

jest.mock('../../src/services/extraction.service', () => ({
  __esModule: true,
  default: {
    testPromptVersion: (...args: any[]) => testPromptVersion(...args),
  },
}));

import { testPromptV1 } from '../../src/controllers/apiV1.controller';

const makeRes = () => {
  const res: any = {};
  res.req = { method: 'POST', originalUrl: '/api/v1/prompts/prompt-1/test' };
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('testPromptV1', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('maps model-backed prompt test results to contract response shape', async () => {
    testPromptVersion.mockResolvedValue({
      promptId: 'prompt-1',
      promptVersion: 5,
      extractionMethod: 'llm',
      modelBacked: true,
      degradedMode: false,
      degradedModeReason: null,
      rawModelOutput: '{"vendor_name":"Acme"}',
      parsedOutput: { vendor_name: 'Acme', line_items: [] },
      normalizedOutput: {
        vendor_name: 'Acme',
        invoice_number: 'INV-101',
        invoice_date: '2026-04-01',
        currency: 'USD',
        total_amount: 100,
        tax_amount: 0,
        line_items: [],
      },
      validation: {
        normalizedData: {
          vendor_name: 'Acme',
          invoice_number: 'INV-101',
          invoice_date: '2026-04-01',
          currency: 'USD',
          total_amount: 100,
          tax_amount: 0,
          line_items: [],
        },
        confidenceScore: 0.95,
        validationErrors: [],
        isValid: true,
        extractionMethod: 'llm',
      },
      confidenceScore: 0.95,
      processingTimeMs: 1123,
    });

    const req: any = {
      params: { id: 'prompt-1' },
      body: { sampleText: 'Invoice text' },
    };
    const res = makeRes();

    await testPromptV1(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const payload = res.json.mock.calls[0][0];

    expect(payload.promptId).toBe('prompt-1');
    expect(payload.promptVersion).toBe(5);
    expect(payload.extractionMethod).toBe('llm');
    expect(payload.modelBacked).toBe(true);
    expect(payload.degradedMode).toBe(false);
    expect(payload.processingTimeMs).toBe(1123);
    expect(payload.normalizedOutput.vendor_name).toBe('Acme');
  });

  it('returns degraded-mode metadata when prompt test falls back', async () => {
    testPromptVersion.mockResolvedValue({
      promptId: 'prompt-1',
      promptVersion: 5,
      extractionMethod: 'heuristic',
      modelBacked: false,
      degradedMode: true,
      degradedModeReason: 'MODEL_UNAVAILABLE',
      rawModelOutput: null,
      parsedOutput: { vendor_name: 'Fallback Vendor', line_items: [] },
      normalizedOutput: {
        vendor_name: 'Fallback Vendor',
        invoice_number: null,
        invoice_date: null,
        currency: null,
        total_amount: null,
        tax_amount: null,
        line_items: [],
      },
      validation: {
        normalizedData: {
          vendor_name: 'Fallback Vendor',
          invoice_number: null,
          invoice_date: null,
          currency: null,
          total_amount: null,
          tax_amount: null,
          line_items: [],
        },
        confidenceScore: 0.41,
        validationErrors: [
          {
            field: 'invoice_number',
            code: 'MISSING_FIELD',
            message: 'invoice_number is missing',
          },
        ],
        isValid: false,
        extractionMethod: 'heuristic',
      },
      confidenceScore: 0.41,
      processingTimeMs: 431,
    });

    const req: any = {
      params: { id: 'prompt-1' },
      body: { sampleText: 'Invoice text' },
    };
    const res = makeRes();

    await testPromptV1(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const payload = res.json.mock.calls[0][0];

    expect(payload.modelBacked).toBe(false);
    expect(payload.degradedMode).toBe(true);
    expect(payload.degradedModeReason).toBe('MODEL_UNAVAILABLE');
    expect(Array.isArray(payload.validationResults)).toBe(true);
    expect(payload.validationResults[0].severity).toBe('warning');
  });
});

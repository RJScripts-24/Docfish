import express from 'express';
import request from 'supertest';

const uploadDocumentsV1 = jest.fn((req: any, res: any) => {
  res.status(202).json({ ok: true, path: req.path });
});
const downloadDocumentV1 = jest.fn((_req: any, res: any) => {
  res.status(200).json({ ok: true });
});

const passthrough = (_req: any, _res: any, next: any) => next();

const uploadFields = jest.fn(() => passthrough);
const protect = jest.fn(passthrough);
const uploadRateLimiter = jest.fn(passthrough);

jest.mock('../../src/middlewares/upload.middleware', () => ({
  __esModule: true,
  upload: {
    fields: uploadFields,
  },
}));

jest.mock('../../src/middlewares/auth.middleware', () => ({
  __esModule: true,
  protect,
}));

jest.mock('../../src/middlewares/rateLimit.middleware', () => ({
  __esModule: true,
  uploadRateLimiter,
}));

jest.mock('../../src/controllers/apiV1.controller', () => {
  const noop = (_req: any, res: any) => res.status(204).end();

  return {
    __esModule: true,
    authGoogle: noop,
    authGoogleCallback: noop,
    authGuest: noop,
    authMe: noop,
    authLogout: noop,
    listDocumentsV1: noop,
    uploadDocumentsV1,
    bulkDeleteDocumentsV1: noop,
    bulkReprocessDocumentsV1: noop,
    getDocumentDetailsV1: noop,
    updateDocumentV1: noop,
    deleteDocumentV1: noop,
    reprocessDocumentV1: noop,
    downloadDocumentV1,
    getUploadStatusV1: noop,
    getAnalyticsMetricsV1: noop,
    getDocumentsOverTimeV1: noop,
    getRecentDocumentsV1: noop,
    listErrorsV1: noop,
    getErrorsSummaryV1: noop,
    bulkRetryErrorsV1: noop,
    bulkDeleteErrorsV1: noop,
    retryAllFailedV1: noop,
    retryErrorDocumentV1: noop,
    deleteErrorDocumentV1: noop,
    listPromptsV1: noop,
    createPromptV1: noop,
    getPromptV1: noop,
    updatePromptV1: noop,
    deletePromptV1: noop,
    activatePromptV1: noop,
    testPromptV1: noop,
  };
});

describe('v1 upload routes', () => {
  let app: express.Express;

  beforeAll(() => {
    const router = require('../../src/routes/v1.routes').default;
    app = express();
    app.use(express.json());
    app.use('/api/v1', router);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('accepts uploads at POST /api/v1/documents', async () => {
    const response = await request(app).post('/api/v1/documents');

    expect(response.status).toBe(202);
    expect(uploadDocumentsV1).toHaveBeenCalledTimes(1);
    expect(uploadRateLimiter).toHaveBeenCalledTimes(1);
  });

  it('accepts uploads at POST /api/v1/documents/upload', async () => {
    const response = await request(app).post('/api/v1/documents/upload');

    expect(response.status).toBe(202);
    expect(uploadDocumentsV1).toHaveBeenCalledTimes(1);
    expect(uploadRateLimiter).toHaveBeenCalledTimes(1);
  });

  it('routes PDF download through GET /api/v1/documents/:id/download', async () => {
    const response = await request(app).get('/api/v1/documents/doc-1/download?format=pdf');

    expect(response.status).toBe(200);
    expect(downloadDocumentV1).toHaveBeenCalledTimes(1);
  });
});

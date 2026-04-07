import express from 'express';
import request from 'supertest';

jest.mock('../../src/middlewares/auth.middleware', () => ({
  __esModule: true,
  default: (req: any, _res: any, next: any) => {
    req.user = { userId: 'user-1', email: 'test@example.com' };
    next();
  },
}));

const saveUploadedFile = jest.fn();
const processDocument = jest.fn();
const reprocessDocument = jest.fn();
const listDocuments = jest.fn();
const getDocumentById = jest.fn();
const updateManualCorrections = jest.fn();
const uploadMiddleware = {
  array: jest.fn(() => (_req: any, _res: any, next: any) => next()),
  single: jest.fn(() => (_req: any, _res: any, next: any) => next()),
};

jest.mock('../../src/services/storage.service', () => ({
  __esModule: true,
  default: {
    saveUploadedFile: (...args: any[]) => saveUploadedFile(...args),
  },
}));

jest.mock('../../src/services/extraction.service', () => ({
  __esModule: true,
  default: {
    processDocument: (...args: any[]) => processDocument(...args),
    reprocessDocument: (...args: any[]) => reprocessDocument(...args),
  },
}));

jest.mock('../../src/services/document.service', () => ({
  __esModule: true,
  default: {
    listDocuments: (...args: any[]) => listDocuments(...args),
    getDocumentById: (...args: any[]) => getDocumentById(...args),
    updateManualCorrections: (...args: any[]) => updateManualCorrections(...args),
  },
}));

jest.mock('../../src/middlewares/upload.middleware', () => ({
  __esModule: true,
  default: uploadMiddleware,
}));

describe('document routes', () => {
  let app: express.Express;

  beforeAll(() => {
    const router = require('../../src/routes/document.routes').default;
    app = express();
    app.use(express.json());
    app.use('/api/documents', router);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lists processed invoices', async () => {
    listDocuments.mockResolvedValue({
      items: [
        {
          id: 'doc-1',
          originalFilename: 'invoice-1.pdf',
          status: 'PROCESSED',
        },
      ],
      total: 1,
    });

    const response = await request(app).get('/api/documents');

    expect(response.status).toBe(200);
    expect(response.body.items).toHaveLength(1);
    expect(listDocuments).toHaveBeenCalled();
  });

  it('gets extracted data by document id', async () => {
    getDocumentById.mockResolvedValue({
      id: 'doc-1',
      originalFilename: 'invoice-1.pdf',
      extractedData: {
        vendor_name: 'Acme Corp',
        invoice_number: 'INV-1001',
        invoice_date: '2026-03-12',
        currency: 'USD',
        total_amount: 150,
        tax_amount: 10,
        line_items: [],
      },
    });

    const response = await request(app).get('/api/documents/doc-1');

    expect(response.status).toBe(200);
    expect(response.body.id).toBe('doc-1');
    expect(getDocumentById).toHaveBeenCalledWith('doc-1', 'user-1');
  });

  it('reprocesses a document', async () => {
    reprocessDocument.mockResolvedValue({
      id: 'doc-1',
      status: 'PROCESSED',
    });

    const response = await request(app).post('/api/documents/reprocess/doc-1');

    expect(response.status).toBe(200);
    expect(response.body.message).toBeDefined();
    expect(reprocessDocument).toHaveBeenCalledWith('doc-1');
  });

  it('updates manual corrections', async () => {
    updateManualCorrections.mockResolvedValue({
      id: 'doc-1',
      extractedData: {
        vendor_name: 'Updated Vendor',
      },
    });

    const response = await request(app)
      .patch('/api/documents/doc-1')
      .send({
        extractedData: {
          vendor_name: 'Updated Vendor',
        },
      });

    expect(response.status).toBe(200);
    expect(updateManualCorrections).toHaveBeenCalledWith(
      'doc-1',
      { extractedData: { vendor_name: 'Updated Vendor' } },
      'user-1'
    );
  });

  it('uploads invoices and triggers processing', async () => {
    const fakeFiles = [
      {
        originalname: 'invoice-1.pdf',
        mimetype: 'application/pdf',
        buffer: Buffer.from('pdf-1'),
      },
      {
        originalname: 'invoice-2.pdf',
        mimetype: 'application/pdf',
        buffer: Buffer.from('pdf-2'),
      },
    ];

    uploadMiddleware.array.mockReturnValue((req: any, _res: any, next: any) => {
      req.files = fakeFiles;
      next();
    });

    saveUploadedFile
      .mockResolvedValueOnce({
        originalName: 'invoice-1.pdf',
        filename: 'stored-1.pdf',
        mimeType: 'application/pdf',
        size: 10,
        path: '/tmp/stored-1.pdf',
      })
      .mockResolvedValueOnce({
        originalName: 'invoice-2.pdf',
        filename: 'stored-2.pdf',
        mimeType: 'application/pdf',
        size: 10,
        path: '/tmp/stored-2.pdf',
      });

    processDocument
      .mockResolvedValueOnce({ id: 'doc-1', status: 'PROCESSED' })
      .mockResolvedValueOnce({ id: 'doc-2', status: 'PROCESSED' });

    const response = await request(app).post('/api/documents');

    expect(response.status).toBe(201);
    expect(saveUploadedFile).toHaveBeenCalledTimes(2);
    expect(processDocument).toHaveBeenCalledTimes(2);
  });
});
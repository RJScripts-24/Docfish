import express from 'express';
import request from 'supertest';

const createDocument = jest.fn();
const findDocuments = jest.fn();
const findDocumentById = jest.fn();
const processDocument = jest.fn();
const reprocessDocument = jest.fn();
let mockedFiles: any[] = [];

const uploadMiddleware = {
  fields: jest.fn(() => (req: any, _res: any, next: any) => {
    req.files = {
      files: mockedFiles,
    };
    next();
  }),
};

jest.mock('../../src/middlewares/auth.middleware', () => ({
  __esModule: true,
  protect: (req: any, _res: any, next: any) => {
    req.user = { userId: 'user-1', email: 'test@example.com' };
    next();
  },
}));

jest.mock('../../src/services/extraction.service', () => ({
  __esModule: true,
  default: {
    processDocument: (...args: any[]) => processDocument(...args),
    reprocessDocument: (...args: any[]) => reprocessDocument(...args),
  },
}));

jest.mock('../../src/models/Document.model', () => ({
  __esModule: true,
  default: {
    create: (...args: any[]) => createDocument(...args),
    find: (...args: any[]) => findDocuments(...args),
    findById: (...args: any[]) => findDocumentById(...args),
  },
}));

jest.mock('../../src/middlewares/upload.middleware', () => ({
  __esModule: true,
  upload: uploadMiddleware,
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
    mockedFiles = [];
  });

  it('lists processed invoices', async () => {
    const items = [{ id: 'doc-1', originalFilename: 'invoice-1.pdf', status: 'PROCESSED' }];
    findDocuments.mockReturnValue({
      select: jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(items),
      }),
    });

    const response = await request(app).get('/api/documents');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(findDocuments).toHaveBeenCalledWith({ uploadedBy: 'user-1' });
  });

  it('gets extracted data by document id', async () => {
    const document = {
      id: 'doc-1',
      originalFilename: 'invoice-1.pdf',
      uploadedBy: { toString: () => 'user-1' },
      extractedData: {
        vendor_name: 'Acme Corp',
        invoice_number: 'INV-1001',
        invoice_date: '2026-03-12',
        currency: 'USD',
        total_amount: 150,
        tax_amount: 10,
        line_items: [],
      },
    };

    findDocumentById.mockReturnValue({
      select: jest.fn().mockResolvedValue(document),
    });

    const response = await request(app).get('/api/documents/doc-1');

    expect(response.status).toBe(200);
    expect(response.body.id).toBe('doc-1');
    expect(findDocumentById).toHaveBeenCalledWith('doc-1');
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
    const existing = {
      id: 'doc-1',
      uploadedBy: { toString: () => 'user-1' },
      extractedData: {
        vendor_name: 'Initial Vendor',
      },
      save: jest.fn().mockResolvedValue({
        id: 'doc-1',
        extractedData: {
          vendor_name: 'Updated Vendor',
        },
      }),
    };

    findDocumentById.mockResolvedValue(existing);

    const response = await request(app)
      .patch('/api/documents/doc-1')
      .send({
        extractedData: {
          vendor_name: 'Updated Vendor',
        },
      });

    expect(response.status).toBe(200);
    expect(existing.save).toHaveBeenCalled();
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

    mockedFiles = fakeFiles;

    createDocument
      .mockResolvedValueOnce({
        _id: 'doc-1',
        filePath: '/tmp/stored-1.pdf',
        originalFilename: 'invoice-1.pdf',
        mimeType: 'application/pdf',
      })
      .mockResolvedValueOnce({
        _id: 'doc-2',
        filePath: '/tmp/stored-2.pdf',
        originalFilename: 'invoice-2.pdf',
        mimeType: 'application/pdf',
      });

    processDocument
      .mockResolvedValueOnce({ id: 'doc-1', status: 'PROCESSED' })
      .mockResolvedValueOnce({ id: 'doc-2', status: 'PROCESSED' });

    const response = await request(app).post('/api/documents');

    expect(response.status).toBe(201);
    expect(createDocument).toHaveBeenCalledTimes(2);
    expect(processDocument).toHaveBeenCalledTimes(2);
  });

});
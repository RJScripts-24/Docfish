import { Request, Response } from 'express';
import extractionService from '../services/extraction.service';
import Document from '../models/Document.model';
import validationService from '../services/validation.service';

const collectUploadedFiles = (req: Request): Express.Multer.File[] => {
  if (Array.isArray(req.files)) {
    return req.files;
  }

  if (req.files && typeof req.files === 'object') {
    const grouped = req.files as { [fieldname: string]: Express.Multer.File[] };
    const files = grouped.files || [];
    const single = grouped.file || [];
    return [...files, ...single];
  }

  if (req.file) {
    return [req.file];
  }

  return [];
};

export const uploadInvoices = async (req: Request, res: Response): Promise<void> => {
  try {
    const files = collectUploadedFiles(req);
    
    if (!files || files.length === 0) {
      res.status(400).json({ error: 'No files provided' });
      return;
    }

    const results = await Promise.all(
      files.map(async (file) => {
        const createdDocument = await Document.create({
          originalFilename: file.originalname,
          mimeType: file.mimetype || 'application/pdf',
          filePath: file.path,
          status: 'UPLOADED',
          uploadedBy: req.user?.userId || null,
        });

        return extractionService.processDocument({
          documentId: createdDocument._id.toString(),
          filePath: createdDocument.filePath,
          originalFilename: createdDocument.originalFilename,
          mimeType: createdDocument.mimeType,
          userId: req.user?.userId,
        });
      })
    );

    res.status(201).json(results);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getInvoices = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req.user?.userId ? { uploadedBy: req.user.userId } : {};
    const documents = await Document.find(query).select('-__v').sort({ createdAt: -1 });
    res.status(200).json(documents);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getInvoiceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const document = await Document.findById(id).select('-__v');
    
    if (!document) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    if (req.user?.userId && document.uploadedBy?.toString() !== req.user.userId) {
      res.status(403).json({ error: 'Not authorized to view this document' });
      return;
    }

    res.status(200).json(document);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const reprocessInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const existing = await Document.findById(id).select('uploadedBy');

    if (!existing) {
      res.status(404).json({ error: 'Document not found or unable to reprocess' });
      return;
    }

    if (req.user?.userId && existing.uploadedBy?.toString() !== req.user.userId) {
      res.status(403).json({ error: 'Not authorized to reprocess this document' });
      return;
    }

    const result = await extractionService.reprocessDocument(id);
    
    if (!result) {
      res.status(404).json({ error: 'Document not found or unable to reprocess' });
      return;
    }

    res.status(200).json({
      message: 'Document reprocessed successfully',
      document: result,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateInvoiceCorrections = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { extractedData } = req.body;

    const document = await Document.findById(id);

    if (!document) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    if (req.user?.userId && document.uploadedBy?.toString() !== req.user.userId) {
      res.status(403).json({ error: 'Not authorized to update this document' });
      return;
    }

    if (extractedData && typeof extractedData === 'object') {
      document.extractedData = {
        ...document.extractedData,
        ...extractedData,
      };

      const validation = validationService.validate(document.extractedData);

      document.extractedData = validation.normalizedData;
      document.validationErrors = validation.validationErrors;
      document.confidenceScore = validation.confidenceScore;
      document.status = 'PROCESSED';
      document.processedAt = new Date();
      document.errorMessage = null;
    }

    const updated = await document.save();
    res.status(200).json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
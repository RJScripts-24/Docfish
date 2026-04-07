import { Request, Response } from 'express';
import { processDocument, reprocessDocument } from '../services/extraction.service';
import Document from '../models/Document.model';

export const uploadInvoices = async (req: Request, res: Response): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      res.status(400).json({ error: 'No files provided' });
      return;
    }

    const results = await Promise.all(
      files.map(file => processDocument(file))
    );

    res.status(201).json(results);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getInvoices = async (req: Request, res: Response): Promise<void> => {
  try {
    const documents = await Document.find().select('-__v').sort({ createdAt: -1 });
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

    res.status(200).json(document);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const reprocessInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await reprocessDocument(id);
    
    if (!result) {
      res.status(404).json({ error: 'Document not found or unable to reprocess' });
      return;
    }

    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
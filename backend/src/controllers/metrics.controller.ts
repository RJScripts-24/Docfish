import { Request, Response } from 'express';
import Document from '../models/Document.model';

export const getMetrics = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalDocuments = await Document.countDocuments();
    
    const successfulDocuments = await Document.countDocuments({ status: 'SUCCESS' });
    const failedDocuments = await Document.countDocuments({ status: 'FAILED' });
    const pendingDocuments = await Document.countDocuments({ status: 'PENDING' });

    const completedDocuments = successfulDocuments + failedDocuments;
    
    const successRate = completedDocuments > 0 
      ? Number(((successfulDocuments / completedDocuments) * 100).toFixed(2))
      : 0;

    const processingStats = await Document.aggregate([
      { 
        $match: { 
          status: 'SUCCESS', 
          processingTimeMs: { $exists: true, $type: 'number' } 
        } 
      },
      { 
        $group: { 
          _id: null, 
          averageTime: { $avg: '$processingTimeMs' } 
        } 
      }
    ]);

    const averageProcessingTimeMs = processingStats.length > 0 
      ? Math.round(processingStats[0].averageTime) 
      : 0;

    res.status(200).json({
      metrics: {
        totalDocuments,
        successfulDocuments,
        failedDocuments,
        pendingDocuments,
        successRate,
        averageProcessingTimeMs
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
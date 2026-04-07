import { Request, Response } from 'express';
import Document from '../models/Document.model';

const buildScope = (req: Request) => (req.user?.userId ? { uploadedBy: req.user.userId } : {});

export const getMetrics = async (req: Request, res: Response): Promise<void> => {
  try {
    const scope = buildScope(req);
    const totalDocuments = await Document.countDocuments(scope);
    
    const successfulDocuments = await Document.countDocuments({ ...scope, status: 'PROCESSED' });
    const failedDocuments = await Document.countDocuments({ ...scope, status: 'FAILED' });
    const uploadedDocuments = await Document.countDocuments({ ...scope, status: 'UPLOADED' });
    const processingDocuments = await Document.countDocuments({ ...scope, status: 'PROCESSING' });
    const pendingDocuments = uploadedDocuments + processingDocuments;

    const completedDocuments = successfulDocuments + failedDocuments;
    
    const successRate = completedDocuments > 0 
      ? Number(((successfulDocuments / completedDocuments) * 100).toFixed(2))
      : 0;

    const processingStats = await Document.aggregate([
      {
        $match: {
          ...scope,
        },
      },
      { 
        $match: { 
          status: 'PROCESSED', 
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
        uploadedDocuments,
        processingDocuments,
        pendingDocuments,
        successRate,
        averageProcessingTimeMs
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getErrorReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const scope = buildScope(req);

    const [validationErrorsByCode, recentFailedDocuments] = await Promise.all([
      Document.aggregate([
        { $match: scope },
        { $unwind: '$validationErrors' },
        {
          $group: {
            _id: '$validationErrors.code',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),
      Document.find({ ...scope, status: 'FAILED' })
        .select('originalFilename errorMessage updatedAt')
        .sort({ updatedAt: -1 })
        .limit(20)
        .lean(),
    ]);

    res.status(200).json({
      errorReport: {
        validationErrorsByCode,
        recentFailedDocuments,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
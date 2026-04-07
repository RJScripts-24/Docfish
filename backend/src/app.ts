import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import connectDB from './config/db';
import authRoutes from './routes/auth.routes';
import documentRoutes from './routes/document.routes';
import metricsRoutes from './routes/metrics.routes';
import promptRoutes from './routes/prompt.routes';
import v1Routes from './routes/v1.routes';
import errorHandler from './middlewares/errorHandler.middleware';
import { protect } from './middlewares/auth.middleware';
import { reprocessInvoice } from './controllers/document.controller';

const app = express();

connectDB();

const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
  : [];

const defaultDevOrigins = ['http://localhost:3000', 'http://localhost:5173'];

const frameAncestors = Array.from(
  new Set([
    "'self'",
    ...corsOrigins.filter((origin) => origin !== '*'),
    ...(process.env.NODE_ENV === 'production' ? [] : defaultDevOrigins),
  ])
);

app.use(
  cors({
    origin: corsOrigins.length ? corsOrigins : '*',
    credentials: true,
  })
);
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        frameAncestors,
      },
    },
  })
);
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const uploadsDir = process.env.UPLOAD_DIR || path.resolve(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsDir));

app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.post('/api/reprocess/:id', protect, reprocessInvoice);
app.use('/api/metrics', metricsRoutes);
app.use('/api/prompts', promptRoutes);
app.use('/api/v1', v1Routes);

// Compatibility aliases without /api prefix for assignment contract.
app.use('/documents', documentRoutes);
app.post('/reprocess/:id', protect, reprocessInvoice);
app.use('/metrics', metricsRoutes);
app.use('/prompts', promptRoutes);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.use(errorHandler);

export default app;
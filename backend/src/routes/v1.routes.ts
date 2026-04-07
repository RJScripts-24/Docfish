import { Router } from 'express';
import { upload } from '../middlewares/upload.middleware';
import { protect } from '../middlewares/auth.middleware';
import { uploadRateLimiter } from '../middlewares/rateLimit.middleware';
import {
  activatePromptV1,
  authGoogle,
  authGoogleCallback,
  authGuest,
  authLogout,
  authMe,
  bulkDeleteDocumentsV1,
  bulkDeleteErrorsV1,
  bulkReprocessDocumentsV1,
  bulkRetryErrorsV1,
  createPromptV1,
  deleteDocumentV1,
  deleteErrorDocumentV1,
  deletePromptV1,
  downloadDocumentV1,
  getAnalyticsMetricsV1,
  getDocumentDetailsV1,
  getDocumentsOverTimeV1,
  getErrorsSummaryV1,
  getPromptV1,
  getRecentDocumentsV1,
  getUploadStatusV1,
  listDocumentsV1,
  listErrorsV1,
  listPromptsV1,
  reprocessDocumentV1,
  retryAllFailedV1,
  retryErrorDocumentV1,
  testPromptV1,
  updateDocumentV1,
  updatePromptV1,
  uploadDocumentsV1,
} from '../controllers/apiV1.controller';

const router = Router();

router.get('/auth/google', authGoogle);
router.get('/auth/google/callback', authGoogleCallback);
router.post('/auth/guest', authGuest);
router.get('/auth/me', protect, authMe);
router.post('/auth/logout', protect, authLogout);

router.get('/documents', protect, listDocumentsV1);
router.post(
  '/documents',
  protect,
  uploadRateLimiter,
  upload.fields([
    { name: 'files', maxCount: 50 },
    { name: 'file', maxCount: 1 },
  ]),
  uploadDocumentsV1
);
router.post(
  '/documents/upload',
  protect,
  uploadRateLimiter,
  upload.fields([
    { name: 'files', maxCount: 50 },
    { name: 'file', maxCount: 1 },
  ]),
  uploadDocumentsV1
);
router.post('/documents/bulk/delete', protect, bulkDeleteDocumentsV1);
router.post('/documents/bulk/reprocess', protect, bulkReprocessDocumentsV1);
router.get('/documents/:id', protect, getDocumentDetailsV1);
router.put('/documents/:id', protect, updateDocumentV1);
router.delete('/documents/:id', protect, deleteDocumentV1);
router.post('/documents/:id/reprocess', protect, reprocessDocumentV1);
router.get('/documents/:id/download', protect, downloadDocumentV1);

router.get('/uploads/:uploadId/status', protect, getUploadStatusV1);

router.get('/analytics/metrics', protect, getAnalyticsMetricsV1);
router.get('/analytics/documents-over-time', protect, getDocumentsOverTimeV1);
router.get('/analytics/recent-documents', protect, getRecentDocumentsV1);

router.get('/errors', protect, listErrorsV1);
router.get('/errors/summary', protect, getErrorsSummaryV1);
router.post('/errors/bulk/retry', protect, bulkRetryErrorsV1);
router.post('/errors/bulk/delete', protect, bulkDeleteErrorsV1);
router.post('/errors/retry-all-failed', protect, retryAllFailedV1);
router.post('/errors/:id/retry', protect, retryErrorDocumentV1);
router.delete('/errors/:id', protect, deleteErrorDocumentV1);

router.get('/prompts', protect, listPromptsV1);
router.post('/prompts', protect, createPromptV1);
router.get('/prompts/:id', protect, getPromptV1);
router.put('/prompts/:id', protect, updatePromptV1);
router.delete('/prompts/:id', protect, deletePromptV1);
router.post('/prompts/:id/activate', protect, activatePromptV1);
router.post('/prompts/:id/test', protect, testPromptV1);

export default router;

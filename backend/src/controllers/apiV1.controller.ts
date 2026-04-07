import { Request, Response } from 'express';
import path from 'path';
import crypto from 'crypto';
import mongoose from 'mongoose';
import Document from '../models/Document.model';
import Prompt from '../models/Prompt.model';
import extractionService from '../services/extraction.service';
import authService from '../services/auth.service';
import validationService from '../services/validation.service';
import storageService from '../services/storage.service';
import {
  classifyErrorType,
  toDocumentDetails,
  toErrorDocument,
  toInvoiceDocument,
  toPromptVersion,
  toPublicStatus,
  toUploadedFile,
  toExtractedField,
} from '../utils/apiContractMappers';

const sendApiError = (res: Response, status: number, error: string, message: string) => {
  if (status >= 500) {
    console.error('[API] Request failed', {
      method: res.req?.method,
      path: res.req?.originalUrl,
      status,
      error,
      message,
    });
  }

  res.status(status).json({ error, message });
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const parseBoolean = (value: unknown, fallback: boolean) => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') {
      return true;
    }
    if (value.toLowerCase() === 'false') {
      return false;
    }
  }

  return fallback;
};

const parseExtractionMode = (value: unknown): 'fast' | 'accurate' => {
  if (value === 'fast') {
    return 'fast';
  }

  return 'accurate';
};

const parseOAuthState = (value: unknown): { redirectUri?: string; nonce?: string } | null => {
  if (typeof value !== 'string' || !value) {
    return null;
  }

  try {
    const decoded = Buffer.from(value, 'base64url').toString('utf8');
    const parsed = JSON.parse(decoded) as { redirectUri?: string; nonce?: string };
    return parsed;
  } catch (_error) {
    return null;
  }
};

const buildOAuthRedirectUrl = (redirectUri: string, params: Record<string, string>) => {
  const url = new URL(redirectUri);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  return url.toString();
};

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

const buildScope = (req: Request) => (req.user?.userId ? { uploadedBy: req.user.userId } : {});

const canAccessDocument = (req: Request, uploadedBy: any) => {
  if (!req.user?.userId) {
    return true;
  }

  return uploadedBy && String(uploadedBy) === req.user.userId;
};

const queueReprocess = async (documentId: string) => {
  try {
    await Document.findByIdAndUpdate(documentId, { $inc: { retryCount: 1 } });
    void extractionService.reprocessDocument(documentId).catch((error: unknown) => {
      console.error('[Upload] Reprocess queue execution failed', {
        documentId,
        error: error instanceof Error ? { message: error.message, stack: error.stack } : String(error),
      });
      return null;
    });
  } catch (error) {
    console.error('[Upload] Failed to queue document reprocess', {
      documentId,
      error: error instanceof Error ? { message: error.message, stack: error.stack } : String(error),
    });
  }
};

const fieldMapping: Record<string, keyof NonNullable<any>> = {
  vendorName: 'vendor_name',
  invoiceNumber: 'invoice_number',
  invoiceDate: 'invoice_date',
  currency: 'currency',
  totalAmount: 'total_amount',
  taxAmount: 'tax_amount',
};

const parseNumberOrNull = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const matchesDateFilter = (value: string, dateFilter: string) => {
  if (dateFilter === 'all') {
    return true;
  }

  const targetDate = new Date(value);

  if (Number.isNaN(targetDate.getTime())) {
    return false;
  }

  const now = new Date();

  if (dateFilter === 'today') {
    return (
      targetDate.getDate() === now.getDate() &&
      targetDate.getMonth() === now.getMonth() &&
      targetDate.getFullYear() === now.getFullYear()
    );
  }

  if (dateFilter === 'week') {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);
    return targetDate >= weekStart;
  }

  if (dateFilter === 'month') {
    const monthStart = new Date(now);
    monthStart.setMonth(now.getMonth() - 1);
    monthStart.setHours(0, 0, 0, 0);
    return targetDate >= monthStart;
  }

  if (dateFilter === 'quarter') {
    const quarterStart = new Date(now);
    quarterStart.setMonth(now.getMonth() - 3);
    quarterStart.setHours(0, 0, 0, 0);
    return targetDate >= quarterStart;
  }

  return true;
};

const toChartLabelHour = (date: Date) => `${String(date.getHours()).padStart(2, '0')}:00`;

export const authGoogle = async (req: Request, res: Response): Promise<void> => {
  const statePayload = {
    redirectUri: typeof req.query.redirect_uri === 'string' ? req.query.redirect_uri : '',
    nonce: crypto.randomUUID(),
  };

  const state = Buffer.from(JSON.stringify(statePayload)).toString('base64url');

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const callbackUrl =
    process.env.GOOGLE_CALLBACK_URL || `${req.protocol}://${req.get('host')}/api/v1/auth/google/callback`;

  if (!clientId) {
    res.redirect(302, `${callbackUrl}?code=dev-google-code&state=${encodeURIComponent(state)}`);
    return;
  }

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', callbackUrl);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'openid email profile');
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'consent');
  authUrl.searchParams.set('state', state);

  res.redirect(302, authUrl.toString());
};

export const authGoogleCallback = async (req: Request, res: Response): Promise<void> => {
  const oauthState = parseOAuthState(req.query.state);
  const redirectUri =
    typeof oauthState?.redirectUri === 'string' && oauthState.redirectUri.trim()
      ? oauthState.redirectUri
      : '';

  try {
    const code = typeof req.query.code === 'string' ? req.query.code : '';

    if (!code) {
      if (redirectUri) {
        res.redirect(302, buildOAuthRedirectUrl(redirectUri, { error: 'Missing OAuth code' }));
        return;
      }
      sendApiError(res, 400, 'INVALID_OAUTH_CODE', 'Invalid OAuth code');
      return;
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const callbackUrl =
      process.env.GOOGLE_CALLBACK_URL || `${req.protocol}://${req.get('host')}/api/v1/auth/google/callback`;

    let email = '';
    let name = '';
    let avatarUrl = '';

    // Handle development/mock mode if credentials are missing
    if (!clientId || !clientSecret || code === 'dev-google-code') {
      console.warn('[AUTH] Google OAuth credentials missing or dev-code used, falling back to mock user');
      email = `google_${code.slice(0, 8)}@docfish.local`;
      name = 'Google User (Dev)';
    } else {
      // Exchange code for token
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: callbackUrl,
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json().catch(() => ({}));
        console.error('[AUTH] Google token exchange failed', errorData);
        throw new Error('Failed to exchange code for token');
      }

      const tokenPayload = (await tokenResponse.json()) as { access_token?: string };

      if (!tokenPayload.access_token) {
        throw new Error('Google did not return an access token');
      }

      // Get user info
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${tokenPayload.access_token}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user info from Google');
      }

      const userPayload = (await userResponse.json()) as {
        email?: string;
        name?: string;
        picture?: string;
      };

      if (!userPayload.email) {
        throw new Error('Google did not return an email address');
      }

      email = userPayload.email;
      name = userPayload.name || 'Google User';
      avatarUrl = userPayload.picture || '';
    }

    const authResponse = await authService.createOrGetSocialUser({
      email,
      name,
      avatarUrl,
    });

    if (redirectUri) {
      res.redirect(
        302,
        buildOAuthRedirectUrl(redirectUri, {
          token: authResponse.token,
          user: JSON.stringify(authResponse.user),
        })
      );
      return;
    }

    res.status(200).json(authResponse);
  } catch (error: any) {
    console.error('[AUTH] Google OAuth callback error:', error);
    if (redirectUri) {
      res.redirect(
        302,
        buildOAuthRedirectUrl(redirectUri, {
          error: error.message || 'Google OAuth callback failed',
        })
      );
      return;
    }

    sendApiError(res, 500, 'AUTH_ERROR', error.message || 'Google OAuth callback failed');
  }
};

export const authGuest = async (_req: Request, res: Response): Promise<void> => {
  try {
    const authResponse = await authService.createGuestSession();
    res.status(200).json(authResponse);
  } catch (error: any) {
    sendApiError(res, 500, 'AUTH_ERROR', error.message || 'Failed to create guest session');
  }
};

export const authMe = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.userId) {
      sendApiError(res, 401, 'UNAUTHORIZED', 'Unauthorized');
      return;
    }

    const user = await authService.getUserById(req.user.userId);
    res.status(200).json(user);
  } catch (_error) {
    sendApiError(res, 401, 'UNAUTHORIZED', 'Unauthorized');
  }
};

export const authLogout = async (_req: Request, res: Response): Promise<void> => {
  res.status(204).send();
};

export const listDocumentsV1 = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const requestedLimit = Number(req.query.limit || 10);
    const limit = [10, 25, 50, 100].includes(requestedLimit) ? requestedLimit : 10;
    const status = typeof req.query.status === 'string' ? req.query.status : 'all';
    const dateFilter = typeof req.query.dateFilter === 'string' ? req.query.dateFilter : 'all';
    const sort = typeof req.query.sort === 'string' ? req.query.sort : 'date-desc';
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';

    const query: any = buildScope(req);

    if (search) {
      const pattern = new RegExp(escapeRegExp(search), 'i');
      query.$or = [
        { originalFilename: pattern },
        { 'extractedData.vendor_name': pattern },
        { 'extractedData.invoice_number': pattern },
      ];
    }

    const sortSpec: any =
      sort === 'date-asc'
        ? { 'extractedData.invoice_date': 1, createdAt: 1 }
        : sort === 'amount-desc'
        ? { 'extractedData.total_amount': -1, createdAt: -1 }
        : sort === 'amount-asc'
        ? { 'extractedData.total_amount': 1, createdAt: 1 }
        : sort === 'confidence-desc'
        ? { confidenceScore: -1, createdAt: -1 }
        : sort === 'confidence-asc'
        ? { confidenceScore: 1, createdAt: 1 }
        : { 'extractedData.invoice_date': -1, createdAt: -1 };

    const docs = await Document.find(query).sort(sortSpec).lean();

    let transformed = docs.map((doc) => toInvoiceDocument(doc));

    if (search) {
      transformed = transformed.filter((item) => {
        const amountString = String(item.amount);
        const joined = `${item.id} ${item.name} ${item.vendor} ${amountString}`.toLowerCase();
        return joined.includes(search.toLowerCase());
      });
    }

    if (status !== 'all') {
      transformed = transformed.filter((item) => item.status === status);
    }

    if (dateFilter !== 'all') {
      transformed = transformed.filter((item) => matchesDateFilter(item.invoiceDate, dateFilter));
    }

    const totalCount = transformed.length;
    const start = (page - 1) * limit;
    const data = transformed.slice(start, start + limit);

    res.status(200).json({ data, totalCount, page, limit });
  } catch (error: any) {
    sendApiError(res, 500, 'INTERNAL_ERROR', error.message || 'Failed to list documents');
  }
};

export const uploadDocumentsV1 = async (req: Request, res: Response): Promise<void> => {
  try {
    const files = collectUploadedFiles(req);

    if (files.length === 0) {
      sendApiError(res, 400, 'BAD_REQUEST', 'Invalid file type or missing files');
      return;
    }

    const autoProcess = parseBoolean(req.body.autoProcess, true);
    const extractionMode = parseExtractionMode(req.body.extractionMode);
    const runValidation = parseBoolean(req.body.runValidation, true);

    const uploads = await Promise.all(
      files.map(async (file) => {
        const document = await Document.create({
          originalFilename: file.originalname,
          mimeType: file.mimetype || 'application/pdf',
          filePath: file.path,
          fileSizeBytes: file.size || 0,
          status: 'UPLOADED',
          uploadedBy: req.user?.userId || null,
          processingOptions: {
            autoProcess,
            extractionMode,
            runValidation,
          },
        });

        if (autoProcess) {
          void extractionService
            .processDocument({
              documentId: String(document._id),
              filePath: document.filePath,
              originalFilename: document.originalFilename,
              mimeType: document.mimeType,
              userId: req.user?.userId,
              extractionMode,
              runValidation,
            })
            .catch((error: unknown) => {
              console.error('[Upload] Async document processing failed', {
                documentId: String(document._id),
                filename: document.originalFilename,
                error: error instanceof Error ? { message: error.message, stack: error.stack } : String(error),
              });
              return null;
            });
        }

        console.info('[Upload] Accepted document upload', {
          documentId: String(document._id),
          filename: document.originalFilename,
          mimeType: document.mimeType,
          sizeBytes: document.fileSizeBytes,
          autoProcess,
          extractionMode,
          runValidation,
          uploadedBy: req.user?.userId || null,
        });

        return toUploadedFile(document);
      })
    );

    res.status(202).json({ uploads });
  } catch (error: any) {
    sendApiError(res, 500, 'INTERNAL_ERROR', error.message || 'Upload failed');
  }
};

export const getDocumentDetailsV1 = async (req: Request, res: Response): Promise<void> => {
  try {
    const document = await Document.findById(req.params.id).lean();

    if (!document) {
      sendApiError(res, 404, 'NOT_FOUND', `Document ${req.params.id} not found`);
      return;
    }

    if (!canAccessDocument(req, document.uploadedBy)) {
      sendApiError(res, 404, 'NOT_FOUND', `Document ${req.params.id} not found`);
      return;
    }

    res.status(200).json(toDocumentDetails(req, document));
  } catch (error: any) {
    sendApiError(res, 500, 'INTERNAL_ERROR', error.message || 'Failed to fetch document details');
  }
};

export const updateDocumentV1 = async (req: Request, res: Response): Promise<void> => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      sendApiError(res, 404, 'NOT_FOUND', `Document ${req.params.id} not found`);
      return;
    }

    if (!canAccessDocument(req, document.uploadedBy)) {
      sendApiError(res, 404, 'NOT_FOUND', `Document ${req.params.id} not found`);
      return;
    }

    const extractedFields = req.body?.extractedFields;
    const lineItems = req.body?.lineItems;
    const changedFields = new Set<string>();

    const nextData = {
      ...document.extractedData,
    } as any;

    if (extractedFields && typeof extractedFields === 'object') {
      for (const [fieldKey, fieldValue] of Object.entries(extractedFields)) {
        const internalField = fieldMapping[fieldKey];

        if (!internalField) {
          continue;
        }

        const incomingValue = fieldValue === '' ? null : fieldValue;
        const currentValue = (nextData as any)[internalField];

        if (currentValue !== incomingValue) {
          changedFields.add(fieldKey);
        }

        if (internalField === 'total_amount' || internalField === 'tax_amount') {
          nextData[internalField] = parseNumberOrNull(fieldValue);
        } else {
          nextData[internalField] = fieldValue;
        }
      }
    }

    if (Array.isArray(lineItems)) {
      changedFields.add('lineItems');
      nextData.line_items = lineItems.map((item: any) => ({
        description: String(item.description || '').trim(),
        quantity: parseNumberOrNull(item.quantity),
        unit_price: parseNumberOrNull(item.unitPrice),
        line_total: parseNumberOrNull(item.total),
      }));
    }

    const validation = validationService.validate(nextData, {
      extractionMethod: 'manual',
    });

    document.extractedData = validation.normalizedData as any;
    document.validationErrors = validation.validationErrors;
    document.confidenceScore = validation.confidenceScore;
    document.status = 'PROCESSED';
    document.extractionMethod = 'manual';
    document.manuallyEdited = true;
    const editedBy =
      req.user?.userId && mongoose.Types.ObjectId.isValid(req.user.userId)
        ? new mongoose.Types.ObjectId(req.user.userId)
        : null;
    document.manualEdits = [
      ...(document.manualEdits || []),
      {
        editedAt: new Date(),
        editedBy,
        changedFields: [...changedFields],
      },
    ];
    document.errorMessage = null;
    document.processedAt = new Date();
    document.resultPayload = {
      extractedData: document.extractedData,
      validation,
      rawText: document.rawText || '',
      promptVersion: document.promptVersion || null,
      processingTimeMs: document.processingTimeMs || 0,
      extractionMethod: document.extractionMethod || 'manual',
      manuallyEdited: document.manuallyEdited || false,
      manualEdits: document.manualEdits || [],
    } as any;

    const updated = await document.save();
    await storageService.saveJsonResult(String(updated._id), updated.resultPayload);

    res.status(200).json(toDocumentDetails(req, updated.toObject()));
  } catch (error: any) {
    sendApiError(res, 500, 'INTERNAL_ERROR', error.message || 'Failed to update document');
  }
};

export const deleteDocumentV1 = async (req: Request, res: Response): Promise<void> => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      sendApiError(res, 404, 'NOT_FOUND', `Document ${req.params.id} not found`);
      return;
    }

    if (!canAccessDocument(req, document.uploadedBy)) {
      sendApiError(res, 404, 'NOT_FOUND', `Document ${req.params.id} not found`);
      return;
    }

    await storageService.deleteFile(document.filePath);
    await storageService.deleteJsonResult(String(document._id));
    await Document.findByIdAndDelete(document._id);

    res.status(204).send();
  } catch (error: any) {
    sendApiError(res, 500, 'INTERNAL_ERROR', error.message || 'Failed to delete document');
  }
};

export const reprocessDocumentV1 = async (req: Request, res: Response): Promise<void> => {
  try {
    const document = await Document.findById(req.params.id).select('_id uploadedBy');

    if (!document) {
      sendApiError(res, 404, 'NOT_FOUND', `Document ${req.params.id} not found`);
      return;
    }

    if (!canAccessDocument(req, document.uploadedBy)) {
      sendApiError(res, 404, 'NOT_FOUND', `Document ${req.params.id} not found`);
      return;
    }

    await queueReprocess(String(document._id));

    res.status(202).json({
      message: `Document ${req.params.id} queued for reprocessing`,
    });
  } catch (error: any) {
    sendApiError(res, 500, 'INTERNAL_ERROR', error.message || 'Failed to reprocess document');
  }
};

export const downloadDocumentV1 = async (req: Request, res: Response): Promise<void> => {
  try {
    const format = typeof req.query.format === 'string' ? req.query.format : '';
    const document = await Document.findById(req.params.id);

    if (!document) {
      sendApiError(res, 404, 'NOT_FOUND', `Document ${req.params.id} not found`);
      return;
    }

    if (!canAccessDocument(req, document.uploadedBy)) {
      sendApiError(res, 404, 'NOT_FOUND', `Document ${req.params.id} not found`);
      return;
    }

    if (format === 'json') {
      res.status(200).json(toDocumentDetails(req, document.toObject()));
      return;
    }

    if (format !== 'pdf') {
      sendApiError(res, 400, 'BAD_REQUEST', 'format must be one of pdf or json');
      return;
    }

    res.download(path.resolve(document.filePath), document.originalFilename);
  } catch (error: any) {
    sendApiError(res, 500, 'INTERNAL_ERROR', error.message || 'Failed to download document');
  }
};

export const bulkDeleteDocumentsV1 = async (req: Request, res: Response): Promise<void> => {
  try {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];

    if (ids.length === 0) {
      sendApiError(res, 400, 'BAD_REQUEST', 'No IDs provided or validation failure');
      return;
    }

    const query = {
      _id: { $in: ids },
      ...buildScope(req),
    };

    const documents = await Document.find(query).select('_id filePath').lean();

    await Promise.all(
      documents.map(async (doc) => {
        await storageService.deleteFile(doc.filePath);
        await storageService.deleteJsonResult(String(doc._id));
      })
    );
    await Document.deleteMany(query);

    res.status(204).send();
  } catch (error: any) {
    sendApiError(res, 500, 'INTERNAL_ERROR', error.message || 'Failed to bulk delete documents');
  }
};

export const bulkReprocessDocumentsV1 = async (req: Request, res: Response): Promise<void> => {
  try {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];

    if (ids.length === 0) {
      sendApiError(res, 400, 'BAD_REQUEST', 'No IDs provided or validation failure');
      return;
    }

    const documents = await Document.find({
      _id: { $in: ids },
      ...buildScope(req),
    })
      .select('_id')
      .lean();

    await Promise.all(documents.map((doc) => queueReprocess(String(doc._id))));

    res.status(202).json({ message: `${documents.length} documents queued for reprocessing` });
  } catch (error: any) {
    sendApiError(res, 500, 'INTERNAL_ERROR', error.message || 'Failed to bulk reprocess documents');
  }
};

export const getUploadStatusV1 = async (req: Request, res: Response): Promise<void> => {
  try {
    const document = await Document.findById(req.params.uploadId).lean();

    if (!document) {
      sendApiError(res, 404, 'NOT_FOUND', 'Upload job not found');
      return;
    }

    if (!canAccessDocument(req, document.uploadedBy)) {
      sendApiError(res, 404, 'NOT_FOUND', 'Upload job not found');
      return;
    }

    res.status(200).json(toUploadedFile(document));
  } catch (error: any) {
    sendApiError(res, 500, 'INTERNAL_ERROR', error.message || 'Failed to fetch upload status');
  }
};

export const getAnalyticsMetricsV1 = async (req: Request, res: Response): Promise<void> => {
  try {
    const docs = await Document.find(buildScope(req))
      .select('status processingTimeMs validationErrors')
      .lean();

    const totalDocuments = docs.length;
    const successfulDocs = docs.filter((doc) => toPublicStatus(doc) === 'success').length;
    const failedDocs = docs.filter((doc) => toPublicStatus(doc) === 'failed').length;
    const completedDocs = successfulDocs + failedDocs;

    const successRate = completedDocs > 0 ? Number(((successfulDocs / completedDocs) * 100).toFixed(1)) : 0;

    const processingTimes = docs
      .map((doc) => (typeof doc.processingTimeMs === 'number' ? doc.processingTimeMs : 0))
      .filter((value) => value > 0);

    const avgProcessingTimeMs =
      processingTimes.length > 0
        ? Math.round(processingTimes.reduce((sum, value) => sum + value, 0) / processingTimes.length)
        : 0;

    const validationErrors = docs.filter((doc) => toPublicStatus(doc) === 'review').length;

    res.status(200).json({
      totalDocuments,
      avgProcessingTime: `${(avgProcessingTimeMs / 1000).toFixed(1)}s`,
      successRate,
      validationErrors,
    });
  } catch (error: any) {
    sendApiError(res, 500, 'INTERNAL_ERROR', error.message || 'Failed to fetch dashboard metrics');
  }
};

export const getDocumentsOverTimeV1 = async (req: Request, res: Response): Promise<void> => {
  try {
    const timeRange = typeof req.query.timeRange === 'string' ? req.query.timeRange : '7d';
    const now = new Date();

    if (!['24h', '7d', '30d'].includes(timeRange)) {
      sendApiError(res, 400, 'BAD_REQUEST', 'timeRange must be one of 24h, 7d, 30d');
      return;
    }

    const rangeStart =
      timeRange === '24h'
        ? new Date(now.getTime() - 24 * 60 * 60 * 1000)
        : timeRange === '7d'
        ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const docs = await Document.find({
      ...buildScope(req),
      createdAt: { $gte: rangeStart, $lte: now },
    })
      .select('createdAt')
      .lean();

    const createdTimes = docs.map((doc) => new Date(doc.createdAt).getTime());

    if (timeRange === '24h') {
      const bucketSizeMs = 4 * 60 * 60 * 1000;
      const points = Array.from({ length: 6 }).map((_, index) => {
        const start = new Date(now.getTime() - (5 - index) * bucketSizeMs);
        const end = new Date(start.getTime() + bucketSizeMs);
        const documents = createdTimes.filter(
          (createdAtMs) => createdAtMs >= start.getTime() && createdAtMs < end.getTime()
        ).length;

        return {
          label: toChartLabelHour(start),
          documents,
        };
      });

      res.status(200).json(points);
      return;
    }

    if (timeRange === '7d') {
      const oneDayMs = 24 * 60 * 60 * 1000;
      const formatter = new Intl.DateTimeFormat('en-US', { weekday: 'short' });

      const points = Array.from({ length: 7 }).map((_, index) => {
        const start = new Date(now.getTime() - (6 - index) * oneDayMs);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(end.getDate() + 1);

        const documents = createdTimes.filter(
          (createdAtMs) => createdAtMs >= start.getTime() && createdAtMs < end.getTime()
        ).length;

        return {
          label: formatter.format(start),
          documents,
        };
      });

      res.status(200).json(points);
      return;
    }

    const weekSizeMs = 7 * 24 * 60 * 60 * 1000;
    const startBoundary = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);

    const points = Array.from({ length: 4 }).map((_, index) => {
      const start = new Date(startBoundary.getTime() + index * weekSizeMs);
      const end = new Date(start.getTime() + weekSizeMs);
      const documents = createdTimes.filter(
        (createdAtMs) => createdAtMs >= start.getTime() && createdAtMs < end.getTime()
      ).length;

      return {
        label: `Week ${index + 1}`,
        documents,
      };
    });

    res.status(200).json(points);
  } catch (error: any) {
    sendApiError(res, 500, 'INTERNAL_ERROR', error.message || 'Failed to fetch chart data');
  }
};

export const getRecentDocumentsV1 = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = Math.max(1, Number(req.query.limit || 5));

    const docs = await Document.find(buildScope(req)).sort({ createdAt: -1 }).limit(limit).lean();
    res.status(200).json(docs.map((doc) => toInvoiceDocument(doc)));
  } catch (error: any) {
    sendApiError(res, 500, 'INTERNAL_ERROR', error.message || 'Failed to fetch recent documents');
  }
};

export const listErrorsV1 = async (req: Request, res: Response): Promise<void> => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search.toLowerCase() : '';
    const errorTypeFilter = typeof req.query.errorType === 'string' ? req.query.errorType : 'all';
    const statusFilter = typeof req.query.status === 'string' ? req.query.status : 'all';
    const requestedDateFilter = typeof req.query.dateFilter === 'string' ? req.query.dateFilter : 'all';
    const dateFilter =
      requestedDateFilter === 'week'
        ? 'this-week'
        : requestedDateFilter === 'month'
        ? 'this-month'
        : requestedDateFilter;

    const docs = await Document.find(buildScope(req))
      .select('originalFilename extractedData status errorMessage updatedAt validationErrors retryCount')
      .lean();

    const asErrors = docs
      .map((doc) => toErrorDocument(doc))
      .filter((doc) => doc.status === 'failed' || doc.status === 'review');

    const filtered = asErrors.filter((doc) => {
      if (search) {
        const joined = `${doc.id} ${doc.name} ${doc.vendor} ${doc.errorMessage}`.toLowerCase();
        if (!joined.includes(search)) {
          return false;
        }
      }

      if (errorTypeFilter !== 'all' && doc.errorType !== errorTypeFilter) {
        return false;
      }

      if (statusFilter !== 'all' && doc.status !== statusFilter) {
        return false;
      }

      if (dateFilter !== 'all') {
        const lastAttemptDate = new Date(doc.lastAttempt);
        const now = new Date();

        if (dateFilter === 'today') {
          const sameDay =
            lastAttemptDate.getDate() === now.getDate() &&
            lastAttemptDate.getMonth() === now.getMonth() &&
            lastAttemptDate.getFullYear() === now.getFullYear();
          if (!sameDay) {
            return false;
          }
        }

        if (dateFilter === 'this-week') {
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          weekStart.setHours(0, 0, 0, 0);

          if (lastAttemptDate < weekStart) {
            return false;
          }
        }

        if (dateFilter === 'this-month') {
          if (
            lastAttemptDate.getMonth() !== now.getMonth() ||
            lastAttemptDate.getFullYear() !== now.getFullYear()
          ) {
            return false;
          }
        }
      }

      return true;
    });

    res.status(200).json(filtered);
  } catch (error: any) {
    sendApiError(res, 500, 'INTERNAL_ERROR', error.message || 'Failed to fetch errors');
  }
};

export const getErrorsSummaryV1 = async (req: Request, res: Response): Promise<void> => {
  try {
    const docs = await Document.find(buildScope(req))
      .select('status validationErrors errorMessage')
      .lean();

    const failedCount = docs.filter((doc) => doc.status === 'FAILED').length;
    const reviewCount = docs.filter(
      (doc) => doc.status !== 'FAILED' && (doc.validationErrors || []).length > 0
    ).length;
    const validationFailuresCount = docs.filter((doc) => classifyErrorType(doc) === 'validation').length;

    const totalDocuments = docs.length;
    const successCount = docs.filter((doc) => toPublicStatus(doc) === 'success').length;
    const successRate = totalDocuments > 0 ? Number(((successCount / totalDocuments) * 100).toFixed(1)) : 0;

    res.status(200).json({
      failedCount,
      reviewCount,
      validationFailuresCount,
      successRate,
    });
  } catch (error: any) {
    sendApiError(res, 500, 'INTERNAL_ERROR', error.message || 'Failed to fetch error summary');
  }
};

export const retryErrorDocumentV1 = async (req: Request, res: Response): Promise<void> => {
  try {
    const document = await Document.findById(req.params.id).select('_id uploadedBy');

    if (!document || !canAccessDocument(req, document.uploadedBy)) {
      sendApiError(res, 404, 'NOT_FOUND', 'Document not found');
      return;
    }

    await queueReprocess(String(document._id));
    res.status(202).json({ message: `Document ${req.params.id} queued for retry` });
  } catch (error: any) {
    sendApiError(res, 500, 'INTERNAL_ERROR', error.message || 'Failed to retry document');
  }
};

export const deleteErrorDocumentV1 = async (req: Request, res: Response): Promise<void> => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document || !canAccessDocument(req, document.uploadedBy)) {
      sendApiError(res, 404, 'NOT_FOUND', 'Document not found');
      return;
    }

    await storageService.deleteFile(document.filePath);
    await Document.findByIdAndDelete(document._id);

    res.status(204).send();
  } catch (error: any) {
    sendApiError(res, 500, 'INTERNAL_ERROR', error.message || 'Failed to delete document');
  }
};

export const bulkRetryErrorsV1 = async (req: Request, res: Response): Promise<void> => {
  try {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];

    if (ids.length === 0) {
      sendApiError(res, 400, 'BAD_REQUEST', 'No IDs provided or validation failure');
      return;
    }

    const docs = await Document.find({
      _id: { $in: ids },
      ...buildScope(req),
    })
      .select('_id')
      .lean();

    await Promise.all(docs.map((doc) => queueReprocess(String(doc._id))));

    res.status(202).json({ message: `${docs.length} documents queued for retry` });
  } catch (error: any) {
    sendApiError(res, 500, 'INTERNAL_ERROR', error.message || 'Failed to retry documents');
  }
};

export const bulkDeleteErrorsV1 = async (req: Request, res: Response): Promise<void> => {
  try {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];

    if (ids.length === 0) {
      sendApiError(res, 400, 'BAD_REQUEST', 'No IDs provided or validation failure');
      return;
    }

    const query = {
      _id: { $in: ids },
      ...buildScope(req),
    };

    const documents = await Document.find(query).select('filePath').lean();
    await Promise.all(documents.map((doc) => storageService.deleteFile(doc.filePath)));
    await Document.deleteMany(query);

    res.status(204).send();
  } catch (error: any) {
    sendApiError(res, 500, 'INTERNAL_ERROR', error.message || 'Failed to delete documents');
  }
};

export const retryAllFailedV1 = async (req: Request, res: Response): Promise<void> => {
  try {
    const docs = await Document.find({ ...buildScope(req), status: 'FAILED' }).select('_id').lean();
    await Promise.all(docs.map((doc) => queueReprocess(String(doc._id))));

    res.status(202).json({ message: 'All failed documents queued for retry' });
  } catch (error: any) {
    sendApiError(res, 500, 'INTERNAL_ERROR', error.message || 'Failed to retry failed documents');
  }
};

export const listPromptsV1 = async (_req: Request, res: Response): Promise<void> => {
  try {
    const ownerId = _req.user?.userId || null;
    const prompts = await Prompt.find({ $or: [{ createdBy: null }, { createdBy: ownerId }] })
      .sort({ createdBy: 1, updatedAt: -1 })
      .lean();
    res.status(200).json(prompts.map((prompt) => toPromptVersion(prompt)));
  } catch (error: any) {
    sendApiError(res, 500, 'INTERNAL_ERROR', error.message || 'Failed to list prompts');
  }
};

export const createPromptV1 = async (req: Request, res: Response): Promise<void> => {
  try {
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
    const content = typeof req.body?.content === 'string' ? req.body.content : '';

    if (!name || !content) {
      sendApiError(res, 400, 'BAD_REQUEST', 'name and content are required');
      return;
    }

    const ownerId = req.user?.userId || null;
    const latestPrompt = await Prompt.findOne({ name }).sort({ version: -1 }).lean();
    const nextVersion = latestPrompt ? Number(latestPrompt.version || 0) + 1 : 1;

    const tags = Array.isArray(req.body?.tags)
      ? req.body.tags.filter((value: unknown) => typeof value === 'string')
      : [];

    const prompt = await Prompt.create({
      name,
      version: nextVersion,
      description: typeof req.body?.description === 'string' ? req.body.description : '',
      systemPrompt:
        'You extract invoice data into structured JSON with strong field fidelity. Return strict JSON only.',
      userPrompt: content,
      tags,
      isActive: false,
      createdBy: ownerId,
    });

    res.status(201).json(toPromptVersion(prompt.toObject()));
  } catch (error: any) {
    sendApiError(res, 500, 'INTERNAL_ERROR', error.message || 'Failed to create prompt version');
  }
};

export const getPromptV1 = async (req: Request, res: Response): Promise<void> => {
  try {
    const ownerId = req.user?.userId || null;
    const prompt = await Prompt.findOne({ _id: req.params.id, $or: [{ createdBy: null }, { createdBy: ownerId }] }).lean();

    if (!prompt) {
      sendApiError(res, 404, 'NOT_FOUND', 'Prompt version not found');
      return;
    }

    res.status(200).json(toPromptVersion(prompt));
  } catch (error: any) {
    sendApiError(res, 500, 'INTERNAL_ERROR', error.message || 'Failed to fetch prompt version');
  }
};

export const updatePromptV1 = async (req: Request, res: Response): Promise<void> => {
  try {
    const ownerId = req.user?.userId || null;
    const prompt = await Prompt.findOne({ _id: req.params.id, createdBy: ownerId });

    if (!prompt) {
      sendApiError(res, 404, 'NOT_FOUND', 'Prompt version not found');
      return;
    }

    if (typeof req.body?.name === 'string') {
      prompt.name = req.body.name.trim();
    }

    if (typeof req.body?.description === 'string') {
      prompt.description = req.body.description;
    }

    if (typeof req.body?.content === 'string') {
      prompt.userPrompt = req.body.content;
    }

    if (Array.isArray(req.body?.tags)) {
      prompt.tags = req.body.tags.filter((value: unknown) => typeof value === 'string');
    }

    if (req.body?.status === 'active') {
      await Prompt.updateMany({ createdBy: ownerId }, { $set: { isActive: false } });
      prompt.isActive = true;
    }

    if (req.body?.status === 'draft') {
      prompt.isActive = false;
    }

    await prompt.save();

    res.status(200).json(toPromptVersion(prompt.toObject()));
  } catch (error: any) {
    sendApiError(res, 500, 'INTERNAL_ERROR', error.message || 'Failed to update prompt version');
  }
};

export const deletePromptV1 = async (req: Request, res: Response): Promise<void> => {
  try {
    const ownerId = req.user?.userId || null;
    const prompt = await Prompt.findOne({ _id: req.params.id, createdBy: ownerId });

    if (!prompt) {
      sendApiError(res, 404, 'NOT_FOUND', 'Prompt version not found');
      return;
    }

    if (prompt.isActive) {
      sendApiError(res, 409, 'CONFLICT', 'Cannot delete the currently active version');
      return;
    }

    await Prompt.findOneAndDelete({ _id: prompt._id, createdBy: ownerId });

    res.status(204).send();
  } catch (error: any) {
    sendApiError(res, 500, 'INTERNAL_ERROR', error.message || 'Failed to delete prompt version');
  }
};

export const activatePromptV1 = async (req: Request, res: Response): Promise<void> => {
  try {
    const ownerId = req.user?.userId || null;
    const prompt = await Prompt.findOne({ _id: req.params.id, createdBy: ownerId });

    if (!prompt) {
      sendApiError(res, 404, 'NOT_FOUND', 'Prompt version not found');
      return;
    }

    await Prompt.updateMany({ createdBy: ownerId }, { $set: { isActive: false } });
    prompt.isActive = true;
    await prompt.save();

    res.status(200).json(toPromptVersion(prompt.toObject()));
  } catch (error: any) {
    sendApiError(res, 500, 'INTERNAL_ERROR', error.message || 'Failed to activate prompt version');
  }
};

export const testPromptV1 = async (req: Request, res: Response): Promise<void> => {
  try {
    const sampleText = typeof req.body?.sampleText === 'string' ? req.body.sampleText : '';

    if (!sampleText.trim()) {
      sendApiError(res, 400, 'BAD_REQUEST', 'sampleText is required');
      return;
    }

    const promptTestResult = await extractionService.testPromptVersion(req.params.id, sampleText, req.user?.userId);
    const confidence = Math.round(promptTestResult.confidenceScore * 100);
    const validationResults =
      promptTestResult.validation.validationErrors.length > 0
        ? promptTestResult.validation.validationErrors.map((error) => ({
            passed: false,
            title: (error.code || 'VALIDATION_ERROR').replace(/_/g, ' '),
            message: error.message || 'Validation failed',
            severity: (error.code || '').startsWith('MISSING_') ? 'warning' : 'error',
            field: error.field,
            code: error.code,
          }))
        : [
            {
              passed: true,
              title: 'Validation Passed',
              message: 'No validation errors were found in this prompt test.',
              severity: 'ok',
              field: null,
              code: null,
            },
          ];

    res.status(200).json({
      promptId: promptTestResult.promptId,
      promptVersion: promptTestResult.promptVersion,
      extractionMethod: promptTestResult.extractionMethod,
      modelBacked: promptTestResult.modelBacked,
      degradedMode: promptTestResult.degradedMode,
      degradedModeReason: promptTestResult.degradedModeReason,
      extractedFields: {
        vendorName: toExtractedField(promptTestResult.normalizedOutput.vendor_name, confidence),
        invoiceNumber: toExtractedField(promptTestResult.normalizedOutput.invoice_number, confidence),
        invoiceDate: toExtractedField(promptTestResult.normalizedOutput.invoice_date, confidence),
        currency: toExtractedField(promptTestResult.normalizedOutput.currency, confidence),
        totalAmount: toExtractedField(promptTestResult.normalizedOutput.total_amount, confidence),
        taxAmount: toExtractedField(promptTestResult.normalizedOutput.tax_amount, confidence),
      },
      normalizedOutput: promptTestResult.normalizedOutput,
      validationResults,
      rawModelOutput: promptTestResult.rawModelOutput,
      rawOutput: JSON.stringify(promptTestResult.parsedOutput || promptTestResult.normalizedOutput, null, 2),
      processingTime: `${(promptTestResult.processingTimeMs / 1000).toFixed(1)}s`,
      processingTimeMs: promptTestResult.processingTimeMs,
      overallConfidence: confidence,
    });
  } catch (error: any) {
    if ((error?.message || '').toLowerCase().includes('prompt not found')) {
      sendApiError(res, 404, 'NOT_FOUND', 'Prompt version not found');
      return;
    }

    sendApiError(res, 500, 'INTERNAL_ERROR', error.message || 'Failed to test prompt');
  }
};

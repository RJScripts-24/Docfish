import { clearStoredSession, readAuthToken } from './session';
import {
  AuthResponse,
  AuthUser,
  DashboardMetrics,
  DocumentChartPoint,
  DocumentDetails,
  DocumentListResponse,
  ErrorDocument,
  ErrorSummary,
  InvoiceDocument,
  PromptTestResult,
  PromptVersion,
  UploadJob,
} from './types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

type ResponseType = 'json' | 'blob' | 'text';

interface RequestOptions extends Omit<RequestInit, 'body'> {
  auth?: boolean;
  body?: BodyInit | object | null;
  responseType?: ResponseType;
}

export interface UploadRequestOptions {
  autoProcess?: boolean;
  extractionMode?: 'fast' | 'accurate';
  runValidation?: boolean;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function resolveUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

async function parseError(response: Response): Promise<string> {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    const payload = (await response.json()) as { message?: string; error?: string };
    return payload.message || payload.error || `Request failed with status ${response.status}`;
  }

  const text = await response.text();
  return text || `Request failed with status ${response.status}`;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth = true, body, headers, responseType = 'json', ...rest } = options;
  const token = auth ? readAuthToken() : null;
  const nextHeaders = new Headers(headers || {});
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  if (!isFormData && body !== undefined && body !== null && !nextHeaders.has('Content-Type')) {
    nextHeaders.set('Content-Type', 'application/json');
  }

  if (token && !nextHeaders.has('Authorization')) {
    nextHeaders.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(resolveUrl(path), {
    ...rest,
    headers: nextHeaders,
    body: isFormData
      ? (body as BodyInit)
      : body !== undefined && body !== null && typeof body !== 'string'
      ? JSON.stringify(body)
      : (body as BodyInit | null | undefined),
  });

  if (!response.ok) {
    if (response.status === 401 && auth) {
      clearStoredSession();
    }

    throw new ApiError(await parseError(response), response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  if (responseType === 'blob') {
    return (await response.blob()) as T;
  }

  if (responseType === 'text') {
    return (await response.text()) as T;
  }

  return (await response.json()) as T;
}

export function getGoogleAuthUrl(redirectUri: string): string {
  const url = new URL(resolveUrl('/api/v1/auth/google'), window.location.origin);
  url.searchParams.set('redirect_uri', redirectUri);
  return url.toString();
}

export async function createGuestSession(): Promise<AuthResponse> {
  return request<AuthResponse>('/api/v1/auth/guest', {
    method: 'POST',
    auth: false,
  });
}

export async function getCurrentUser(): Promise<AuthUser> {
  return request<AuthUser>('/api/v1/auth/me');
}

export async function logoutSession(): Promise<void> {
  return request<void>('/api/v1/auth/logout', {
    method: 'POST',
  });
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  return request<DashboardMetrics>('/api/v1/analytics/metrics');
}

export async function getDocumentsOverTime(timeRange: '24h' | '7d' | '30d'): Promise<DocumentChartPoint[]> {
  const params = new URLSearchParams({ timeRange });
  return request<DocumentChartPoint[]>(`/api/v1/analytics/documents-over-time?${params.toString()}`);
}

export async function getRecentDocuments(limit = 5): Promise<InvoiceDocument[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  return request<InvoiceDocument[]>(`/api/v1/analytics/recent-documents?${params.toString()}`);
}

export async function listDocuments(params: {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  sort?: string;
  dateFilter?: string;
}): Promise<DocumentListResponse> {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
    search: params.search || '',
    status: params.status || 'all',
    sort: params.sort || 'date-desc',
    dateFilter: params.dateFilter || 'all',
  });

  return request<DocumentListResponse>(`/api/v1/documents?${searchParams.toString()}`);
}

export async function uploadDocuments(
  files: File[],
  options: UploadRequestOptions = {}
): Promise<{ uploads: UploadJob[] }> {
  const formData = new FormData();
  const {
    autoProcess = true,
    extractionMode = 'accurate',
    runValidation = true,
  } = options;

  files.forEach((file) => formData.append('files', file));
  formData.append('autoProcess', String(autoProcess));
  formData.append('extractionMode', extractionMode);
  formData.append('runValidation', String(runValidation));

  return request<{ uploads: UploadJob[] }>('/api/v1/documents', {
    method: 'POST',
    body: formData,
  });
}

export async function getUploadStatus(uploadId: string): Promise<UploadJob> {
  return request<UploadJob>(`/api/v1/uploads/${uploadId}/status`);
}

export async function getDocumentDetails(documentId: string): Promise<DocumentDetails> {
  return request<DocumentDetails>(`/api/v1/documents/${documentId}`);
}

export async function updateDocument(
  documentId: string,
  payload: {
    extractedFields: Record<string, string | null>;
    lineItems: Array<{
      description: string;
      quantity: number | null;
      unitPrice: number | null;
      total: number | null;
    }>;
  }
): Promise<DocumentDetails> {
  return request<DocumentDetails>(`/api/v1/documents/${documentId}`, {
    method: 'PUT',
    body: payload,
  });
}

export async function reprocessDocument(documentId: string): Promise<{ message: string }> {
  return request<{ message: string }>(`/api/v1/documents/${documentId}/reprocess`, {
    method: 'POST',
  });
}

export async function deleteDocument(documentId: string): Promise<void> {
  return request<void>(`/api/v1/documents/${documentId}`, {
    method: 'DELETE',
  });
}

export async function bulkDeleteDocuments(ids: string[]): Promise<void> {
  return request<void>('/api/v1/documents/bulk/delete', {
    method: 'POST',
    body: { ids },
  });
}

export async function bulkReprocessDocuments(ids: string[]): Promise<{ message: string }> {
  return request<{ message: string }>('/api/v1/documents/bulk/reprocess', {
    method: 'POST',
    body: { ids },
  });
}

export async function downloadDocumentJson(documentId: string): Promise<DocumentDetails> {
  return request<DocumentDetails>(`/api/v1/documents/${documentId}/download?format=json`);
}

export async function downloadDocumentPdf(documentId: string): Promise<Blob> {
  return request<Blob>(`/api/v1/documents/${documentId}/download?format=pdf`, {
    responseType: 'blob',
  });
}

export async function listErrors(params: {
  search?: string;
  errorType?: string;
  status?: string;
  dateFilter?: string;
}): Promise<ErrorDocument[]> {
  const searchParams = new URLSearchParams({
    search: params.search || '',
    errorType: params.errorType || 'all',
    status: params.status || 'all',
    dateFilter: params.dateFilter || 'all',
  });

  return request<ErrorDocument[]>(`/api/v1/errors?${searchParams.toString()}`);
}

export async function getErrorSummary(): Promise<ErrorSummary> {
  return request<ErrorSummary>('/api/v1/errors/summary');
}

export async function retryError(documentId: string): Promise<{ message: string }> {
  return request<{ message: string }>(`/api/v1/errors/${documentId}/retry`, {
    method: 'POST',
  });
}

export async function deleteError(documentId: string): Promise<void> {
  return request<void>(`/api/v1/errors/${documentId}`, {
    method: 'DELETE',
  });
}

export async function bulkRetryErrors(ids: string[]): Promise<{ message: string }> {
  return request<{ message: string }>('/api/v1/errors/bulk/retry', {
    method: 'POST',
    body: { ids },
  });
}

export async function bulkDeleteErrors(ids: string[]): Promise<void> {
  return request<void>('/api/v1/errors/bulk/delete', {
    method: 'POST',
    body: { ids },
  });
}

export async function retryAllFailedErrors(): Promise<{ message: string }> {
  return request<{ message: string }>('/api/v1/errors/retry-all-failed', {
    method: 'POST',
  });
}

export async function listPrompts(): Promise<PromptVersion[]> {
  return request<PromptVersion[]>('/api/v1/prompts');
}

export async function createPrompt(payload: {
  name: string;
  description: string;
  content: string;
  tags?: string[];
}): Promise<PromptVersion> {
  return request<PromptVersion>('/api/v1/prompts', {
    method: 'POST',
    body: payload,
  });
}

export async function updatePrompt(
  promptId: string,
  payload: {
    name?: string;
    description?: string;
    content?: string;
    status?: 'active' | 'draft';
    tags?: string[];
  }
): Promise<PromptVersion> {
  return request<PromptVersion>(`/api/v1/prompts/${promptId}`, {
    method: 'PUT',
    body: payload,
  });
}

export async function deletePrompt(promptId: string): Promise<void> {
  return request<void>(`/api/v1/prompts/${promptId}`, {
    method: 'DELETE',
  });
}

export async function activatePrompt(promptId: string): Promise<PromptVersion> {
  return request<PromptVersion>(`/api/v1/prompts/${promptId}/activate`, {
    method: 'POST',
  });
}

export async function testPrompt(promptId: string, sampleText: string): Promise<PromptTestResult> {
  return request<PromptTestResult>(`/api/v1/prompts/${promptId}/test`, {
    method: 'POST',
    body: { sampleText },
  });
}

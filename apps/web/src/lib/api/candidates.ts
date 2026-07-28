import { apiAction, apiCreate, apiDelete, apiGet, apiList, apiRequest, apiUpdate, type ListQuery } from './client';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from './auth-storage';
import type { CandidateDto, CandidateListItem, LoginRequest, TokenPair, ApiDataResponse } from './types';
import type { ResumeExtractionResponse } from './ai/resume-extraction.types';

export type ResumeExtractDraftResult = {
  candidate: CandidateDto;
  extraction: ResumeExtractionResponse;
};

export type CandidateImportPreview = {
  batchId: number;
  fileName: string;
  expiresAt: string;
  canConfirm: boolean;
  sheetCounts: Record<string, number>;
  created: number;
  updated: number;
  skipped: number;
  failed: number;
  errors: Array<{
    sheetName: string;
    rowNumber?: number;
    sourceCandidateId?: string;
    columnName?: string;
    suppliedValue?: string;
    errorCode: string;
    message: string;
  }>;
  rows: Array<{
    rowNumber: number;
    sourceCandidateId: string;
    email: string | null;
    firstName: string;
    lastName: string;
    source: string;
    action: 'CREATE' | 'UPDATE' | 'SKIP' | 'FAIL';
    existingCandidateId: number | null;
    errorMessage: string | null;
  }>;
};

export type CandidateImportBatch = {
  batchId: number;
  fileName: string;
  status: string;
  created: number;
  updated: number;
  skipped: number;
  failed: number;
  processed: number;
  total: number;
  errorSummary: string | null;
  expiresAt: string;
  confirmedAt: string | null;
  completedAt: string | null;
  createdAt: string | null;
  uploadedBy: string | null;
  hasErrorReport: boolean;
  hasSourceFile: boolean;
  canConfirm: boolean;
};

export type CandidateImportHistoryItem = {
  batchId: number;
  fileName: string;
  status: string;
  created: number;
  updated: number;
  skipped: number;
  failed: number;
  processed: number;
  total: number;
  errorSummary: string | null;
  uploadedBy: string;
  createdAt: string;
  completedAt: string | null;
  hasErrorReport: boolean;
  hasSourceFile: boolean;
};

export type CandidateImportErrorItem = {
  id: number;
  sheetName: string;
  rowNumber: number | null;
  sourceCandidateId: string | null;
  columnName: string | null;
  suppliedValue: string | null;
  errorCode: string;
  message: string;
};

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? '/api/v1';

async function downloadAuthenticatedBlob(path: string, fallbackName: string): Promise<void> {
  const headers: Record<string, string> = { Accept: '*/*' };
  const token = getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let response = await fetch(`${BASE_URL}${path}`, { headers });
  if (response.status === 401 && getRefreshToken()) {
    const refreshResponse = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: getRefreshToken() }),
    });
    if (refreshResponse.ok) {
      const json = (await refreshResponse.json()) as ApiDataResponse<TokenPair>;
      const portal = localStorage.getItem('bestal-portal') as LoginRequest['portal'] | null;
      if (portal) setTokens(json.data, portal);
      else {
        localStorage.setItem('bestal-access-token', json.data.accessToken);
        localStorage.setItem('bestal-refresh-token', json.data.refreshToken);
      }
      headers.Authorization = `Bearer ${json.data.accessToken}`;
      response = await fetch(`${BASE_URL}${path}`, { headers });
    } else {
      clearTokens();
    }
  }

  if (!response.ok) {
    throw new Error('Failed to download file');
  }

  const blob = await response.blob();
  const disposition = response.headers.get('Content-Disposition');
  const match = disposition?.match(/filename="?([^"]+)"?/i);
  const fileName = match?.[1] ?? fallbackName;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export const candidatesApi = {
  list: (query?: ListQuery) => apiList<CandidateListItem>('/candidates', query),
  get: (id: number) => apiGet<CandidateDto>(`/candidates/${id}`),
  create: (body: Record<string, unknown>) => apiCreate<CandidateDto>('/candidates', body),
  update: (id: number, body: Record<string, unknown>) =>
    apiUpdate<CandidateDto>(`/candidates/${id}`, body),
  delete: (id: number) => apiDelete(`/candidates/${id}`),
  approve: (id: number) => apiAction<CandidateDto>(`/candidates/${id}/approve`),
  reject: (id: number, reason?: string) =>
    apiAction<CandidateDto>(`/candidates/${id}/reject`, reason ? { reason } : {}),
  sendBack: (id: number, reason?: string) =>
    apiAction<CandidateDto>(`/candidates/${id}/send-back`, reason ? { reason } : {}),
  publish: (id: number) => apiAction<CandidateDto>(`/candidates/${id}/publish`),
  hide: (id: number) => apiAction<CandidateDto>(`/candidates/${id}/hide`),
  runAiScreening: (id: number, body?: Record<string, unknown>) =>
    apiAction<CandidateDto>(`/candidates/${id}/pipeline/ai-screening`, body ?? {}),
  completeRecruiterReview: (id: number, body?: Record<string, unknown>) =>
    apiAction<CandidateDto>(`/candidates/${id}/pipeline/recruiter-review`, body ?? {}),
  completePricing: (id: number) =>
    apiAction<CandidateDto>(`/candidates/${id}/pipeline/pricing`),
  submitForApproval: (id: number) =>
    apiAction<CandidateDto>(`/candidates/${id}/pipeline/submit`),
  /** Node uploads resume to bucket, calls Python AI, creates or updates SOURCED draft. */
  extractResume: async (
    file: File,
    existingCandidateId?: number,
  ): Promise<ResumeExtractDraftResult> => {
    const form = new FormData();
    form.append('file', file, file.name);
    if (existingCandidateId != null && existingCandidateId > 0) {
      form.append('candidateId', String(existingCandidateId));
    }
    const json = await apiRequest<{ data: ResumeExtractDraftResult }>(
      '/candidates/extract-resume',
      { method: 'POST', body: form },
    );
    return json.data;
  },
  downloadImportTemplate: () =>
    downloadAuthenticatedBlob(
      '/candidates/imports/template',
      'bestal-candidate-import-template.xlsx',
    ),
  enqueueImport: async (file: File): Promise<CandidateImportBatch> => {
    const form = new FormData();
    form.append('file', file, file.name);
    const json = await apiRequest<{ data: CandidateImportBatch }>(
      '/candidates/imports',
      { method: 'POST', body: form },
    );
    return json.data;
  },
  listImportHistory: (query?: { page?: number; limit?: number }) =>
    apiList<CandidateImportHistoryItem>('/candidates/imports', query),
  listImportErrors: (batchId: number, query?: { page?: number; limit?: number }) =>
    apiList<CandidateImportErrorItem>(`/candidates/imports/${batchId}/errors`, query),
  previewImport: async (file: File): Promise<CandidateImportPreview> => {
    const form = new FormData();
    form.append('file', file, file.name);
    const json = await apiRequest<{ data: CandidateImportPreview }>(
      '/candidates/imports/preview',
      { method: 'POST', body: form },
    );
    return json.data;
  },
  confirmImport: async (batchId: number): Promise<CandidateImportBatch> => {
    const json = await apiRequest<{ data: CandidateImportBatch }>(
      `/candidates/imports/${batchId}/confirm`,
      { method: 'POST', body: {} },
    );
    return json.data;
  },
  getImportBatch: (batchId: number) =>
    apiGet<CandidateImportBatch>(`/candidates/imports/${batchId}`),
  downloadImportErrorReport: (batchId: number) =>
    downloadAuthenticatedBlob(
      `/candidates/imports/${batchId}/error-report`,
      `candidate-import-errors-${batchId}.xlsx`,
    ),
  downloadImportSourceFile: (batchId: number, fileName?: string) =>
    downloadAuthenticatedBlob(
      `/candidates/imports/${batchId}/file`,
      fileName ?? `candidate-import-${batchId}.xlsx`,
    ),
};

type CandidateAssetKind = 'resume' | 'profile-image' | 'intro-video';

/** Uploads a candidate asset through the API (server stores to S3 / local). */
export async function uploadCandidateFile(
  id: number,
  kind: CandidateAssetKind,
  file: File,
): Promise<CandidateDto> {
  const form = new FormData();
  form.append('file', file, file.name);
  const json = await apiRequest<{ data: CandidateDto }>(`/candidates/${id}/${kind}`, {
    method: 'POST',
    body: form,
  });
  return json.data;
}

import { apiAction, apiCreate, apiGet, apiList, apiRequest, apiUpdate, type ListQuery } from './client';
import type { EvaluationExtractionResponse } from './ai/evaluation-extraction.types';
import type { BgvExtractionResponse } from './ai/bgv-extraction.types';
import type { BackgroundCheckDto, BackgroundCheckListItem, EvaluationListItem } from './types';

export type EvaluationExtractResult = {
  extraction: EvaluationExtractionResponse;
  liveAi: boolean;
};

export type BgvExtractResult = {
  extraction: BgvExtractionResponse;
  liveAi: boolean;
};

export const evaluationsApi = {
  list: (query?: ListQuery) => apiList<EvaluationListItem>('/evaluations', query),
  get: (id: number) => apiGet<EvaluationListItem>(`/evaluations/${id}`),
  create: (body: Record<string, unknown>) => apiCreate<EvaluationListItem>('/evaluations', body),
  update: (id: number, body: Record<string, unknown>) =>
    apiUpdate<EvaluationListItem>(`/evaluations/${id}`, body),
  /** Node uploads file payload to Python evaluater (or static stub) and returns extraction. */
  extractEvaluation: async (
    file: File,
    candidateId?: number,
  ): Promise<EvaluationExtractResult> => {
    const form = new FormData();
    form.append('file', file, file.name);
    if (candidateId != null && candidateId > 0) {
      form.append('candidateId', String(candidateId));
    }
    const json = await apiRequest<{ data: EvaluationExtractResult }>(
      '/evaluations/extract-evaluation',
      { method: 'POST', body: form },
    );
    return json.data;
  },
};

export const backgroundChecksApi = {
  list: (query?: ListQuery) => apiList<BackgroundCheckListItem>('/background-checks', query),
  get: (id: number) => apiGet<BackgroundCheckDto>(`/background-checks/${id}`),
  create: (body: Record<string, unknown>) =>
    apiCreate<BackgroundCheckDto>('/background-checks', body),
  update: (id: number, body: Record<string, unknown>) =>
    apiUpdate<BackgroundCheckDto>(`/background-checks/${id}`, body),
  /** Node → Python bg_verifier (or static stub). */
  extractBgv: async (file: File, candidateId?: number): Promise<BgvExtractResult> => {
    const form = new FormData();
    form.append('file', file, file.name);
    if (candidateId != null && candidateId > 0) {
      form.append('candidateId', String(candidateId));
    }
    const json = await apiRequest<{ data: BgvExtractResult }>(
      '/background-checks/extract-bgv',
      { method: 'POST', body: form },
    );
    return json.data;
  },
  confirmConsent: (id: number) =>
    apiAction<BackgroundCheckDto>(`/background-checks/${id}/confirm-consent`),
  assignVendor: (id: number, provider: string) =>
    apiAction<BackgroundCheckDto>(`/background-checks/${id}/assign-vendor`, { provider }),
  startVerification: (id: number) =>
    apiAction<BackgroundCheckDto>(`/background-checks/${id}/start-verification`),
  submitForReview: (id: number) =>
    apiAction<BackgroundCheckDto>(`/background-checks/${id}/submit-for-review`),
  approve: (id: number) =>
    apiAction<BackgroundCheckDto>(`/background-checks/${id}/approve`),
  reject: (id: number, notes?: string) =>
    apiAction<BackgroundCheckDto>(`/background-checks/${id}/reject`, notes ? { notes } : {}),
  requestClarification: (id: number, notes: string) =>
    apiAction<BackgroundCheckDto>(`/background-checks/${id}/request-clarification`, { notes }),
  reopen: (id: number) =>
    apiAction<BackgroundCheckDto>(`/background-checks/${id}/reopen`),
  uploadDocument: async (
    id: number,
    kind: 'CONSENT' | 'SUPPORTING' | 'REPORT',
    file: File,
  ): Promise<BackgroundCheckDto> => {
    const form = new FormData();
    form.append('file', file, file.name);
    form.append('kind', kind);
    const json = await apiRequest<{ data: BackgroundCheckDto }>(
      `/background-checks/${id}/documents?kind=${encodeURIComponent(kind)}`,
      { method: 'POST', body: form },
    );
    return json.data;
  },
};

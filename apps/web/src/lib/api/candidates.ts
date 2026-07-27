import { apiAction, apiCreate, apiDelete, apiGet, apiList, apiRequest, apiUpdate, type ListQuery } from './client';
import type { CandidateDto, CandidateListItem } from './types';
import type { ResumeExtractionResponse } from './ai/resume-extraction.types';

export type ResumeExtractDraftResult = {
  candidate: CandidateDto;
  extraction: ResumeExtractionResponse;
};

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
  importCsv: async (file: File) => {
    const form = new FormData();
    form.append('file', file, file.name);
    const json = await apiRequest<{
      data: {
        created: number;
        updated: number;
        skipped: number;
        failed: number;
      };
    }>('/candidates/import-csv', {
      method: 'POST',
      body: form,
    });
    return json.data;
  },
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

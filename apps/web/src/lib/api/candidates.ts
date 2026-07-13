import { apiAction, apiCreate, apiDelete, apiGet, apiList, apiRequest, apiUpdate, type ListQuery } from './client';
import type { CandidateDto, CandidateListItem } from './types';
import { ApiError } from './types';

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
};

type CandidateAssetKind = 'resume' | 'profile-image' | 'intro-video';

interface AssetUploadUrl {
  uploadUrl: string;
  key: string;
  bucket: string;
}

async function prepareCandidateAssetUpload(
  id: number,
  kind: CandidateAssetKind,
  file: File,
): Promise<AssetUploadUrl> {
  const json = await apiRequest<{ data: AssetUploadUrl }>(`/candidates/${id}/${kind}/upload-url`, {
    method: 'POST',
    body: {
      originalName: file.name,
      mimeType: file.type || 'application/octet-stream',
      size: file.size,
    },
  });
  return json.data;
}

async function uploadFileToS3(uploadUrl: string, file: File): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
    },
  });

  if (!response.ok) {
    throw new ApiError('Failed to upload file to S3', response.status);
  }
}

async function completeCandidateAssetUpload(
  id: number,
  kind: CandidateAssetKind,
  file: File,
  key: string,
): Promise<CandidateDto> {
  const json = await apiRequest<{ data: CandidateDto }>(`/candidates/${id}/${kind}/complete`, {
    method: 'POST',
    body: {
      key,
      originalName: file.name,
      mimeType: file.type || 'application/octet-stream',
      size: file.size,
    },
  });
  return json.data;
}

/** Uploads directly to S3 via presigned URL — files never pass through the API server. */
export async function uploadCandidateFile(
  id: number,
  kind: CandidateAssetKind,
  file: File,
): Promise<CandidateDto> {
  const { uploadUrl, key } = await prepareCandidateAssetUpload(id, kind, file);
  await uploadFileToS3(uploadUrl, file);
  return completeCandidateAssetUpload(id, kind, file, key);
}

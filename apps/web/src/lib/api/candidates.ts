import { apiAction, apiCreate, apiDelete, apiGet, apiList, apiRequest, apiUpdate, type ListQuery } from './client';
import { downloadAuthenticatedBlob } from './download-blob';
import type { PublicFeaturedCandidate } from '../landing-featured-candidates';
import type { CandidateDto, CandidateListItem } from './types';
import type { ResumeExtractionResponse } from './ai/resume-extraction.types';
import { waitForAutomationJob } from './automation';
import type { AiScreeningJobStatus } from '../ai-screening-status';
import { isAiScreeningJobStatus } from '../ai-screening-status';

export type ResumeExtractDraftResult = {
  candidate: CandidateDto;
  extraction: ResumeExtractionResponse;
};

export type ResumeScreeningJobAccepted = {
  jobId: number;
  status: AiScreeningJobStatus;
  candidateId: number | null;
  documentId: number;
};

export function isResumeScreeningJobAccepted(
  value: ResumeExtractDraftResult | ResumeScreeningJobAccepted,
): value is ResumeScreeningJobAccepted {
  return 'jobId' in value && !('extraction' in value);
}

function candidateToExtraction(
  candidate: CandidateDto,
  jobId: number,
  output: Record<string, unknown> | null,
): ResumeExtractionResponse {
  const confidenceRaw = output?.confidence;
  const confidence =
    typeof confidenceRaw === 'number' && Number.isFinite(confidenceRaw)
      ? confidenceRaw
      : 0.9;

  const parseExperience = (): ResumeExtractionResponse['experience'] => {
    const fromOutput = [
      ...(Array.isArray(output?.experience) ? output.experience : []),
      ...(Array.isArray(output?.workExperience) ? output.workExperience : []),
      ...(Array.isArray(output?.employment) ? output.employment : []),
    ];
    if (fromOutput.length > 0) {
      return fromOutput
        .map((entry) => {
          if (!entry || typeof entry !== 'object') return null;
          const row = entry as Record<string, unknown>;
          const company = String(
            row.company ?? row.employer ?? row.organization ?? row.companyName ?? '',
          ).trim();
          if (!company) return null;
          return {
            company,
            title: String(row.title ?? row.role ?? candidate.primaryRole ?? '').trim(),
            startDate: typeof row.startDate === 'string' ? row.startDate : null,
            endDate: typeof row.endDate === 'string' ? row.endDate : null,
            description: typeof row.description === 'string' ? row.description : null,
          };
        })
        .filter((entry): entry is NonNullable<typeof entry> => entry !== null);
    }
    if (candidate.currentCompany?.trim()) {
      return [
        {
          company: candidate.currentCompany.trim(),
          title: candidate.primaryRole?.trim() ?? '',
          startDate: null,
          endDate: null,
          description: null,
        },
      ];
    }
    return [];
  };

  const parseEducation = (): ResumeExtractionResponse['education'] => {
    const fromOutput = output?.educationHistory ?? output?.education;
    if (Array.isArray(fromOutput) && fromOutput.length > 0) {
      return fromOutput
        .map((entry) => {
          if (!entry || typeof entry !== 'object') return null;
          const row = entry as Record<string, unknown>;
          const institution = String(row.institution ?? '').trim();
          if (!institution) return null;
          const graduationYearRaw = row.graduationYear;
          return {
            institution,
            degree: typeof row.degree === 'string' ? row.degree : null,
            fieldOfStudy: typeof row.fieldOfStudy === 'string' ? row.fieldOfStudy : null,
            graduationYear:
              typeof graduationYearRaw === 'number' && Number.isFinite(graduationYearRaw)
                ? graduationYearRaw
                : null,
          };
        })
        .filter((entry): entry is NonNullable<typeof entry> => entry !== null);
    }
    return [];
  };

  const educationText =
    (typeof output?.education === 'string' ? output.education : null) ??
    candidate.education ??
    null;

  const experience = parseExperience();
  const headline =
    candidate.headline ??
    (typeof output?.headline === 'string' ? output.headline : null);
  const headlineCompany = headline?.match(/\bat\s+([^|,]+)/i)?.[1]?.trim() ?? null;
  const currentJob =
    experience.find((job) => {
      const end = job.endDate?.trim().toLowerCase() ?? '';
      return !end || end === 'present' || end === 'current' || end === 'now';
    }) ?? experience[0];
  const currentCompany =
    (typeof output?.currentCompany === 'string' ? output.currentCompany.trim() : null) ||
    currentJob?.company?.trim() ||
    candidate.currentCompany?.trim() ||
    headlineCompany ||
    null;

  return {
    jobId: String(jobId),
    confidence,
    extractedAt: new Date().toISOString(),
    warnings: Array.isArray(output?.warnings)
      ? (output?.warnings as string[])
      : ['AI screening completed via n8n'],
    candidate: {
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      email: candidate.email,
      phone: candidate.phone ?? null,
      location: candidate.location ?? null,
      linkedinUrl: candidate.linkedinUrl ?? null,
      headline: candidate.headline ?? null,
      summary: candidate.summary ?? null,
      yearsExperience: candidate.yearsExperience ?? null,
    },
    primaryRole: candidate.primaryRole ?? null,
    seniority: null,
    community: candidate.primarySkillCommunityName ?? null,
    currentCompany: currentCompany ?? null,
    skills: (candidate.skills ?? []).map((skill) => ({
      name: skill.skillName ?? skill.skillCommunityName ?? 'Skill',
      proficiencyLevel:
        (skill.proficiencyLevel as ResumeExtractionResponse['skills'][number]['proficiencyLevel']) ||
        'INTERMEDIATE',
      yearsExperience: skill.yearsExperience,
      isPrimary: skill.isPrimary,
    })),
    experience,
    education: parseEducation(),
    aiSummary: candidate.aiSummary ?? null,
    strengths: candidate.strengths ?? null,
    weaknesses: candidate.weaknesses ?? null,
    riskFlags: candidate.riskFlags ?? null,
    bestalScore: candidate.bestalScore ?? null,
    recommendedClientRate: candidate.clientBillRate ?? null,
    recommendedCandidateRate: candidate.candidatePayRate ?? null,
    rawSections: {
      summary: candidate.summary ?? null,
      skills: (candidate.skills ?? [])
        .map((s) => s.skillName)
        .filter(Boolean)
        .join(', '),
      experience: currentCompany,
      education: educationText,
    },
  };
}

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
  archive: (id: number) => apiAction<CandidateDto>(`/candidates/${id}/archive`),
  unarchive: (id: number) => apiAction<CandidateDto>(`/candidates/${id}/unarchive`),
  runAiScreening: (id: number, body?: Record<string, unknown>) =>
    apiAction<CandidateDto>(`/candidates/${id}/pipeline/ai-screening`, body ?? {}),
  completeRecruiterReview: (id: number, body?: Record<string, unknown>) =>
    apiAction<CandidateDto>(`/candidates/${id}/pipeline/recruiter-review`, body ?? {}),
  completePricing: (id: number) =>
    apiAction<CandidateDto>(`/candidates/${id}/pipeline/pricing`),
  submitForApproval: (id: number) =>
    apiAction<CandidateDto>(`/candidates/${id}/pipeline/submit`),
  /**
   * Starts resume upload + AI screening. Returns either:
   * - sync result (Python/static when n8n unset), or
   * - async job acceptance `{ jobId, status, candidateId, documentId }`
   * Never calls n8n from the browser.
   */
  startResumeScreening: async (
    file: File,
    existingCandidateId?: number,
  ): Promise<ResumeExtractDraftResult | ResumeScreeningJobAccepted> => {
    const form = new FormData();
    form.append('file', file, file.name);
    if (
      existingCandidateId != null &&
      Number.isInteger(existingCandidateId) &&
      existingCandidateId > 0
    ) {
      form.append('candidateId', String(existingCandidateId));
    }
    const json = await apiRequest<{
      data:
        | ResumeExtractDraftResult
        | {
            jobId: number;
            status: string;
            candidateId: number;
            documentId: number;
          };
    }>('/candidates/extract-resume', { method: 'POST', body: form });

    const data = json.data;
    if (!('jobId' in data) || 'extraction' in data) {
      return data as ResumeExtractDraftResult;
    }

    const status = isAiScreeningJobStatus(data.status) ? data.status : 'PENDING';
    return {
      jobId: data.jobId,
      status,
      candidateId: data.candidateId,
      documentId: data.documentId,
    };
  },

  /** Load candidate + extraction shape after a COMPLETED automation job. */
  finalizeResumeScreeningJob: async (
    jobId: number,
    candidateId: number,
    outputReference: Record<string, unknown> | null,
  ): Promise<ResumeExtractDraftResult> => {
    if (!Number.isInteger(jobId) || jobId <= 0) {
      throw new Error('jobId must be a positive integer');
    }
    if (!Number.isInteger(candidateId) || candidateId <= 0) {
      throw new Error('candidateId must be a positive integer');
    }
    const candidate = await apiGet<CandidateDto>(`/candidates/${candidateId}`);
    return {
      candidate,
      extraction: candidateToExtraction(candidate, jobId, outputReference),
    };
  },

  /**
   * Convenience: start screening and wait for completion (with optional status callback).
   */
  extractResume: async (
    file: File,
    existingCandidateId?: number,
    options?: {
      signal?: AbortSignal;
      onStatus?: (status: AiScreeningJobStatus) => void;
    },
  ): Promise<ResumeExtractDraftResult> => {
    const started = await candidatesApi.startResumeScreening(
      file,
      existingCandidateId,
    );
    if (!isResumeScreeningJobAccepted(started)) {
      options?.onStatus?.('COMPLETED');
      return started;
    }

    options?.onStatus?.(started.status);
    const job = await waitForAutomationJob(started.jobId, {
      signal: options?.signal,
      onStatus: (status) => options?.onStatus?.(status),
    });
    if (job.status !== 'COMPLETED') {
      throw new Error(job.errorMessage || `AI screening ${job.status}`);
    }
    const resolvedCandidateId = job.candidateId ?? started.candidateId;
    if (
      resolvedCandidateId == null ||
      !Number.isInteger(resolvedCandidateId) ||
      resolvedCandidateId <= 0
    ) {
      throw new Error('AI screening completed without a candidate record');
    }
    return candidatesApi.finalizeResumeScreeningJob(
      started.jobId,
      resolvedCandidateId,
      job.outputReference,
    );
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

/** Public marketing endpoint — top CLIENT_VISIBLE candidates by BesTal score. */
export async function listPublicFeaturedCandidates(
  limit = 5,
): Promise<PublicFeaturedCandidate[]> {
  const json = await apiRequest<{ data: PublicFeaturedCandidate[] }>(
    `/public/candidates/featured?limit=${limit}`,
    { auth: false },
  );
  return json.data;
}

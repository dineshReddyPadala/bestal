import { apiAction, apiCreate, apiGet, apiList, apiRequest, apiUpdate, type ListQuery } from './client';
import { downloadAuthenticatedBlob } from './download-blob';
import type { EvaluationExtractionResponse } from './ai/evaluation-extraction.types';
import type { BgvExtractionResponse } from './ai/bgv-extraction.types';
import type { BackgroundCheckDto, BackgroundCheckListItem, EvaluationListItem } from './types';
import { waitForAutomationJob } from './automation';
import type { AiScreeningJobStatus } from '../ai-screening-status';
import { isAiScreeningJobStatus } from '../ai-screening-status';

export type EvaluationExtractResult = {
  extraction: EvaluationExtractionResponse;
  liveAi: boolean;
  /** Present when async n8n path created/updated a draft evaluation. */
  evaluationId?: number;
};

export type EvaluationAnalysisJobAccepted = {
  jobId: number;
  status: AiScreeningJobStatus;
  candidateId: number;
  documentId: number;
  evaluationId: number;
};

export type EvaluationExtractResponse =
  | EvaluationExtractResult
  | EvaluationAnalysisJobAccepted;

export function isEvaluationAnalysisJobAccepted(
  value: EvaluationExtractResponse,
): value is EvaluationAnalysisJobAccepted {
  return 'jobId' in value && !('extraction' in value);
}

export type BgvExtractResult = {
  extraction: BgvExtractionResponse;
  liveAi: boolean;
  backgroundCheckId?: number;
};

export type BgvAnalysisJobAccepted = {
  jobId: number;
  status: AiScreeningJobStatus;
  candidateId: number;
  documentId: number;
  backgroundCheckId: number;
};

export type BgvExtractResponse = BgvExtractResult | BgvAnalysisJobAccepted;

export function isBgvAnalysisJobAccepted(
  value: BgvExtractResponse,
): value is BgvAnalysisJobAccepted {
  return 'jobId' in value && !('extraction' in value);
}

function bgvOutputToExtraction(
  jobId: number,
  output: Record<string, unknown> | null,
): BgvExtractionResponse {
  const str = (key: string): string | undefined => {
    const raw = output?.[key];
    return typeof raw === 'string' && raw.trim() ? raw : undefined;
  };
  const confidenceRaw = output?.confidence;
  const confidence =
    typeof confidenceRaw === 'number' && Number.isFinite(confidenceRaw)
      ? confidenceRaw
      : 0.9;

  return {
    jobId: String(jobId),
    confidence,
    extractedAt: new Date().toISOString(),
    vendorName: str('vendorName'),
    status: str('overallStatus') ?? str('status'),
    idCheckStatus: str('idCheckStatus'),
    addressCheckStatus: str('addressCheckStatus'),
    employmentCheckStatus: str('employmentCheckStatus'),
    educationCheckStatus: str('educationCheckStatus'),
    criminalCheckStatus: str('criminalCheckStatus'),
    referenceCheckStatus: str('referenceCheckStatus'),
    aiBgvSummary:
      str('aiBgvSummary') || 'Background verification analysis completed',
    concernNotes: str('concernNotes'),
    checkType: str('checkType'),
    warnings: Array.isArray(output?.warnings)
      ? (output.warnings as string[])
      : ['AI BGV analysis completed via n8n'],
  };
}

function outputToExtraction(
  jobId: number,
  output: Record<string, unknown> | null,
  evaluation?: EvaluationListItem | null,
): EvaluationExtractionResponse {
  const num = (key: string): number | undefined => {
    const raw = output?.[key] ?? (evaluation as Record<string, unknown> | null | undefined)?.[key];
    return typeof raw === 'number' && Number.isFinite(raw) ? raw : undefined;
  };
  const str = (key: string): string | undefined => {
    const raw = output?.[key] ?? (evaluation as Record<string, unknown> | null | undefined)?.[key];
    return typeof raw === 'string' && raw.trim() ? raw : undefined;
  };

  const confidenceRaw = output?.confidence;
  const confidence =
    typeof confidenceRaw === 'number' && Number.isFinite(confidenceRaw)
      ? confidenceRaw
      : 0.9;

  return {
    jobId: String(jobId),
    confidence,
    extractedAt: new Date().toISOString(),
    extractedText: str('extractedText'),
    evaluatorName: str('evaluatorName') ?? evaluation?.evaluatorName,
    evaluatorCompany: str('evaluatorCompany') ?? evaluation?.evaluatorCompany ?? undefined,
    evaluationType: str('evaluationType') ?? evaluation?.evaluationType ?? undefined,
    evaluationDate: str('evaluationDate') ?? evaluation?.evaluationDate ?? undefined,
    technicalScore: num('technicalScore') ?? evaluation?.technicalScore ?? undefined,
    communicationScore: num('communicationScore'),
    problemSolvingScore: num('problemSolvingScore'),
    architectureScore: num('architectureScore'),
    clientReadinessScore: num('clientReadinessScore'),
    recommendation: str('recommendation') ?? evaluation?.recommendation ?? undefined,
    evaluatorComments: str('evaluatorComments'),
    aiEvaluationSummary:
      str('aiEvaluationSummary') ||
      str('evaluationSummary') ||
      'Evaluation analysis completed',
    warnings: Array.isArray(output?.warnings)
      ? (output.warnings as string[])
      : ['AI evaluation completed via n8n'],
  };
}

export const evaluationsApi = {
  list: (query?: ListQuery) => apiList<EvaluationListItem>('/evaluations', query),
  get: (id: number) => apiGet<EvaluationListItem>(`/evaluations/${id}`),
  create: (body: Record<string, unknown>) => apiCreate<EvaluationListItem>('/evaluations', body),
  update: (id: number, body: Record<string, unknown>) =>
    apiUpdate<EvaluationListItem>(`/evaluations/${id}`, body),
  downloadDocument: (id: number) =>
    downloadAuthenticatedBlob(`/evaluations/${id}/document/download`, `evaluation-${id}.pdf`),

  /** Start extraction — may return sync result or async job acceptance. */
  startEvaluationAnalysis: async (
    file: File,
    candidateId?: number,
  ): Promise<EvaluationExtractResponse> => {
    const form = new FormData();
    form.append('file', file, file.name);
    if (candidateId != null && Number.isInteger(candidateId) && candidateId > 0) {
      form.append('candidateId', String(candidateId));
    }
    const json = await apiRequest<{
      data:
        | EvaluationExtractResult
        | {
            jobId: number;
            status: string;
            candidateId: number;
            documentId: number;
            evaluationId: number;
          };
    }>('/evaluations/extract-evaluation', { method: 'POST', body: form });

    const data = json.data;
    if (!('jobId' in data) || 'extraction' in data) {
      return data as EvaluationExtractResult;
    }

    const status = isAiScreeningJobStatus(data.status) ? data.status : 'PENDING';
    return {
      jobId: data.jobId,
      status,
      candidateId: data.candidateId,
      documentId: data.documentId,
      evaluationId: data.evaluationId,
    };
  },

  finalizeEvaluationAnalysisJob: async (
    jobId: number,
    evaluationId: number,
    outputReference: Record<string, unknown> | null,
  ): Promise<EvaluationExtractResult> => {
    if (!Number.isInteger(jobId) || jobId <= 0) {
      throw new Error('jobId must be a positive integer');
    }
    if (!Number.isInteger(evaluationId) || evaluationId <= 0) {
      throw new Error('evaluationId must be a positive integer');
    }
    const evaluation = await apiGet<EvaluationListItem>(`/evaluations/${evaluationId}`);
    return {
      liveAi: true,
      evaluationId,
      extraction: outputToExtraction(jobId, outputReference, evaluation),
    };
  },

  /** Node uploads file; polls automation job when n8n path is used. */
  extractEvaluation: async (
    file: File,
    candidateId?: number,
    options?: {
      signal?: AbortSignal;
      onStatus?: (status: AiScreeningJobStatus) => void;
    },
  ): Promise<EvaluationExtractResult> => {
    const started = await evaluationsApi.startEvaluationAnalysis(file, candidateId);
    if (!isEvaluationAnalysisJobAccepted(started)) {
      options?.onStatus?.('COMPLETED');
      return started;
    }

    options?.onStatus?.(started.status);
    const job = await waitForAutomationJob(started.jobId, {
      signal: options?.signal,
      onStatus: (status) => options?.onStatus?.(status),
    });
    if (job.status !== 'COMPLETED') {
      throw new Error(job.errorMessage || `Evaluation AI analysis ${job.status}`);
    }
    return evaluationsApi.finalizeEvaluationAnalysisJob(
      started.jobId,
      started.evaluationId,
      job.outputReference,
    );
  },
};

export const backgroundChecksApi = {
  list: (query?: ListQuery) => apiList<BackgroundCheckListItem>('/background-checks', query),
  get: (id: number) => apiGet<BackgroundCheckDto>(`/background-checks/${id}`),
  create: (body: Record<string, unknown>) =>
    apiCreate<BackgroundCheckDto>('/background-checks', body),
  update: (id: number, body: Record<string, unknown>) =>
    apiUpdate<BackgroundCheckDto>(`/background-checks/${id}`, body),
  downloadReport: (id: number) =>
    downloadAuthenticatedBlob(`/background-checks/${id}/report/download`, `bgv-report-${id}.pdf`),

  startBgvAnalysis: async (
    file: File,
    candidateId?: number,
  ): Promise<BgvExtractResponse> => {
    const form = new FormData();
    form.append('file', file, file.name);
    if (candidateId != null && Number.isInteger(candidateId) && candidateId > 0) {
      form.append('candidateId', String(candidateId));
    }
    const json = await apiRequest<{
      data:
        | BgvExtractResult
        | {
            jobId: number;
            status: string;
            candidateId: number;
            documentId: number;
            backgroundCheckId: number;
          };
    }>('/background-checks/extract-bgv', { method: 'POST', body: form });

    const data = json.data;
    if (!('jobId' in data) || 'extraction' in data) {
      return data as BgvExtractResult;
    }

    const status = isAiScreeningJobStatus(data.status) ? data.status : 'PENDING';
    return {
      jobId: data.jobId,
      status,
      candidateId: data.candidateId,
      documentId: data.documentId,
      backgroundCheckId: data.backgroundCheckId,
    };
  },

  finalizeBgvAnalysisJob: async (
    jobId: number,
    backgroundCheckId: number,
    outputReference: Record<string, unknown> | null,
  ): Promise<BgvExtractResult> => {
    if (!Number.isInteger(jobId) || jobId <= 0) {
      throw new Error('jobId must be a positive integer');
    }
    if (!Number.isInteger(backgroundCheckId) || backgroundCheckId <= 0) {
      throw new Error('backgroundCheckId must be a positive integer');
    }
    return {
      liveAi: true,
      backgroundCheckId,
      extraction: bgvOutputToExtraction(jobId, outputReference),
    };
  },

  extractBgv: async (
    file: File,
    candidateId?: number,
    options?: {
      signal?: AbortSignal;
      onStatus?: (status: AiScreeningJobStatus) => void;
    },
  ): Promise<BgvExtractResult> => {
    const started = await backgroundChecksApi.startBgvAnalysis(file, candidateId);
    if (!isBgvAnalysisJobAccepted(started)) {
      options?.onStatus?.('COMPLETED');
      return started;
    }

    options?.onStatus?.(started.status);
    const job = await waitForAutomationJob(started.jobId, {
      signal: options?.signal,
      onStatus: (status) => options?.onStatus?.(status),
    });
    if (job.status !== 'COMPLETED') {
      throw new Error(job.errorMessage || `BGV AI analysis ${job.status}`);
    }
    return backgroundChecksApi.finalizeBgvAnalysisJob(
      started.jobId,
      started.backgroundCheckId,
      job.outputReference,
    );
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
  /** Run AI extraction on uploaded report; may return async job acceptance. */
  extractAi: async (id: number): Promise<BackgroundCheckDto> => {
    const json = await apiRequest<{
      data:
        | BackgroundCheckDto
        | {
            jobId: number;
            status: string;
            candidateId: number;
            documentId: number;
            backgroundCheckId: number;
          };
    }>(`/background-checks/${id}/extract-ai`, { method: 'POST' });

    const data = json.data;
    if ('jobId' in data && !('candidateName' in data)) {
      const accepted = data as BgvAnalysisJobAccepted;
      const status = isAiScreeningJobStatus(accepted.status)
        ? accepted.status
        : 'PENDING';
      const job = await waitForAutomationJob(accepted.jobId, { intervalMs: 2500 });
      if (job.status !== 'COMPLETED') {
        throw new Error(job.errorMessage || `BGV AI analysis ${job.status}`);
      }
      return backgroundChecksApi.get(accepted.backgroundCheckId);
    }

    return data as BackgroundCheckDto;
  },
};

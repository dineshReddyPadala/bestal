import { apiGet, apiRequest } from './client';
import {
  isAiScreeningJobStatus,
  type AiScreeningJobStatus,
} from '../ai-screening-status';

/** Full DTO from Fastify — do not surface n8nExecutionId in UI. */
type AutomationJobApiDto = {
  id: number;
  candidateId: number | null;
  documentId: number | null;
  jobType: string;
  status: string;
  workflowName: string | null;
  workflowVersion: string | null;
  n8nExecutionId: string | null;
  inputReference: Record<string, unknown> | null;
  outputReference: Record<string, unknown> | null;
  attempts: number;
  maxAttempts: number;
  errorCode: string | null;
  errorMessage: string | null;
  requestedBy: number;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

/** Public view for UI / polling — numeric IDs only, no n8n internals. */
export type AutomationJobStatusView = {
  jobId: number;
  candidateId: number | null;
  documentId: number | null;
  jobType: string;
  status: AiScreeningJobStatus;
  errorCode: string | null;
  errorMessage: string | null;
  outputReference: Record<string, unknown> | null;
};

function toStatusView(job: AutomationJobApiDto): AutomationJobStatusView {
  const status = isAiScreeningJobStatus(job.status) ? job.status : 'PENDING';
  return {
    jobId: job.id,
    candidateId: job.candidateId,
    documentId: job.documentId,
    jobType: job.jobType,
    status,
    errorCode: job.errorCode,
    errorMessage: job.errorMessage,
    outputReference: job.outputReference,
  };
}

export const automationApi = {
  getJob: async (jobId: number): Promise<AutomationJobStatusView> => {
    if (!Number.isInteger(jobId) || jobId <= 0) {
      throw new Error('jobId must be a positive integer');
    }
    const job = await apiGet<AutomationJobApiDto>(`/automation/jobs/${jobId}`);
    return toStatusView(job);
  },
};

const TERMINAL = new Set<AiScreeningJobStatus>(['COMPLETED', 'FAILED', 'CANCELLED']);

export type WaitForAutomationJobOptions = {
  intervalMs?: number;
  timeoutMs?: number;
  signal?: AbortSignal;
  onStatus?: (status: AiScreeningJobStatus, job: AutomationJobStatusView) => void;
};

/**
 * Lightweight poller for automation jobs.
 * Cleans up when aborted; does not call n8n.
 */
export async function waitForAutomationJob(
  jobId: number,
  options: WaitForAutomationJobOptions = {},
): Promise<AutomationJobStatusView> {
  if (!Number.isInteger(jobId) || jobId <= 0) {
    throw new Error('jobId must be a positive integer');
  }

  const intervalMs = options.intervalMs ?? 2500;
  const timeoutMs = options.timeoutMs ?? 180_000;
  const started = Date.now();

  for (;;) {
    if (options.signal?.aborted) {
      throw new DOMException('AI screening polling aborted', 'AbortError');
    }

    const job = await automationApi.getJob(jobId);
    options.onStatus?.(job.status, job);

    if (TERMINAL.has(job.status)) {
      return job;
    }

    if (Date.now() - started > timeoutMs) {
      throw new Error('Timed out waiting for AI screening to complete');
    }

    await sleep(intervalMs, options.signal);
  }
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('AI screening polling aborted', 'AbortError'));
      return;
    }
    const timer = window.setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      window.clearTimeout(timer);
      reject(new DOMException('AI screening polling aborted', 'AbortError'));
    };
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

export async function listAutomationJobs(query?: Record<string, string | number>) {
  return apiRequest<{ data: AutomationJobApiDto[]; meta?: { total: number } }>(
    '/automation/jobs',
    {
      params: query,
    },
  );
}

/** Latest BGV_ANALYSIS job for a background check (if any). */
export async function findBgvAnalysisJobId(
  backgroundCheckId: number,
  candidateId: number,
): Promise<number | null> {
  if (!Number.isInteger(backgroundCheckId) || backgroundCheckId <= 0) {
    throw new Error('backgroundCheckId must be a positive integer');
  }
  if (!Number.isInteger(candidateId) || candidateId <= 0) {
    throw new Error('candidateId must be a positive integer');
  }

  const json = await listAutomationJobs({
    candidateId,
    jobType: 'BGV_ANALYSIS',
    limit: 50,
  });

  const jobs = [...json.data].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  for (const job of jobs) {
    const ref = job.inputReference as Record<string, unknown> | null;
    if (Number(ref?.backgroundCheckId) === backgroundCheckId) {
      return job.id;
    }
  }

  return null;
}

export type WaitForBgvJobDiscoveryOptions = {
  signal?: AbortSignal;
  timeoutMs?: number;
  intervalMs?: number;
};

/** Poll automation job list until a BGV job appears for this check (post-upload enqueue). */
export async function waitForBgvAnalysisJobDiscovery(
  backgroundCheckId: number,
  candidateId: number,
  options: WaitForBgvJobDiscoveryOptions = {},
): Promise<number | null> {
  const timeoutMs = options.timeoutMs ?? 30_000;
  const intervalMs = options.intervalMs ?? 1500;
  const started = Date.now();

  for (;;) {
    if (options.signal?.aborted) {
      throw new DOMException('BGV analysis polling aborted', 'AbortError');
    }

    const jobId = await findBgvAnalysisJobId(backgroundCheckId, candidateId);
    if (jobId) {
      return jobId;
    }

    if (Date.now() - started > timeoutMs) {
      return null;
    }

    await sleep(intervalMs, options.signal);
  }
}

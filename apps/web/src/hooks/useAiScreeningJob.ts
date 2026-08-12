import { useEffect, useRef, useState } from 'react';
import type { AiScreeningJobStatus } from '../lib/ai-screening-status';
import {
  waitForAutomationJob,
  type AutomationJobStatusView,
} from '../lib/api/automation';
import {
  candidatesApi,
  isResumeScreeningJobAccepted,
  type ResumeExtractDraftResult,
  type ResumeScreeningJobAccepted,
} from '../lib/api/candidates';
import { getApiErrorMessage } from '../lib/api/errors';

type UseAiScreeningJobResult = {
  status: AiScreeningJobStatus | null;
  jobId: number | null;
  candidateId: number | null;
  errorMessage: string | null;
  isRunning: boolean;
  runScreening: (
    file: File,
    existingCandidateId?: number,
  ) => Promise<ResumeExtractDraftResult | null>;
  reset: () => void;
};

/**
 * Starts resume AI screening via Fastify and polls job status.
 * Never talks to n8n. Cleans up polling on unmount.
 */
export function useAiScreeningJob(): UseAiScreeningJobResult {
  const [status, setStatus] = useState<AiScreeningJobStatus | null>(null);
  const [jobId, setJobId] = useState<number | null>(null);
  const [candidateId, setCandidateId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      abortRef.current = null;
    };
  }, []);

  function reset() {
    abortRef.current?.abort();
    abortRef.current = null;
    setStatus(null);
    setJobId(null);
    setCandidateId(null);
    setErrorMessage(null);
    setIsRunning(false);
  }

  async function runScreening(
    file: File,
    existingCandidateId?: number,
  ): Promise<ResumeExtractDraftResult | null> {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsRunning(true);
    setErrorMessage(null);
    setStatus('PENDING');
    setJobId(null);

    try {
      const started = await candidatesApi.startResumeScreening(
        file,
        existingCandidateId,
      );

      if (!isResumeScreeningJobAccepted(started)) {
        setStatus('COMPLETED');
        setCandidateId(started.candidate.id);
        setIsRunning(false);
        return started;
      }

      return await pollAcceptedJob(started, controller.signal);
    } catch (error) {
      if (isAbortError(error)) {
        setIsRunning(false);
        return null;
      }
      const message = getApiErrorMessage(error, 'AI screening failed');
      setStatus('FAILED');
      setErrorMessage(message);
      setIsRunning(false);
      throw error;
    }
  }

  async function pollAcceptedJob(
    accepted: ResumeScreeningJobAccepted,
    signal: AbortSignal,
  ): Promise<ResumeExtractDraftResult> {
    if (!Number.isInteger(accepted.jobId) || accepted.jobId <= 0) {
      throw new Error('Invalid jobId from server');
    }

    setJobId(accepted.jobId);
    setCandidateId(accepted.candidateId);
    setStatus(
      accepted.status === 'PROCESSING' ||
        accepted.status === 'RETRYING' ||
        accepted.status === 'PENDING'
        ? accepted.status
        : 'PENDING',
    );

    const job: AutomationJobStatusView = await waitForAutomationJob(accepted.jobId, {
      signal,
      intervalMs: 2500,
      timeoutMs: 180_000,
      onStatus: (next) => setStatus(next),
    });

    if (job.status === 'FAILED' || job.status === 'CANCELLED') {
      const message =
        job.errorMessage ||
        (job.status === 'CANCELLED'
          ? 'AI screening was cancelled'
          : 'AI screening failed');
      setStatus(job.status);
      setErrorMessage(message);
      setIsRunning(false);
      throw new Error(message);
    }

    const resolvedCandidateId = job.candidateId ?? accepted.candidateId;
    if (
      resolvedCandidateId == null ||
      !Number.isInteger(resolvedCandidateId) ||
      resolvedCandidateId <= 0
    ) {
      throw new Error('AI screening completed without a candidate record');
    }

    const result = await candidatesApi.finalizeResumeScreeningJob(
      accepted.jobId,
      resolvedCandidateId,
      job.outputReference,
    );
    setStatus('COMPLETED');
    setCandidateId(result.candidate.id);
    setIsRunning(false);
    return result;
  }

  return {
    status,
    jobId,
    candidateId,
    errorMessage,
    isRunning,
    runScreening,
    reset,
  };
}

function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === 'AbortError') ||
    (error instanceof Error && error.name === 'AbortError')
  );
}

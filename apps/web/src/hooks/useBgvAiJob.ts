import { useCallback, useEffect, useRef, useState } from 'react';
import type { AiScreeningJobStatus } from '../lib/ai-screening-status';
import {
  waitForAutomationJob,
  type AutomationJobStatusView,
} from '../lib/api/automation';
import {
  backgroundChecksApi,
  isBgvAnalysisJobAccepted,
  type BgvAnalysisJobAccepted,
  type BgvExtractResult,
} from '../lib/api/evaluations';
import { getApiErrorMessage } from '../lib/api/errors';

type UseBgvAiJobResult = {
  status: AiScreeningJobStatus | null;
  jobId: number | null;
  candidateId: number | null;
  backgroundCheckId: number | null;
  errorMessage: string | null;
  isRunning: boolean;
  runAnalysis: (file: File, candidateId: number) => Promise<BgvExtractResult | null>;
  reset: () => void;
};

/**
 * Starts BGV AI analysis via Fastify and polls job status.
 * Never talks to n8n. Cleans up polling on unmount.
 */
export function useBgvAiJob(): UseBgvAiJobResult {
  const [status, setStatus] = useState<AiScreeningJobStatus | null>(null);
  const [jobId, setJobId] = useState<number | null>(null);
  const [candidateId, setCandidateId] = useState<number | null>(null);
  const [backgroundCheckId, setBackgroundCheckId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      abortRef.current = null;
    };
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStatus(null);
    setJobId(null);
    setCandidateId(null);
    setBackgroundCheckId(null);
    setErrorMessage(null);
    setIsRunning(false);
  }, []);

  const pollAcceptedJob = useCallback(
    async (
      accepted: BgvAnalysisJobAccepted,
      signal: AbortSignal,
    ): Promise<BgvExtractResult> => {
      setJobId(accepted.jobId);
      setCandidateId(accepted.candidateId);
      setBackgroundCheckId(accepted.backgroundCheckId);
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
            ? 'BGV AI analysis was cancelled'
            : 'BGV AI analysis failed');
        setStatus(job.status);
        setErrorMessage(message);
        setIsRunning(false);
        throw new Error(message);
      }

      const result = await backgroundChecksApi.finalizeBgvAnalysisJob(
        accepted.jobId,
        accepted.backgroundCheckId,
        job.outputReference,
      );
      setStatus('COMPLETED');
      setIsRunning(false);
      return result;
    },
    [],
  );

  const runAnalysis = useCallback(
    async (file: File, nextCandidateId: number): Promise<BgvExtractResult | null> => {
      if (!Number.isInteger(nextCandidateId) || nextCandidateId <= 0) {
        throw new Error('candidateId must be a positive integer');
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsRunning(true);
      setErrorMessage(null);
      setStatus('PENDING');
      setJobId(null);
      setBackgroundCheckId(null);
      setCandidateId(nextCandidateId);

      try {
        const started = await backgroundChecksApi.startBgvAnalysis(file, nextCandidateId);

        if (!isBgvAnalysisJobAccepted(started)) {
          setStatus('COMPLETED');
          setIsRunning(false);
          return started;
        }

        return await pollAcceptedJob(started, controller.signal);
      } catch (error) {
        if (isAbortError(error)) {
          setIsRunning(false);
          return null;
        }
        const message = getApiErrorMessage(error, 'BGV AI analysis failed');
        setStatus('FAILED');
        setErrorMessage(message);
        setIsRunning(false);
        throw error;
      }
    },
    [pollAcceptedJob],
  );

  return {
    status,
    jobId,
    candidateId,
    backgroundCheckId,
    errorMessage,
    isRunning,
    runAnalysis,
    reset,
  };
}

function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === 'AbortError') ||
    (error instanceof Error && error.name === 'AbortError')
  );
}

import { useCallback, useEffect, useRef, useState } from 'react';
import type { AiScreeningJobStatus } from '../lib/ai-screening-status';
import {
  waitForAutomationJob,
  waitForBgvAnalysisJobDiscovery,
  type AutomationJobStatusView,
} from '../lib/api/automation';
import {
  backgroundChecksApi,
  isBgvAnalysisJobAccepted,
  type BgvAnalysisJobAccepted,
  type BgvExtractResult,
} from '../lib/api/evaluations';
import type { BackgroundCheckDto } from '../lib/api/types';
import { getApiErrorMessage } from '../lib/api/errors';

type UseBgvAiJobResult = {
  status: AiScreeningJobStatus | null;
  jobId: number | null;
  candidateId: number | null;
  backgroundCheckId: number | null;
  errorMessage: string | null;
  isRunning: boolean;
  runAnalysis: (file: File, candidateId: number) => Promise<BgvExtractResult | null>;
  /** After report upload — poll n8n job or sync fallback until AI fields appear. */
  waitForReportAnalysis: (
    backgroundCheckId: number,
    candidateId: number,
  ) => Promise<BackgroundCheckDto | null>;
  /** Re-run AI extraction on an existing uploaded report. */
  runExtractAiForCheck: (backgroundCheckId: number) => Promise<BackgroundCheckDto | null>;
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

  const waitForReportAnalysis = useCallback(
    async (
      nextBackgroundCheckId: number,
      nextCandidateId: number,
    ): Promise<BackgroundCheckDto | null> => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsRunning(true);
      setErrorMessage(null);
      setStatus('PENDING');
      setJobId(null);
      setBackgroundCheckId(nextBackgroundCheckId);
      setCandidateId(nextCandidateId);

      try {
        const current = await backgroundChecksApi.get(nextBackgroundCheckId);
        if (current.aiSummary?.trim()) {
          setStatus('COMPLETED');
          setIsRunning(false);
          return current;
        }

        const discoveredJobId = await waitForBgvAnalysisJobDiscovery(
          nextBackgroundCheckId,
          nextCandidateId,
          { signal: controller.signal },
        );

        if (discoveredJobId) {
          setJobId(discoveredJobId);
          const job = await waitForAutomationJob(discoveredJobId, {
            signal: controller.signal,
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
        } else {
          setStatus('PROCESSING');
          await pollBgvDetailUntilAnalyzed(nextBackgroundCheckId, controller.signal, setStatus);
        }

        const refreshed = await backgroundChecksApi.get(nextBackgroundCheckId);
        if (!refreshed.aiSummary?.trim()) {
          throw new Error('BGV AI analysis did not produce a summary. Try Refresh AI summary.');
        }

        setStatus('COMPLETED');
        setIsRunning(false);
        return refreshed;
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
    [],
  );

  const runExtractAiForCheck = useCallback(
    async (nextBackgroundCheckId: number): Promise<BackgroundCheckDto | null> => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsRunning(true);
      setErrorMessage(null);
      setStatus('PENDING');
      setJobId(null);
      setBackgroundCheckId(nextBackgroundCheckId);

      try {
        const detail = await backgroundChecksApi.get(nextBackgroundCheckId);
        setCandidateId(detail.candidateId);

        const result = await backgroundChecksApi.extractAi(nextBackgroundCheckId);
        setStatus('COMPLETED');
        setIsRunning(false);
        return result;
      } catch (error) {
        if (isAbortError(error)) {
          setIsRunning(false);
          return null;
        }
        const message = getApiErrorMessage(error, 'BGV AI extraction failed');
        setStatus('FAILED');
        setErrorMessage(message);
        setIsRunning(false);
        throw error;
      }
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
    waitForReportAnalysis,
    runExtractAiForCheck,
    reset,
  };
}

async function pollBgvDetailUntilAnalyzed(
  backgroundCheckId: number,
  signal: AbortSignal,
  onStatus: (status: AiScreeningJobStatus) => void,
): Promise<void> {
  const timeoutMs = 60_000;
  const intervalMs = 2500;
  const started = Date.now();

  for (;;) {
    if (signal.aborted) {
      throw new DOMException('BGV analysis polling aborted', 'AbortError');
    }

    onStatus('PROCESSING');
    const detail = await backgroundChecksApi.get(backgroundCheckId);
    if (detail.aiSummary?.trim()) {
      return;
    }

    if (Date.now() - started > timeoutMs) {
      throw new Error('Timed out waiting for BGV AI analysis to complete');
    }

    await sleep(intervalMs, signal);
  }
}

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('BGV analysis polling aborted', 'AbortError'));
      return;
    }
    const timer = window.setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      window.clearTimeout(timer);
      reject(new DOMException('BGV analysis polling aborted', 'AbortError'));
    };
    signal.addEventListener('abort', onAbort, { once: true });
  });
}

function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === 'AbortError') ||
    (error instanceof Error && error.name === 'AbortError')
  );
}

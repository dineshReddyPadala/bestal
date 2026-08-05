export const AI_SCREENING_JOB_STATUSES = [
  'PENDING',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
  'RETRYING',
  'CANCELLED',
] as const;

export type AiScreeningJobStatus = (typeof AI_SCREENING_JOB_STATUSES)[number];

const ACTIVE = new Set<AiScreeningJobStatus>(['PENDING', 'PROCESSING', 'RETRYING']);
const TERMINAL = new Set<AiScreeningJobStatus>(['COMPLETED', 'FAILED', 'CANCELLED']);

export function isAiScreeningJobStatus(value: string): value is AiScreeningJobStatus {
  return (AI_SCREENING_JOB_STATUSES as readonly string[]).includes(value);
}

export function isAiScreeningActive(status: AiScreeningJobStatus | null | undefined): boolean {
  return status != null && ACTIVE.has(status);
}

export function isAiScreeningTerminal(status: AiScreeningJobStatus | null | undefined): boolean {
  return status != null && TERMINAL.has(status);
}

/** User-facing labels — no n8n / internal execution details. */
export function aiScreeningStatusLabel(status: AiScreeningJobStatus): string {
  switch (status) {
    case 'PENDING':
      return 'AI Screening Pending';
    case 'PROCESSING':
      return 'AI Screening Processing';
    case 'COMPLETED':
      return 'AI Screening Completed';
    case 'FAILED':
      return 'AI Screening Failed';
    case 'RETRYING':
      return 'AI Screening Retrying';
    case 'CANCELLED':
      return 'AI Screening Cancelled';
    default:
      return 'AI Screening';
  }
}

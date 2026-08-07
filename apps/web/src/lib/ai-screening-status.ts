export const AI_SCREENING_JOB_STATUSES = [
  'PENDING',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
  'RETRYING',
  'CANCELLED',
] as const;

export type AiScreeningJobStatus = (typeof AI_SCREENING_JOB_STATUSES)[number];

export type AiAnalysisContext = 'screening' | 'evaluation' | 'bgv';

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

function analysisNoun(context: AiAnalysisContext): string {
  switch (context) {
    case 'bgv':
      return 'BGV analysis';
    case 'evaluation':
      return 'Evaluation analysis';
    default:
      return 'AI screening';
  }
}

/** User-facing labels — no n8n / internal execution details. */
export function aiScreeningStatusLabel(
  status: AiScreeningJobStatus,
  context: AiAnalysisContext = 'screening',
): string {
  const noun = analysisNoun(context);
  const titled = noun.replace(/\b\w/g, (c) => c.toUpperCase());

  switch (status) {
    case 'PENDING':
      return `${titled} pending`;
    case 'PROCESSING':
      return `${titled} in progress`;
    case 'COMPLETED':
      return `${titled} completed`;
    case 'FAILED':
      return `${titled} failed`;
    case 'RETRYING':
      return `${titled} retrying`;
    case 'CANCELLED':
      return `${titled} cancelled`;
    default:
      return titled;
  }
}

export function aiAnalysisActiveHint(context: AiAnalysisContext = 'screening'): string {
  switch (context) {
    case 'bgv':
      return 'Extracting check statuses from the BGV report…';
    case 'evaluation':
      return 'Analyzing evaluation document…';
    default:
      return 'Checking screening progress…';
  }
}

import { isBgvClear } from './candidate-approval-gates';

/** Human-readable evaluation status for client portal labels. */
export function formatClientEvaluationLabel(status: string | null | undefined): string {
  const value = (status ?? 'NOT_STARTED').toUpperCase();
  if (value === 'COMPLETED') return 'Completed';
  if (value === 'IN_PROGRESS') return 'In Progress';
  if (value === 'NOT_STARTED') return 'Not Started';
  return value
    .split('_')
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ');
}

/** Human-readable BGV status for client portal labels. */
export function formatClientBgvLabel(status: string | null | undefined): string {
  if (isBgvClear(status)) return 'Clear';
  const value = (status ?? 'NOT_STARTED').toUpperCase();
  if (value === 'IN_PROGRESS' || value === 'PENDING') return 'Pending';
  if (value === 'NOT_STARTED') return 'Not Started';
  if (value === 'FAILED' || value === 'ADVERSE') return 'Issue';
  return value
    .split('_')
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ');
}

export function clientBgvStatusText(status: string | null | undefined): string {
  return `BGV: ${formatClientBgvLabel(status)}`;
}

export function clientEvaluationStatusText(status: string | null | undefined): string {
  return `Evaluation: ${formatClientEvaluationLabel(status)}`;
}

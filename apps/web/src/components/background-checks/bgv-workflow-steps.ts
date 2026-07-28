import type { BackgroundCheckDto } from '../../lib/api/types';

export const BGV_RECRUITER_STEPS = [
  { id: 'consent', label: 'Consent' },
  { id: 'docs', label: 'Docs' },
  { id: 'vendor', label: 'Vendor' },
  { id: 'start', label: 'Start' },
  { id: 'report', label: 'Report' },
  { id: 'ai', label: 'AI extract' },
  { id: 'submit', label: 'Submit' },
] as const;

export type BgvRecruiterStepId = (typeof BGV_RECRUITER_STEPS)[number]['id'];

/** Derive the single active recruiter step from current BGV state. */
export function getBgvRecruiterStep(detail: BackgroundCheckDto): BgvRecruiterStepId {
  if (detail.status === 'CONSIDER' || detail.status === 'CLEAR' || detail.status === 'FAILED') {
    return 'submit';
  }
  if (!detail.consentConfirmedAt) return 'consent';
  if ((detail.supportingDocumentCount ?? 0) < 1) return 'docs';
  if (!detail.provider?.trim()) return 'vendor';
  if (detail.status !== 'IN_PROGRESS' && detail.status !== 'SUSPENDED') return 'start';
  // After start: report upload (AI runs on upload), then review AI summary.
  if (!detail.hasReportDocument && !detail.aiSummary?.trim()) return 'report';
  return 'ai';
}

export function bgvStepIndex(stepId: BgvRecruiterStepId): number {
  return BGV_RECRUITER_STEPS.findIndex((s) => s.id === stepId);
}

export function isBgvStepComplete(
  detail: BackgroundCheckDto,
  stepId: BgvRecruiterStepId,
): boolean {
  switch (stepId) {
    case 'consent':
      return Boolean(detail.consentConfirmedAt);
    case 'docs':
      return (detail.supportingDocumentCount ?? 0) >= 1;
    case 'vendor':
      return Boolean(detail.provider?.trim());
    case 'start':
      return (
        detail.status === 'IN_PROGRESS' ||
        detail.status === 'SUSPENDED' ||
        detail.status === 'CONSIDER' ||
        detail.status === 'CLEAR'
      );
    case 'report':
      return Boolean(detail.hasReportDocument);
    case 'ai':
      return Boolean(detail.aiSummary?.trim());
    case 'submit':
      return (
        detail.status === 'CONSIDER' ||
        detail.status === 'CLEAR' ||
        detail.status === 'FAILED'
      );
    default:
      return false;
  }
}

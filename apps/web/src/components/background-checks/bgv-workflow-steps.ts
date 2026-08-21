import {
  displayBgvResultSummary,
  hasAnyBgvCheckStatus,
  isPlaceholderBgvSummary,
  type BgvCheckStatusFields,
} from '@bestal/shared-utils';
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

export const BGV_IMPORTED_STEPS = [{ id: 'review', label: 'Review' }] as const;

export type BgvRecruiterStepId = (typeof BGV_RECRUITER_STEPS)[number]['id'];
export type BgvImportedStepId = (typeof BGV_IMPORTED_STEPS)[number]['id'];
export type BgvWorkflowStepId = BgvRecruiterStepId | BgvImportedStepId;

export function isImportedBgv(detail: BackgroundCheckDto): boolean {
  return Boolean(detail.candidateSourceCandidateId?.trim());
}

export function getBgvStepsForDetail(
  detail: BackgroundCheckDto,
): typeof BGV_IMPORTED_STEPS | typeof BGV_RECRUITER_STEPS {
  return isImportedBgv(detail) ? BGV_IMPORTED_STEPS : BGV_RECRUITER_STEPS;
}

export function bgvCheckFieldsFromDetail(detail: BackgroundCheckDto): BgvCheckStatusFields {
  return {
    idCheckStatus: detail.idCheckStatus,
    employmentCheckStatus: detail.employmentCheckStatus,
    criminalCheckStatus: detail.criminalCheckStatus,
  };
}

export function resolveBgvResultSummaryForDisplay(detail: BackgroundCheckDto): string {
  return displayBgvResultSummary(detail.resultSummary, bgvCheckFieldsFromDetail(detail));
}

/** Derive the single active recruiter step from current BGV state. */
export function getBgvRecruiterStep(detail: BackgroundCheckDto): BgvRecruiterStepId {
  if (detail.status === 'CONSIDER' || detail.status === 'CLEAR' || detail.status === 'FAILED') {
    return 'submit';
  }
  if (!detail.consentConfirmedAt) return 'consent';
  if ((detail.supportingDocumentCount ?? 0) < 1) return 'docs';
  if (!detail.provider?.trim()) return 'vendor';
  // PENDING, CONSENT_PENDING, INITIATED, NOT_STARTED — waiting to start vendor verification.
  if (detail.status !== 'IN_PROGRESS' && detail.status !== 'SUSPENDED') return 'start';
  // After start: report upload (AI runs on upload), then review AI summary.
  if (!detail.hasReportDocument && !detail.aiSummary?.trim()) return 'report';
  return 'ai';
}

export function getBgvWorkflowStep(detail: BackgroundCheckDto): BgvWorkflowStepId {
  if (isImportedBgv(detail)) {
    return 'review';
  }
  return getBgvRecruiterStep(detail);
}

export function bgvStepIndex(stepId: BgvWorkflowStepId, detail: BackgroundCheckDto): number {
  const steps = getBgvStepsForDetail(detail);
  return steps.findIndex((s) => s.id === stepId);
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

export function isBgvWorkflowStepComplete(
  detail: BackgroundCheckDto,
  stepId: BgvWorkflowStepId,
): boolean {
  if (stepId === 'review') {
    const fields = bgvCheckFieldsFromDetail(detail);
    return (
      Boolean(detail.provider?.trim()) &&
      (hasAnyBgvCheckStatus(fields) ||
        Boolean(detail.resultSummary?.trim() && !isPlaceholderBgvSummary(detail.resultSummary)))
    );
  }
  return isBgvStepComplete(detail, stepId);
}

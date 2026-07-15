import type { BackgroundCheckStatus } from '@prisma/client';
import { BadRequestError } from '../../utils/index.js';

/** Terminal / admin disposition statuses — recruiters must not set these via free PATCH. */
export const BGV_ADMIN_DISPOSITION_STATUSES = [
  'CLEAR',
  'FAILED',
  'CONSIDER',
  'SUSPENDED',
] as const;

export type BgvDocumentKindLabel = 'CONSENT' | 'SUPPORTING' | 'REPORT';

export function assertBgvConsentConfirmed(
  check: { consentConfirmedAt: Date | null },
  action: string,
): void {
  if (!check.consentConfirmedAt) {
    throw new BadRequestError(`${action} requires candidate consent to be confirmed first`);
  }
}

export function assertBgvVendorAssigned(
  check: { provider: string | null },
  action: string,
): void {
  if (!check.provider?.trim()) {
    throw new BadRequestError(`${action} requires a verification vendor to be assigned first`);
  }
}

export function assertBgvReportUploaded(
  check: { reportDocumentId: bigint | null },
  action: string,
): void {
  if (!check.reportDocumentId) {
    throw new BadRequestError(`${action} requires a final BGV report to be uploaded first`);
  }
}

export function assertBgvStatusIn(
  status: BackgroundCheckStatus,
  allowed: BackgroundCheckStatus[],
  action: string,
): void {
  if (!allowed.includes(status)) {
    throw new BadRequestError(
      `${action} is not allowed when background check status is ${status}`,
    );
  }
}

export function assertRecruiterCannotSetDisposition(
  status: BackgroundCheckStatus | undefined,
): void {
  if (
    status &&
    (BGV_ADMIN_DISPOSITION_STATUSES as readonly string[]).includes(status)
  ) {
    throw new BadRequestError(
      `Status ${status} can only be set through admin BGV review actions (approve / reject / clarify)`,
    );
  }
}

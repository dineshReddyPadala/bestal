import type { CandidateProfileStatus } from '@prisma/client';
import type { NormalizedCandidateImport } from './candidate-import.types.js';

const CLEAR_BGV_STATUSES = new Set(['CLEAR', 'COMPLETED_CLEAR']);

export function isClearBgvStatus(status: string | null | undefined): boolean {
  return status != null && CLEAR_BGV_STATUSES.has(status);
}

export function isImportedPricingComplete(
  candidate: Pick<
    NormalizedCandidateImport,
    'billRate' | 'availabilityStatus' | 'availableFrom'
  >,
): boolean {
  return (
    candidate.billRate != null &&
    candidate.billRate > 0 &&
    candidate.availabilityStatus != null &&
    Boolean(candidate.availableFrom?.trim())
  );
}

/**
 * Land imported candidates on the furthest valid pipeline stage based on
 * Evaluation / BGV / pricing evidence. Never auto-submits for approval.
 */
export function deriveImportedProfileStatus(
  payload: NormalizedCandidateImport,
): CandidateProfileStatus {
  if (!payload.evaluations.length) {
    return 'IMPORTED';
  }

  if (!payload.bgv) {
    return 'EVALUATION_COMPLETE';
  }

  if (!isClearBgvStatus(payload.bgv.bgvStatus)) {
    return 'BGV_PENDING';
  }

  if (!isImportedPricingComplete(payload)) {
    return 'BGV_COMPLETE';
  }

  return 'PROFILE_DRAFT';
}

export function formatImportRowErrorMessage(input: {
  sheetName?: string;
  rowNumber?: number | null;
  sourceCandidateId?: string | null;
  message: string;
}): string {
  const parts: string[] = [];
  if (input.sheetName) {
    parts.push(input.sheetName);
  }
  if (input.rowNumber != null) {
    parts.push(`row ${input.rowNumber}`);
  }
  if (input.sourceCandidateId) {
    parts.push(`(candidate_id=${input.sourceCandidateId})`);
  }
  const prefix = parts.length ? `${parts.join(' ')}: ` : '';
  return `${prefix}${input.message}`;
}

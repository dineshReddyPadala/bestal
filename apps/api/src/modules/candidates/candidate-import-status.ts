import type { CandidateProfileStatus } from '@prisma/client';
import type { NormalizedCandidateImport } from './candidate-import.types.js';

const CLEAR_BGV_STATUSES = new Set(['CLEAR', 'COMPLETED_CLEAR']);

export function isClearBgvStatus(status: string | null | undefined): boolean {
  return status != null && CLEAR_BGV_STATUSES.has(status);
}

export function isImportedPricingComplete(
  candidate: Pick<
    NormalizedCandidateImport,
    'billRate' | 'availableFrom'
  > & {
    availabilityStatus?: string | null;
  },
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
  return deriveProfileStatusFromEvidence({
    hasEvaluations: payload.evaluations.length > 0,
    bgvStatus: payload.bgv?.bgvStatus ?? null,
    billRate: payload.billRate,
    availabilityStatus: payload.availabilityStatus,
    availableFrom: payload.availableFrom,
  });
}

export type ProfileEvidenceInput = {
  hasEvaluations: boolean;
  bgvStatus: string | null | undefined;
  billRate: number | null | undefined;
  availabilityStatus: string | null | undefined;
  availableFrom: string | null | undefined;
};

/** Shared rules for import landing status and post-import edit recalculation. */
export function deriveProfileStatusFromEvidence(
  input: ProfileEvidenceInput,
): CandidateProfileStatus {
  if (!input.hasEvaluations) {
    return 'IMPORTED';
  }

  if (!input.bgvStatus) {
    return 'EVALUATION_COMPLETE';
  }

  if (!isClearBgvStatus(input.bgvStatus)) {
    return 'BGV_PENDING';
  }

  if (
    !isImportedPricingComplete({
      billRate: input.billRate ?? null,
      availabilityStatus: input.availabilityStatus ?? null,
      availableFrom: input.availableFrom ?? null,
    })
  ) {
    return 'BGV_COMPLETE';
  }

  return 'PROFILE_DRAFT';
}

export function enrichImportValidationMessage(
  message: string,
  ctx: { columnName?: string | null; suppliedValue?: string | null },
): string {
  if (ctx.columnName && message.includes(`Column "${ctx.columnName}"`)) {
    return message;
  }

  const suppliedDisplay =
    ctx.suppliedValue === ''
      ? '(empty)'
      : ctx.suppliedValue != null
        ? `"${ctx.suppliedValue}"`
        : null;

  if (ctx.columnName) {
    if (message === 'Value must be an integer.') {
      return `Column "${ctx.columnName}": Must be a whole number.${suppliedDisplay ? ` Supplied: ${suppliedDisplay}.` : ''} Expected: whole number (integer).`;
    }
    if (message === 'Value must be numeric.') {
      return `Column "${ctx.columnName}": Must be numeric.${suppliedDisplay ? ` Supplied: ${suppliedDisplay}.` : ''} Expected: numeric value.`;
    }
    if (message.startsWith('Invalid value. Allowed:')) {
      const allowed = message.replace('Invalid value. Allowed: ', '').replace(/\.$/, '');
      return `Column "${ctx.columnName}": Invalid value.${suppliedDisplay ? ` Supplied: ${suppliedDisplay}.` : ''} Expected: one of: ${allowed}.`;
    }
    if (message.endsWith(' is required.')) {
      const field = message.replace(' is required.', '');
      return `Column "${ctx.columnName}": Required field is missing.${suppliedDisplay ? ` Supplied: ${suppliedDisplay}.` : ''} Expected: non-empty value for "${field}".`;
    }
    if (message.startsWith('Required field "') && message.endsWith('" is missing.')) {
      return `Column "${ctx.columnName}": Required field is missing.${suppliedDisplay ? ` Supplied: ${suppliedDisplay}.` : ''} Expected: non-empty text.`;
    }
    return `Column "${ctx.columnName}": ${message}${suppliedDisplay ? ` Supplied: ${suppliedDisplay}.` : ''}`;
  }

  return message;
}

export function formatImportRowErrorMessage(input: {
  sheetName?: string;
  rowNumber?: number | null;
  sourceCandidateId?: string | null;
  columnName?: string | null;
  suppliedValue?: string | null;
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
  const body = enrichImportValidationMessage(input.message, {
    columnName: input.columnName,
    suppliedValue: input.suppliedValue,
  });
  return `${prefix}${body}`;
}

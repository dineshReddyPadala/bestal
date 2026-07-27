import { BadRequestError } from '../../utils/index.js';
import type { Role } from '../../constants/index.js';
import {
  PERMISSIONS,
  roleHasPermission,
} from '../auth/auth.permissions.js';
import type { UpdateCandidateInput } from './candidate.types.js';

export function canViewCandidatePayRate(role: Role): boolean {
  return roleHasPermission(role, PERMISSIONS.CANDIDATES_VIEW_PAY_RATE);
}

export const SALES_LIMITED_CANDIDATE_FIELD_KEYS = [
  'headline',
  'summary',
  'clientProfileSummary',
  'strengths',
  'weaknesses',
  'location',
  'availabilityStatus',
  'timezoneOverlap',
  'preferredShift',
  'minHoursPerWeek',
  'maxHoursPerWeek',
  'availableFrom',
  'clientBillRate',
  'expectedRate',
  'currency',
] as const satisfies readonly (keyof UpdateCandidateInput)[];

const salesLimitedFieldSet = new Set<string>(SALES_LIMITED_CANDIDATE_FIELD_KEYS);

export function assertSalesLimitedCandidateUpdate(input: UpdateCandidateInput): void {
  const disallowed = Object.entries(input)
    .filter(([key, value]) => value !== undefined && !salesLimitedFieldSet.has(key))
    .map(([key]) => key);

  if (disallowed.length > 0) {
    throw new BadRequestError(
      `Sales users cannot update the following fields: ${disallowed.join(', ')}`,
    );
  }
}

export function redactCandidatePayFields<T extends {
  candidatePayRate?: number | null;
  grossMargin?: number | null;
  riskFlags?: string | null;
  weaknesses?: string | null;
}>(dto: T, role: Role): T {
  if (canViewCandidatePayRate(role)) {
    return dto;
  }
  return {
    ...dto,
    candidatePayRate: null,
    grossMargin: null,
  };
}

/** Client-facing candidate payloads: no pay, margin, risk flags, or internal notes. */
export function redactCandidateForClient<T extends {
  candidatePayRate?: number | null;
  grossMargin?: number | null;
  riskFlags?: string | null;
  weaknesses?: string | null;
  rejectionReason?: string | null;
}>(dto: T): T {
  return {
    ...dto,
    candidatePayRate: null,
    grossMargin: null,
    riskFlags: null,
    weaknesses: null,
    rejectionReason: null,
  };
}

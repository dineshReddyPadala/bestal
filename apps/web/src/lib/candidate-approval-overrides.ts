import {
  candidateListingRecords,
  candidates,
  type CandidateListRecord,
} from '@bestal/mock-data';
import type { MockCandidate } from '@bestal/mock-data';

const STORAGE_KEY = 'bestal-candidate-approval-overrides';

export type CandidateApprovalOverride = {
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  visibility: 'INTERNAL_ONLY' | 'CLIENT_VISIBLE' | 'HIDDEN';
  publishedAt: string | null;
  approvedAt: string | null;
  approvedByName: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
};

type OverrideMap = Record<number, CandidateApprovalOverride>;

const ADMIN_USER = 'Jordan Hayes';

function loadOverrides(): OverrideMap {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as OverrideMap;
  } catch {
    /* ignore */
  }
  return {};
}

function saveOverrides(map: OverrideMap): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  window.dispatchEvent(new Event('bestal-approval-change'));
}

let overrides: OverrideMap = loadOverrides();

function baseOverride(candidateId: number): CandidateApprovalOverride {
  const c = candidates.find((x) => x.id === candidateId);
  return {
    approvalStatus: c?.approvalStatus ?? 'PENDING',
    visibility: c?.visibility ?? 'INTERNAL_ONLY',
    publishedAt: null,
    approvedAt: null,
    approvedByName: null,
    rejectedAt: null,
    rejectionReason: null,
  };
}

export function getApprovalOverride(candidateId: number): CandidateApprovalOverride {
  return { ...baseOverride(candidateId), ...overrides[candidateId] };
}

export function getEffectiveCandidate(candidate: MockCandidate): MockCandidate {
  const o = overrides[candidate.id];
  if (!o) return candidate;
  return {
    ...candidate,
    approvalStatus: o.approvalStatus,
    visibility: o.visibility,
  };
}

export type ApprovalQueueRecord = CandidateListRecord & {
  effectiveApprovalStatus: string;
  effectiveVisibility: string;
  publishedAt: string | null;
  approvedAt: string | null;
  approvedByName: string | null;
  rejectionReason: string | null;
};

export function getApprovalQueueRecords(): ApprovalQueueRecord[] {
  return candidateListingRecords.map((row) => {
    const o = getApprovalOverride(row.id);
    return {
      ...row,
      approvalStatus: row.approvalStatus,
      visibility: row.visibility,
      effectiveApprovalStatus: o.approvalStatus,
      effectiveVisibility: o.visibility,
      publishedAt: o.publishedAt,
      approvedAt: o.approvedAt,
      approvedByName: o.approvedByName,
      rejectionReason: o.rejectionReason,
    };
  });
}

export function countPendingApprovals(): number {
  return getApprovalQueueRecords().filter(
    (r) =>
      r.effectiveApprovalStatus === 'PENDING' &&
      r.evaluationStatus === 'COMPLETED' &&
      r.bgvStatus !== 'NOT_STARTED' &&
      r.bgvStatus !== 'FAILED',
  ).length;
}

export function countReadyToPublish(): number {
  return getApprovalQueueRecords().filter(
    (r) =>
      r.effectiveApprovalStatus === 'APPROVED' &&
      r.effectiveVisibility !== 'CLIENT_VISIBLE' &&
      r.evaluationStatus === 'COMPLETED' &&
      r.bgvStatus === 'CLEAR',
  ).length;
}

function patchOverride(
  candidateId: number,
  patch: Partial<CandidateApprovalOverride>,
): CandidateApprovalOverride {
  const next = { ...getApprovalOverride(candidateId), ...patch };
  overrides = { ...overrides, [candidateId]: next };
  saveOverrides(overrides);
  return next;
}

export function approveCandidate(candidateId: number): CandidateApprovalOverride {
  const now = new Date().toISOString();
  return patchOverride(candidateId, {
    approvalStatus: 'APPROVED',
    approvedAt: now,
    approvedByName: ADMIN_USER,
    rejectedAt: null,
    rejectionReason: null,
  });
}

export function rejectCandidate(
  candidateId: number,
  reason: string,
): CandidateApprovalOverride {
  const now = new Date().toISOString();
  return patchOverride(candidateId, {
    approvalStatus: 'REJECTED',
    visibility: 'HIDDEN',
    rejectedAt: now,
    rejectionReason: reason || 'Rejected by admin',
    publishedAt: null,
  });
}

export function publishCandidate(candidateId: number): CandidateApprovalOverride {
  const now = new Date().toISOString();
  return patchOverride(candidateId, {
    visibility: 'CLIENT_VISIBLE',
    publishedAt: now,
  });
}

export function unpublishCandidate(candidateId: number): CandidateApprovalOverride {
  return patchOverride(candidateId, {
    visibility: 'INTERNAL_ONLY',
    publishedAt: null,
  });
}

export function subscribeApprovalChanges(listener: () => void): () => void {
  window.addEventListener('bestal-approval-change', listener);
  return () => window.removeEventListener('bestal-approval-change', listener);
}

/** Client search — published & approved with session overrides applied. */
export function isClientVisible(candidateId: number): boolean {
  const o = getApprovalOverride(candidateId);
  return o.approvalStatus === 'APPROVED' && o.visibility === 'CLIENT_VISIBLE';
}

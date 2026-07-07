import { trials } from './trials.js';
import type { MockTrial } from './types.js';

export type TrialRequestStatus =
  | 'REQUESTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export type TrialRequestRecord = {
  readonly id: number;
  readonly clientId: number;
  readonly clientName: string;
  readonly candidateId: number;
  readonly candidateName: string;
  readonly roleTitle: string;
  readonly durationDays: number | null;
  readonly startDate: string | null;
  readonly endDate: string | null;
  readonly status: TrialRequestStatus;
  readonly outcome: string | null;
  readonly feedback: string | null;
  readonly rejectReason: string | null;
  readonly converted: boolean;
  readonly requestedAt: string;
};

function durationDaysInclusive(start: string | null, end: string | null): number | null {
  if (!start || !end) return null;
  const s = new Date(start);
  const e = new Date(end);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime()) || e < s) return null;
  return Math.floor((e.getTime() - s.getTime()) / 86_400_000) + 1;
}

function mapTrialStatus(status: MockTrial['status']): TrialRequestStatus {
  switch (status) {
    case 'REQUESTED':
      return 'REQUESTED';
    case 'SCHEDULED':
      return 'APPROVED';
    case 'IN_PROGRESS':
    case 'EXTENDED':
      return 'IN_PROGRESS';
    case 'COMPLETED':
      return 'COMPLETED';
    case 'CANCELLED':
      return 'CANCELLED';
    default:
      return 'REQUESTED';
  }
}

function inferOutcome(trial: MockTrial): string | null {
  if (trial.status !== 'COMPLETED') return null;
  const feedback = trial.feedback?.toLowerCase() ?? '';
  if (feedback.includes('failed') || feedback.includes('unsuccessful')) return 'Unsuccessful';
  if (feedback.includes('excellent') || feedback.includes('successful')) {
    return 'Successful — recommend conversion';
  }
  return 'Completed';
}

function inferConverted(trial: MockTrial): boolean {
  if (trial.status !== 'COMPLETED') return false;
  const feedback = trial.feedback?.toLowerCase() ?? '';
  return feedback.includes('converted') || feedback.includes('deployment') || feedback.includes('active deployment');
}

function fromMockTrial(trial: MockTrial, requestedAt: string): TrialRequestRecord {
  return {
    id: trial.id,
    clientId: trial.clientId,
    clientName: trial.clientName,
    candidateId: trial.candidateId,
    candidateName: trial.candidateName,
    roleTitle: trial.title,
    durationDays: durationDaysInclusive(trial.startDate, trial.endDate),
    startDate: trial.startDate,
    endDate: trial.endDate,
    status: mapTrialStatus(trial.status),
    outcome: inferOutcome(trial),
    feedback: trial.feedback || null,
    rejectReason: null,
    converted: inferConverted(trial),
    requestedAt,
  };
}

const baseRecords: TrialRequestRecord[] = trials.map((trial, index) =>
  fromMockTrial(trial, `2026-0${Math.min(6, index + 1)}-${String((index % 28) + 1).padStart(2, '0')}T10:00:00Z`),
);

const supplementalRecords: TrialRequestRecord[] = [
  {
    id: 11,
    clientId: 2,
    clientName: 'Shopify',
    candidateId: 3,
    candidateName: 'Priya Sharma',
    roleTitle: 'Senior Backend Engineer — Commerce API',
    durationDays: 14,
    startDate: '2026-07-01',
    endDate: '2026-07-14',
    status: 'REJECTED',
    outcome: null,
    feedback: null,
    rejectReason: 'Role requirements changed',
    converted: false,
    requestedAt: '2026-06-25T14:30:00Z',
  },
  {
    id: 12,
    clientId: 4,
    clientName: 'Spotify',
    candidateId: 7,
    candidateName: 'Elena Volkov',
    roleTitle: 'ML Engineer — Recommendations',
    durationDays: 15,
    startDate: '2026-05-01',
    endDate: '2026-05-15',
    status: 'FAILED',
    outcome: 'Unsuccessful — skill gap on production ML pipeline',
    feedback: 'Candidate struggled with latency requirements.',
    rejectReason: null,
    converted: false,
    requestedAt: '2026-04-20T09:00:00Z',
  },
  {
    id: 13,
    clientId: 5,
    clientName: 'Airbnb',
    candidateId: 10,
    candidateName: 'Marcus Chen',
    roleTitle: 'Staff Platform Engineer',
    durationDays: null,
    startDate: null,
    endDate: null,
    status: 'REQUESTED',
    outcome: null,
    feedback: null,
    rejectReason: null,
    converted: false,
    requestedAt: '2026-06-28T16:45:00Z',
  },
];

export const trialRequestRecords: readonly TrialRequestRecord[] = [
  ...baseRecords,
  ...supplementalRecords,
];

export const trialRequestClients = [
  ...new Set(trialRequestRecords.map((r) => r.clientName)),
].sort();

export const trialRequestCandidates = [
  ...new Set(trialRequestRecords.map((r) => r.candidateName)),
].sort();

export const trialRequestStatuses: readonly TrialRequestStatus[] = [
  'REQUESTED',
  'APPROVED',
  'REJECTED',
  'IN_PROGRESS',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
];

export function getTrialRequestById(id: number): TrialRequestRecord | undefined {
  return trialRequestRecords.find((r) => r.id === id);
}

export { durationDaysInclusive as trialDurationDaysInclusive };

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
  readonly trialHours: number;
  readonly startDate: string | null;
  readonly endDate: string | null;
  readonly status: TrialRequestStatus;
  readonly rating: number | null;
  readonly converted: boolean;
  readonly requestedAt: string;
};

const PILOT_HOURS: Record<MockTrial['pilotType'], number> = {
  '20_HOUR': 20,
  '32_HOUR': 32,
  '40_HOUR': 40,
  CUSTOM: 40,
};

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

function inferRating(trial: MockTrial): number | null {
  if (trial.status !== 'COMPLETED') return null;
  const feedback = trial.feedback?.toLowerCase() ?? '';
  if (feedback.includes('excellent') || feedback.includes('successful')) return 5;
  if (feedback.includes('strong')) return 4;
  return 4;
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
    trialHours: PILOT_HOURS[trial.pilotType],
    startDate: trial.startDate,
    endDate: trial.endDate,
    status: mapTrialStatus(trial.status),
    rating: inferRating(trial),
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
    trialHours: 20,
    startDate: '2026-07-01',
    endDate: '2026-07-14',
    status: 'REJECTED',
    rating: null,
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
    trialHours: 40,
    startDate: '2026-05-01',
    endDate: '2026-05-15',
    status: 'FAILED',
    rating: 2,
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
    trialHours: 32,
    startDate: null,
    endDate: null,
    status: 'REQUESTED',
    rating: null,
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

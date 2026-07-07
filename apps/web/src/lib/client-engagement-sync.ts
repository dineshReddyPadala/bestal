import {
  interviews,
  trials,
  type MockInterview,
  type MockTrial,
  type TrialRequestRecord,
  type TrialRequestStatus,
} from '@bestal/mock-data';
import { DEMO_CLIENT_ID } from './demo-client';
import { trialDurationDays } from '../hooks/useClientEngagementRequests';

export const CLIENT_INTERVIEW_STORAGE_KEY = `bestal-client-interviews-${DEMO_CLIENT_ID}`;
export const CLIENT_TRIAL_STORAGE_KEY = `bestal-client-trials-${DEMO_CLIENT_ID}`;

function readStorage<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

export function readClientInterviewExtras(): MockInterview[] {
  return readStorage<MockInterview>(CLIENT_INTERVIEW_STORAGE_KEY);
}

export function readClientTrialExtras(): MockTrial[] {
  return readStorage<MockTrial>(CLIENT_TRIAL_STORAGE_KEY);
}

export function mergeClientInterviews(base: MockInterview[]): MockInterview[] {
  const seeded = base.filter((i) => i.clientId === DEMO_CLIENT_ID);
  const extras = readClientInterviewExtras();
  const seen = new Set(base.map((i) => i.id));
  const merged = [...base];
  for (const row of extras) {
    if (!seen.has(row.id)) merged.push(row);
  }
  for (const row of seeded) {
    if (!merged.some((m) => m.id === row.id)) merged.push(row);
  }
  return merged;
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

export function mockTrialToTrialRequestRecord(
  trial: MockTrial,
  requestedAt = new Date().toISOString(),
): TrialRequestRecord {
  return {
    id: trial.id,
    clientId: trial.clientId,
    clientName: trial.clientName,
    candidateId: trial.candidateId,
    candidateName: trial.candidateName,
    roleTitle: trial.title,
    durationDays: trialDurationDays(trial.startDate, trial.endDate),
    startDate: trial.startDate,
    endDate: trial.endDate,
    status: mapTrialStatus(trial.status),
    outcome: null,
    feedback: trial.feedback || null,
    rejectReason: null,
    converted: false,
    requestedAt,
  };
}

export function mergeClientTrialsIntoRecords(base: TrialRequestRecord[]): TrialRequestRecord[] {
  const clientTrials = trials.filter((t) => t.clientId === DEMO_CLIENT_ID);
  const extras = readClientTrialExtras();
  const allClientTrials = [...clientTrials, ...extras];
  const seen = new Set(base.map((r) => r.id));
  const merged = [...base];
  for (const trial of allClientTrials) {
    if (seen.has(trial.id)) continue;
    merged.push(mockTrialToTrialRequestRecord(trial));
    seen.add(trial.id);
  }
  return merged;
}

export function allInterviewsForWorkflow(): MockInterview[] {
  return mergeClientInterviews([...interviews]);
}

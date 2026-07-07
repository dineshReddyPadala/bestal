import { interviews, trials, type MockInterview } from '@bestal/mock-data';
import type { MockTrial } from '@bestal/mock-data';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DEMO_CLIENT_ID, DEMO_USER } from '../lib/demo-client';
import {
  buildInterviewRequestPayload,
  buildTrialRequestPayload,
  type InterviewRequestFormValues,
  type TrialRequestFormValues,
} from '../lib/entity-field-metadata';

const INTERVIEW_KEY = `bestal-client-interviews-${DEMO_CLIENT_ID}`;
const TRIAL_KEY = `bestal-client-trials-${DEMO_CLIENT_ID}`;

function readExtra<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function nextId(existing: { id: number }[]): number {
  const max = existing.reduce((m, r) => Math.max(m, r.id), 0);
  return max + 1;
}

export function useClientInterviewRequests() {
  const [extra, setExtra] = useState<MockInterview[]>(() => readExtra(INTERVIEW_KEY));

  useEffect(() => {
    localStorage.setItem(INTERVIEW_KEY, JSON.stringify(extra));
  }, [extra]);

  const records = useMemo(() => {
    const seeded = interviews.filter((i) => i.clientId === DEMO_CLIENT_ID);
    return [...seeded, ...extra];
  }, [extra]);

  const addRequest = useCallback(
    (candidateId: number, candidateName: string, form: InterviewRequestFormValues) => {
      const payload = buildInterviewRequestPayload(form, candidateId, DEMO_CLIENT_ID);
      setExtra((prev) => {
        const all = [...interviews.filter((i) => i.clientId === DEMO_CLIENT_ID), ...prev];
        const entry: MockInterview = {
          id: nextId(all),
          candidateId,
          candidateName,
          clientId: DEMO_CLIENT_ID,
          clientName: DEMO_USER.company,
          type: payload.type,
          status: 'REQUESTED',
          scheduledAt: payload.scheduledAt,
          durationMinutes: payload.durationMinutes,
          interviewer: 'Pending assignment',
          meetingUrl: null,
          notes: payload.notes ?? '',
        };
        return [...prev, entry];
      });
    },
    [],
  );

  return { interviews: records, addRequest };
}

export function useClientTrialRequests() {
  const [extra, setExtra] = useState<MockTrial[]>(() => readExtra(TRIAL_KEY));

  useEffect(() => {
    localStorage.setItem(TRIAL_KEY, JSON.stringify(extra));
  }, [extra]);

  const records = useMemo(() => {
    const seeded = trials.filter((t) => t.clientId === DEMO_CLIENT_ID);
    return [...seeded, ...extra];
  }, [extra]);

  const addRequest = useCallback(
    (candidateId: number, candidateName: string, form: TrialRequestFormValues) => {
      const payload = buildTrialRequestPayload(form, candidateId, DEMO_CLIENT_ID);
      setExtra((prev) => {
        const all = [...trials.filter((t) => t.clientId === DEMO_CLIENT_ID), ...prev];
        const entry: MockTrial = {
          id: nextId(all),
          candidateId,
          candidateName,
          clientId: DEMO_CLIENT_ID,
          clientName: DEMO_USER.company,
          title: payload.roleTitle,
          status: 'REQUESTED',
          startDate: payload.startDate,
          endDate: payload.endDate,
          rate: 0,
          payRate: 0,
          billRate: 0,
          currency: 'USD',
          hoursPerWeek: 0,
          pilotType: '20_HOUR',
          feedback: payload.feedback ?? '',
          recruiter: '',
        };
        return [...prev, entry];
      });
    },
    [],
  );

  return { trials: records, addRequest };
}

export function trialDurationDays(startDate: string, endDate: string): number | null {
  if (!startDate || !endDate) return null;
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return null;
  return Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1;
}

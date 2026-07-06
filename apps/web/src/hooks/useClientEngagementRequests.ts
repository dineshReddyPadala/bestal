import { interviews, trials, type MockInterview } from '@bestal/mock-data';
import type { MockTrial } from '@bestal/mock-data';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DEMO_CLIENT_ID, DEMO_USER } from '../lib/demo-client';

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
    (candidateId: number, candidateName: string) => {
      setExtra((prev) => {
        const all = [...interviews.filter((i) => i.clientId === DEMO_CLIENT_ID), ...prev];
        const entry: MockInterview = {
          id: nextId(all),
          candidateId,
          candidateName,
          clientId: DEMO_CLIENT_ID,
          clientName: DEMO_USER.company,
          type: 'VIDEO',
          status: 'REQUESTED',
          scheduledAt: null,
          durationMinutes: 60,
          interviewer: 'BesTal Recruiting',
          meetingUrl: null,
          notes: 'Submitted via client portal',
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

  const addRequest = useCallback((candidateId: number, candidateName: string) => {
    setExtra((prev) => {
      const all = [...trials.filter((t) => t.clientId === DEMO_CLIENT_ID), ...prev];
      const start = new Date();
      const end = new Date(start);
      end.setDate(end.getDate() + 14);
      const entry: MockTrial = {
        id: nextId(all),
        candidateId,
        candidateName,
        clientId: DEMO_CLIENT_ID,
        clientName: DEMO_USER.company,
        title: `Pilot — ${candidateName}`,
        status: 'REQUESTED',
        startDate: start.toISOString().slice(0, 10),
        endDate: end.toISOString().slice(0, 10),
        rate: 0,
        payRate: 0,
        billRate: 0,
        currency: 'USD',
        hoursPerWeek: 20,
        pilotType: '20_HOUR',
        feedback: '',
        recruiter: 'BesTal Account Team',
      };
      return [...prev, entry];
    });
  }, []);

  return { trials: records, addRequest };
}

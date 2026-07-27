import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { trialsApi } from '../lib/api';
import {
  buildTrialRequestPayload,
  type TrialRequestFormValues,
} from '../lib/entity-field-metadata';
import { queryKeys } from './api/query-keys';
import { toTrialRow } from './api/useTrials';

export function useClientTrialRequests() {
  const { user: authUser } = useAuth();
  const clientId = authUser?.clientId ?? undefined;

  const query = useQuery({
    queryKey: queryKeys.trials.list({ clientId }),
    queryFn: () => trialsApi.list({ clientId, limit: 100 }),
    enabled: Boolean(clientId),
  });

  const qc = useQueryClient();

  const addMutation = useMutation({
    mutationFn: async ({
      candidateId,
      form,
    }: {
      candidateId: number;
      candidateName: string;
      form: TrialRequestFormValues;
    }) => {
      if (!clientId) throw new Error('Client account not linked');
      const payload = buildTrialRequestPayload(form, candidateId, clientId);
      return trialsApi.create({
        candidateId: payload.candidateId,
        clientId: payload.clientId,
        roleTitle: payload.roleTitle,
        startDate: payload.startDate,
        endDate: payload.endDate,
        durationDays: payload.durationDays ?? undefined,
        trialType: form.trialType || undefined,
        maxTrialHours: form.maxTrialHours ?? undefined,
        taskDescription: form.taskDescription || undefined,
        successCriteria: form.successCriteria || undefined,
        feedback: payload.feedback ?? undefined,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.trials.all });
    },
  });

  const addRequest = useCallback(
    (candidateId: number, candidateName: string, form: TrialRequestFormValues) => {
      addMutation.mutate({ candidateId, candidateName, form });
    },
    [addMutation],
  );

  const trials = (query.data?.data ?? []).map((item) => {
    const row = toTrialRow(item);
    return {
      id: row.id,
      candidateId: row.candidateId,
      candidateName: row.candidateName,
      clientId: row.clientId,
      clientName: row.clientName,
      title: row.roleTitle,
      status: row.status,
      startDate: row.startDate ?? '',
      endDate: row.endDate ?? '',
      rate: 0,
      payRate: 0,
      billRate: 0,
      currency: 'USD',
      hoursPerWeek: 0,
      pilotType: '20_HOUR' as const,
      feedback: row.feedback ?? '',
      recruiter: '',
      clientRating: row.clientRating ?? null,
      outcome: row.outcome ?? null,
    };
  });

  return {
    trials,
    isLoading: query.isLoading,
    addRequest,
    isSubmitting: addMutation.isPending,
  };
}

export function trialDurationDays(startDate: string, endDate: string): number | null {
  if (!startDate || !endDate) return null;
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return null;
  return Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1;
}

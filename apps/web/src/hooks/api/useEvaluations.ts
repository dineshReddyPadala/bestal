import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { evaluationsApi, backgroundChecksApi } from '../../lib/api';
import type { ListQuery } from '../../lib/api/client';
import { queryKeys } from './query-keys';

export function useEvaluationsList(params?: ListQuery) {
  return useQuery({
    queryKey: queryKeys.evaluations.list(params),
    queryFn: () => evaluationsApi.list(params),
  });
}

export function useEvaluationMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: queryKeys.evaluations.all });
  return {
    create: useMutation({
      mutationFn: (body: Record<string, unknown>) => evaluationsApi.create(body),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, body }: { id: number; body: Record<string, unknown> }) =>
        evaluationsApi.update(id, body),
      onSuccess: invalidate,
    }),
  };
}

export function useBackgroundChecksList(params?: ListQuery) {
  return useQuery({
    queryKey: queryKeys.backgroundChecks.list(params),
    queryFn: () => backgroundChecksApi.list(params),
  });
}

export function useBackgroundCheckMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: queryKeys.backgroundChecks.all });
    void qc.invalidateQueries({ queryKey: queryKeys.candidates.all });
  };
  return {
    create: useMutation({
      mutationFn: (body: Record<string, unknown>) => backgroundChecksApi.create(body),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, body }: { id: number; body: Record<string, unknown> }) =>
        backgroundChecksApi.update(id, body),
      onSuccess: invalidate,
    }),
    confirmConsent: useMutation({
      mutationFn: (id: number) => backgroundChecksApi.confirmConsent(id),
      onSuccess: invalidate,
    }),
    assignVendor: useMutation({
      mutationFn: ({ id, provider }: { id: number; provider: string }) =>
        backgroundChecksApi.assignVendor(id, provider),
      onSuccess: invalidate,
    }),
    startVerification: useMutation({
      mutationFn: (id: number) => backgroundChecksApi.startVerification(id),
      onSuccess: invalidate,
    }),
    submitForReview: useMutation({
      mutationFn: (id: number) => backgroundChecksApi.submitForReview(id),
      onSuccess: invalidate,
    }),
    approve: useMutation({
      mutationFn: (id: number) => backgroundChecksApi.approve(id),
      onSuccess: invalidate,
    }),
    reject: useMutation({
      mutationFn: ({ id, notes }: { id: number; notes?: string }) =>
        backgroundChecksApi.reject(id, notes),
      onSuccess: invalidate,
    }),
    requestClarification: useMutation({
      mutationFn: ({ id, notes }: { id: number; notes: string }) =>
        backgroundChecksApi.requestClarification(id, notes),
      onSuccess: invalidate,
    }),
    reopen: useMutation({
      mutationFn: (id: number) => backgroundChecksApi.reopen(id),
      onSuccess: invalidate,
    }),
    uploadDocument: useMutation({
      mutationFn: ({
        id,
        kind,
        file,
      }: {
        id: number;
        kind: 'CONSENT' | 'SUPPORTING' | 'REPORT';
        file: File;
      }) => backgroundChecksApi.uploadDocument(id, kind, file),
      onSuccess: invalidate,
    }),
  };
}

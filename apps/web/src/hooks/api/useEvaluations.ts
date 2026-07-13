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
  const invalidate = () => qc.invalidateQueries({ queryKey: queryKeys.backgroundChecks.all });
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
  };
}

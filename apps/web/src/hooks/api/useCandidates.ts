import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { candidatesApi } from '../../lib/api';
import type { ListQuery } from '../../lib/api/client';
import { queryKeys } from './query-keys';

export function useCandidatesList(params?: ListQuery) {
  return useQuery({
    queryKey: queryKeys.candidates.list(params),
    queryFn: () => candidatesApi.list(params),
  });
}

export function useCandidate(id: number) {
  return useQuery({
    queryKey: queryKeys.candidates.detail(id),
    queryFn: () => candidatesApi.get(id),
    enabled: id > 0,
  });
}

export function useCandidateMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: queryKeys.candidates.all });

  return {
    create: useMutation({
      mutationFn: (body: Record<string, unknown>) => candidatesApi.create(body),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, body }: { id: number; body: Record<string, unknown> }) =>
        candidatesApi.update(id, body),
      onSuccess: invalidate,
    }),
    approve: useMutation({
      mutationFn: (id: number) => candidatesApi.approve(id),
      onSuccess: invalidate,
    }),
    reject: useMutation({
      mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
        candidatesApi.reject(id, reason),
      onSuccess: invalidate,
    }),
    publish: useMutation({
      mutationFn: (id: number) => candidatesApi.publish(id),
      onSuccess: invalidate,
    }),
    hide: useMutation({
      mutationFn: (id: number) => candidatesApi.hide(id),
      onSuccess: invalidate,
    }),
  };
}

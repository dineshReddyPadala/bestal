import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { shortlistsApi } from '../../lib/api';
import type { ListQuery } from '../../lib/api/client';
import { queryKeys } from './query-keys';

export function useShortlistsList(params?: ListQuery) {
  return useQuery({
    queryKey: queryKeys.shortlists.list(params),
    queryFn: () => shortlistsApi.list(params),
  });
}

export function useShortlist(id: number) {
  return useQuery({
    queryKey: queryKeys.shortlists.detail(id),
    queryFn: () => shortlistsApi.get(id),
    enabled: id > 0,
  });
}

export function useShortlistMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: queryKeys.shortlists.all });

  return {
    create: useMutation({
      mutationFn: (body: Record<string, unknown>) => shortlistsApi.create(body),
      onSuccess: invalidate,
    }),
    addCandidate: useMutation({
      mutationFn: ({
        shortlistId,
        body,
      }: {
        shortlistId: number;
        body: Record<string, unknown>;
      }) => shortlistsApi.addCandidate(shortlistId, body),
      onSuccess: invalidate,
    }),
    removeCandidate: useMutation({
      mutationFn: ({
        shortlistId,
        candidateId,
      }: {
        shortlistId: number;
        candidateId: number;
      }) => shortlistsApi.removeCandidate(shortlistId, candidateId),
      onSuccess: invalidate,
    }),
    updateCandidate: useMutation({
      mutationFn: ({
        shortlistId,
        candidateId,
        body,
      }: {
        shortlistId: number;
        candidateId: number;
        body: Record<string, unknown>;
      }) => shortlistsApi.updateCandidate(shortlistId, candidateId, body),
      onSuccess: invalidate,
    }),
  };
}

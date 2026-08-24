import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { candidatesApi, listPublicFeaturedCandidates } from '../../lib/api';
import type { ListQuery } from '../../lib/api/client';
import { queryKeys } from './query-keys';

export function useCandidatesList(params?: ListQuery, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.candidates.list(params),
    queryFn: () => candidatesApi.list(params),
    enabled: options?.enabled ?? true,
  });
}

export function usePublicFeaturedCandidates(limit = 5) {
  return useQuery({
    queryKey: [...queryKeys.candidates.publicFeatured, limit],
    queryFn: () => listPublicFeaturedCandidates(limit),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
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
  const invalidateDetail = (id: number) => {
    invalidate();
    qc.invalidateQueries({ queryKey: queryKeys.candidates.detail(id) });
  };

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
      onSuccess: (_data, id) => invalidateDetail(id),
    }),
    reject: useMutation({
      mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
        candidatesApi.reject(id, reason),
      onSuccess: (_data, { id }) => invalidateDetail(id),
    }),
    sendBack: useMutation({
      mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
        candidatesApi.sendBack(id, reason),
      onSuccess: (_data, { id }) => invalidateDetail(id),
    }),
    publish: useMutation({
      mutationFn: (id: number) => candidatesApi.publish(id),
      onSuccess: (_data, id) => invalidateDetail(id),
    }),
    hide: useMutation({
      mutationFn: (id: number) => candidatesApi.hide(id),
      onSuccess: (_data, id) => invalidateDetail(id),
    }),
    archive: useMutation({
      mutationFn: (id: number) => candidatesApi.archive(id),
      onSuccess: (_data, id) => invalidateDetail(id),
    }),
    unarchive: useMutation({
      mutationFn: (id: number) => candidatesApi.unarchive(id),
      onSuccess: (_data, id) => invalidateDetail(id),
    }),
    runAiScreening: useMutation({
      mutationFn: ({ id, body }: { id: number; body?: Record<string, unknown> }) =>
        candidatesApi.runAiScreening(id, body),
      onSuccess: (_data, { id }) => invalidateDetail(id),
    }),
    completeRecruiterReview: useMutation({
      mutationFn: ({ id, body }: { id: number; body?: Record<string, unknown> }) =>
        candidatesApi.completeRecruiterReview(id, body),
      onSuccess: (_data, { id }) => invalidateDetail(id),
    }),
    completePricing: useMutation({
      mutationFn: (id: number) => candidatesApi.completePricing(id),
      onSuccess: (_data, id) => invalidateDetail(id),
    }),
    submitForApproval: useMutation({
      mutationFn: (id: number) => candidatesApi.submitForApproval(id),
      onSuccess: (_data, id) => invalidateDetail(id),
    }),
  };
}

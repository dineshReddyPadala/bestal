import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deploymentsApi } from '../../lib/api';
import type { ListQuery } from '../../lib/api/client';
import { queryKeys } from './query-keys';

export function useDeploymentsList(params?: ListQuery) {
  return useQuery({
    queryKey: queryKeys.deployments.list(params),
    queryFn: () => deploymentsApi.list(params),
  });
}

export function useDeploymentMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: queryKeys.deployments.all });

  return {
    create: useMutation({
      mutationFn: (body: Record<string, unknown>) => deploymentsApi.create(body),
      onSuccess: invalidate,
    }),
    request: useMutation({
      mutationFn: (body: Record<string, unknown>) => deploymentsApi.request(body),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, body }: { id: number; body: Record<string, unknown> }) =>
        deploymentsApi.update(id, body),
      onSuccess: invalidate,
    }),
    approve: useMutation({
      mutationFn: ({ id, body }: { id: number; body: Record<string, unknown> }) =>
        deploymentsApi.approve(id, body),
      onSuccess: invalidate,
    }),
    activate: useMutation({
      mutationFn: (id: number) => deploymentsApi.activate(id),
      onSuccess: invalidate,
    }),
    terminate: useMutation({
      mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
        deploymentsApi.terminate(id, reason),
      onSuccess: invalidate,
    }),
    pause: useMutation({
      mutationFn: (id: number) => deploymentsApi.pause(id),
      onSuccess: invalidate,
    }),
    resume: useMutation({
      mutationFn: (id: number) => deploymentsApi.resume(id),
      onSuccess: invalidate,
    }),
    complete: useMutation({
      mutationFn: (id: number) => deploymentsApi.complete(id),
      onSuccess: invalidate,
    }),
    extend: useMutation({
      mutationFn: ({ id, endDate }: { id: number; endDate: string }) =>
        deploymentsApi.extend(id, endDate),
      onSuccess: invalidate,
    }),
  };
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { clientsApi } from '../../lib/api';
import type { ListQuery } from '../../lib/api/client';
import { queryKeys } from './query-keys';

export function useClientsList(params?: ListQuery) {
  return useQuery({
    queryKey: queryKeys.clients.list(params),
    queryFn: () => clientsApi.list(params),
  });
}

export function useClientMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: queryKeys.clients.all });

  return {
    create: useMutation({
      mutationFn: (body: Record<string, unknown>) => clientsApi.create(body),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, body }: { id: number; body: Record<string, unknown> }) =>
        clientsApi.update(id, body),
      onSuccess: invalidate,
    }),
    delete: useMutation({
      mutationFn: (id: number) => clientsApi.delete(id),
      onSuccess: invalidate,
    }),
  };
}

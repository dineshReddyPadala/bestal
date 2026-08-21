import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../../lib/api/notifications';
import { queryKeys } from './query-keys';

export function useNotificationsList(params?: {
  limit?: number;
  unreadOnly?: boolean;
}) {
  return useQuery({
    queryKey: queryKeys.notifications.list(params),
    queryFn: () =>
      notificationsApi.list({
        limit: params?.limit ?? 20,
        sort: '-updatedAt',
        unreadOnly: params?.unreadOnly,
      }),
    refetchInterval: 30_000,
  });
}

export function useNotificationMutations() {
  const qc = useQueryClient();
  const invalidate = () =>
    qc.invalidateQueries({ queryKey: queryKeys.notifications.all });

  return {
    markRead: useMutation({
      mutationFn: (id: number) => notificationsApi.markRead(id),
      onSuccess: invalidate,
    }),
    markAllRead: useMutation({
      mutationFn: () => notificationsApi.markAllRead(),
      onSuccess: invalidate,
    }),
  };
}

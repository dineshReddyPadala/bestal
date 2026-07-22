import { apiAction, apiGet, apiList, apiRequest, type ListQuery } from './client';

export type NotificationListItem = {
  id: number;
  type: string;
  status: string;
  title: string;
  body: string | null;
  actionUrl: string | null;
  readAt: string | null;
  createdAt: string;
};

export const notificationsApi = {
  list: (query?: ListQuery & { unreadOnly?: boolean; status?: string; type?: string }) =>
    apiList<NotificationListItem>('/notifications', query),

  get: (id: number) => apiGet<NotificationListItem & Record<string, unknown>>(`/notifications/${id}`),

  markRead: async (id: number) => {
    const json = await apiRequest<{ data: NotificationListItem }>(`/notifications/${id}/read`, {
      method: 'PATCH',
      body: {},
    });
    return json.data;
  },

  markAllRead: () => apiAction<{ count: number }>('/notifications/read-all'),
};

import { apiAction, apiCreate, apiGet, apiList, apiUpdate, type ListQuery } from './client';
import type { TrialDto, TrialListItem } from './types';

export const trialsApi = {
  list: (query?: ListQuery) => apiList<TrialListItem>('/trials', query),
  get: (id: number) => apiGet<TrialDto>(`/trials/${id}`),
  create: (body: Record<string, unknown>) => apiCreate<TrialDto>('/trials', body),
  update: (id: number, body: Record<string, unknown>) =>
    apiUpdate<TrialDto>(`/trials/${id}`, body),
  approve: (id: number) => apiAction<TrialDto>(`/trials/${id}/approve`),
  reject: (id: number, reason?: string) =>
    apiAction<TrialDto>(`/trials/${id}/reject`, reason ? { reason } : {}),
  submitFeedback: (
    id: number,
    body: { feedback: string; clientRating: number; decision: 'CONTINUE' | 'DO_NOT_CONTINUE' },
  ) => apiAction<TrialDto>(`/trials/${id}/feedback`, body),
};

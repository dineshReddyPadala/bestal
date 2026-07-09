import { apiAction, apiCreate, apiGet, apiList, apiUpdate, type ListQuery } from './client';
import type { InterviewDto, InterviewListItem } from './types';

export const interviewsApi = {
  list: (query?: ListQuery) => apiList<InterviewListItem>('/interviews', query),
  get: (id: number) => apiGet<InterviewDto>(`/interviews/${id}`),
  create: (body: Record<string, unknown>) => apiCreate<InterviewDto>('/interviews', body),
  update: (id: number, body: Record<string, unknown>) =>
    apiUpdate<InterviewDto>(`/interviews/${id}`, body),
  confirm: (id: number, body: Record<string, unknown>) =>
    apiAction<InterviewDto>(`/interviews/${id}/confirm`, body),
  cancel: (id: number, cancelReason?: string) =>
    apiAction<InterviewDto>(`/interviews/${id}/cancel`, cancelReason ? { cancelReason } : {}),
};

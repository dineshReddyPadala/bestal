import { apiCreate, apiGet, apiList, apiUpdate, type ListQuery } from './client';
import type { BackgroundCheckListItem, EvaluationListItem } from './types';

export const evaluationsApi = {
  list: (query?: ListQuery) => apiList<EvaluationListItem>('/evaluations', query),
  get: (id: number) => apiGet<EvaluationListItem>(`/evaluations/${id}`),
  create: (body: Record<string, unknown>) => apiCreate<EvaluationListItem>('/evaluations', body),
  update: (id: number, body: Record<string, unknown>) =>
    apiUpdate<EvaluationListItem>(`/evaluations/${id}`, body),
};

export const backgroundChecksApi = {
  list: (query?: ListQuery) => apiList<BackgroundCheckListItem>('/background-checks', query),
  get: (id: number) => apiGet<BackgroundCheckListItem>(`/background-checks/${id}`),
  create: (body: Record<string, unknown>) =>
    apiCreate<BackgroundCheckListItem>('/background-checks', body),
  update: (id: number, body: Record<string, unknown>) =>
    apiUpdate<BackgroundCheckListItem>(`/background-checks/${id}`, body),
};

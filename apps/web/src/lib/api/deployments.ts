import { apiAction, apiCreate, apiGet, apiList, apiUpdate, type ListQuery } from './client';
import type { DeploymentDto, DeploymentListItem } from './types';

export const deploymentsApi = {
  list: (query?: ListQuery) => apiList<DeploymentListItem>('/deployments', query),
  get: (id: number) => apiGet<DeploymentDto>(`/deployments/${id}`),
  create: (body: Record<string, unknown>) => apiCreate<DeploymentDto>('/deployments', body),
  update: (id: number, body: Record<string, unknown>) =>
    apiUpdate<DeploymentDto>(`/deployments/${id}`, body),
  activate: (id: number) => apiAction<DeploymentDto>(`/deployments/${id}/activate`),
  terminate: (id: number, reason?: string) =>
    apiAction<DeploymentDto>(`/deployments/${id}/terminate`, reason ? { reason } : {}),
};

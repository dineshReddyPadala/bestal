import { apiAction, apiCreate, apiGet, apiList, apiUpdate, type ListQuery } from './client';
import type { DeploymentDto, DeploymentListItem } from './types';

export const deploymentsApi = {
  list: (query?: ListQuery) => apiList<DeploymentListItem>('/deployments', query),
  get: (id: number) => apiGet<DeploymentDto>(`/deployments/${id}`),
  create: (body: Record<string, unknown>) => apiCreate<DeploymentDto>('/deployments', body),
  request: (body: Record<string, unknown>) =>
    apiCreate<DeploymentDto>('/deployments/request', body),
  update: (id: number, body: Record<string, unknown>) =>
    apiUpdate<DeploymentDto>(`/deployments/${id}`, body),
  approve: (id: number, body: Record<string, unknown>) =>
    apiAction<DeploymentDto>(`/deployments/${id}/approve`, body),
  activate: (id: number) => apiAction<DeploymentDto>(`/deployments/${id}/activate`),
  terminate: (id: number, reason?: string) =>
    apiAction<DeploymentDto>(`/deployments/${id}/terminate`, reason ? { reason } : {}),
  pause: (id: number) => apiAction<DeploymentDto>(`/deployments/${id}/pause`),
  resume: (id: number) => apiAction<DeploymentDto>(`/deployments/${id}/resume`),
  complete: (id: number) => apiAction<DeploymentDto>(`/deployments/${id}/complete`),
  extend: (id: number, endDate: string) =>
    apiAction<DeploymentDto>(`/deployments/${id}/extend`, { endDate }),
};

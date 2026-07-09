import { apiCreate, apiDelete, apiGet, apiList, apiUpdate, type ListQuery } from './client';
import type { ClientDto, ClientListItem } from './types';

export const clientsApi = {
  list: (query?: ListQuery) => apiList<ClientListItem>('/clients', query),
  get: (id: number) => apiGet<ClientDto>(`/clients/${id}`),
  create: (body: Record<string, unknown>) => apiCreate<ClientDto>('/clients', body),
  update: (id: number, body: Record<string, unknown>) =>
    apiUpdate<ClientDto>(`/clients/${id}`, body),
  delete: (id: number) => apiDelete(`/clients/${id}`),
};

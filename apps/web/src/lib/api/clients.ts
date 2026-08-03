import { apiCreate, apiDelete, apiGet, apiList, apiRequest, apiUpdate, type ListQuery } from './client';
import type { ClientDto, ClientListItem } from './types';

export type AccountManagerOption = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  label: string;
};

export const clientsApi = {
  list: (query?: ListQuery) => apiList<ClientListItem>('/clients', query),
  get: (id: number) => apiGet<ClientDto>(`/clients/${id}`),
  listAccountManagers: () =>
    apiRequest<{ data: AccountManagerOption[] }>('/clients/account-managers'),
  create: (body: Record<string, unknown>) => apiCreate<ClientDto>('/clients', body),
  update: (id: number, body: Record<string, unknown>) =>
    apiUpdate<ClientDto>(`/clients/${id}`, body),
  delete: (id: number) => apiDelete(`/clients/${id}`),
};

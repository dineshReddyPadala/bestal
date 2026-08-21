import { apiCreate, apiDelete, apiGet, apiList, apiRequest, apiUpdate, type ListQuery } from './client';
import type { ApiDataResponse, ClientDto, ClientListItem } from './types';
import type { ClientSignupFormValues } from '../schemas/client-signup';

export type AccountManagerOption = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  label: string;
};

export type ClientRegistrationResponse = {
  message: string;
  clientId: number;
};

export async function registerClient(
  body: ClientSignupFormValues,
): Promise<ClientRegistrationResponse> {
  return apiRequest<ApiDataResponse<ClientRegistrationResponse>>('/public/clients/register', {
    method: 'POST',
    body,
    auth: false,
  }).then((json) => json.data);
}

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

import { apiGet, apiList, apiRequest, apiUpdate, type ListQuery } from './client';
import type { ApiDataResponse, ApiPaginatedResponse } from './types';
import type { ContactTopicValue } from '../marketing-copy';

export type ContactMessageListItem = {
  id: number;
  referenceCode: string;
  fullName: string;
  email: string;
  topic: ContactTopicValue;
  status: string;
  createdAt: string;
};

export type ContactMessageDetail = {
  id: number;
  organizationId: number;
  referenceCode: string;
  fullName: string;
  email: string;
  topic: ContactTopicValue;
  message: string;
  status: string;
  internalNotes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ContactMessageSubmitPayload = {
  fullName: string;
  email: string;
  topic: ContactTopicValue;
  message: string;
};

export type ContactMessageSubmitResponse = {
  id: number;
  referenceCode: string;
  message: string;
};

export const contactMessagesApi = {
  submit: async (payload: ContactMessageSubmitPayload): Promise<ContactMessageSubmitResponse> => {
    const json = await apiRequest<ApiDataResponse<ContactMessageSubmitResponse>>(
      '/public/contact-messages',
      {
        method: 'POST',
        body: payload,
        auth: false,
      },
    );
    return json.data;
  },
  list: (query?: ListQuery) =>
    apiList<ContactMessageListItem>('/contact-messages', query) as Promise<
      ApiPaginatedResponse<ContactMessageListItem>
    >,
  get: (id: number) => apiGet<ContactMessageDetail>(`/contact-messages/${id}`),
  update: (id: number, body: Record<string, unknown>) =>
    apiUpdate<ContactMessageDetail>(`/contact-messages/${id}`, body),
};

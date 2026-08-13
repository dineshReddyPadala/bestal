import { apiRequest } from './client';

export type SubmitJobRequestPayload = {
  jobTitle: string;
  jobDescription: string;
  requiredSkills: string[];
  experienceRequired: string;
  numberOfResources: string;
  companyName: string;
  website: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  websiteConfirm?: string;
};

export type SubmitJobRequestResponse = {
  id: number;
  message: string;
};

export const jobRequestsApi = {
  submitPublic: (body: SubmitJobRequestPayload) =>
    apiRequest<{ data: SubmitJobRequestResponse }>('/public/job-requests', {
      method: 'POST',
      body,
      auth: false,
    }).then((json) => json.data),

  list: (query?: Record<string, string | number | boolean | undefined | null>) =>
    apiRequest<import('./types').ApiPaginatedResponse<import('./types').JobRequestListItem>>(
      '/job-requests',
      { params: query },
    ),

  get: (id: number) =>
    apiRequest<{ data: import('./types').JobRequestDto }>(`/job-requests/${id}`).then(
      (json) => json.data,
    ),

  update: (id: number, body: Record<string, unknown>) =>
    apiRequest<{ data: import('./types').JobRequestDto }>(`/job-requests/${id}`, {
      method: 'PATCH',
      body,
    }).then((json) => json.data),
};

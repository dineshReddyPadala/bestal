import {
  apiGet,
  apiList,
  apiUpdate,
  type ListQuery,
} from './client';
import type { ApiPaginatedResponse } from './types';

export type ClientEnquiryListItem = {
  id: number;
  referenceCode: string;
  jobTitle: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  experienceRequired: string;
  numberOfResources: string;
  rolesCount: number;
  status: string;
  assignedToId: number | null;
  assignedToName: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ClientEnquiryJob = {
  jobTitle: string;
  jobDescription: string;
  requiredSkills: string[];
  experienceRequired: string;
  numberOfResources: string;
};

export type ClientEnquiryAttachment = {
  fileName: string;
  fileSize: number;
  mimeType: string;
  storageKey: string;
  bucket: string;
  downloadUrl?: string | null;
};

export type ClientEnquiryDetail = {
  id: number;
  organizationId: number;
  referenceCode: string;
  jobTitle: string;
  jobDescription: string;
  requiredSkills: string[];
  experienceRequired: string;
  numberOfResources: string;
  companyName: string;
  companyDomain: string | null;
  location: string | null;
  timezone: string | null;
  website: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  additionalRequirements: string | null;
  jobs: ClientEnquiryJob[] | null;
  attachments: ClientEnquiryAttachment[] | null;
  status: string;
  source: string;
  assignedToId: number | null;
  assignedToName: string | null;
  internalNotes: string | null;
  createdAt: string;
  updatedAt: string;
};

export const jobRequestsApi = {
  list: (query?: ListQuery) =>
    apiList<ClientEnquiryListItem>('/job-requests', query) as Promise<
      ApiPaginatedResponse<ClientEnquiryListItem>
    >,
  get: (id: number) => apiGet<ClientEnquiryDetail>(`/job-requests/${id}`),
  update: (id: number, body: Record<string, unknown>) =>
    apiUpdate<ClientEnquiryDetail>(`/job-requests/${id}`, body),
};

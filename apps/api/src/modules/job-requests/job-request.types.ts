import type { JobRequestSource, JobRequestStatus } from '@prisma/client';

export interface JobRequestDto {
  id: number;
  organizationId: number;
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
  status: JobRequestStatus;
  source: JobRequestSource;
  assignedToId: number | null;
  assignedToName: string | null;
  internalNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface JobRequestListItemDto {
  id: number;
  jobTitle: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  experienceRequired: string;
  numberOfResources: string;
  status: JobRequestStatus;
  assignedToId: number | null;
  assignedToName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface JobRequestListFilters {
  organizationId: number;
  page: number;
  limit: number;
  sort?: string;
  search?: string;
  status?: JobRequestStatus;
  dateFrom?: string;
  dateTo?: string;
}

export interface CreatePublicJobRequestInput {
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
}

export interface UpdateJobRequestInput {
  status?: JobRequestStatus;
  assignedToId?: number | null;
  internalNotes?: string | null;
}

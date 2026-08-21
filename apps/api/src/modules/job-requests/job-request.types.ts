import type { JobRequestSource, JobRequestStatus } from '@prisma/client';

export interface ClientEnquiryJobEntry {
  jobTitle: string;
  jobDescription: string;
  requiredSkills: string[];
  experienceRequired: string;
  numberOfResources: string;
}

export interface ClientEnquiryAttachment {
  fileName: string;
  fileSize: number;
  mimeType: string;
  storageKey: string;
  bucket: string;
  downloadUrl?: string | null;
}

export interface JobRequestDto {
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
  jobs: ClientEnquiryJobEntry[] | null;
  attachments: ClientEnquiryAttachment[] | null;
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
  referenceCode: string;
  jobTitle: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  experienceRequired: string;
  numberOfResources: string;
  rolesCount: number;
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
  referenceCode: string;
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

export interface CreateClientEnquiryInput {
  referenceCode: string;
  companyName: string;
  companyDomain: string;
  location: string;
  timezone: string;
  website: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  additionalRequirements: string;
  jobs: ClientEnquiryJobEntry[];
  attachments: ClientEnquiryAttachment[];
  jobTitle: string;
  jobDescription: string;
  requiredSkills: string[];
  experienceRequired: string;
  numberOfResources: string;
}

export interface UpdateJobRequestInput {
  status?: JobRequestStatus;
  assignedToId?: number | null;
  internalNotes?: string | null;
}

export interface ClientEnquiryUploadFile {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  size: number;
}

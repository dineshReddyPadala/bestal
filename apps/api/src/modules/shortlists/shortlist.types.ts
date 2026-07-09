import type { ShortlistStatus } from '@prisma/client';

export interface ShortlistCandidateDto {
  id: number;
  shortlistId: number;
  candidateId: number;
  candidateName: string;
  addedById: number;
  addedByName: string;
  rank: number;
  status: string | null;
  notes: string | null;
  clientNotes: string | null;
  isApproved: boolean | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ShortlistDto {
  id: number;
  organizationId: number;
  clientId: number;
  clientName: string;
  createdById: number;
  createdByName: string;
  title: string;
  description: string | null;
  status: ShortlistStatus;
  roleTitle: string | null;
  dueDate: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ShortlistWithCandidatesDto extends ShortlistDto {
  candidates: ShortlistCandidateDto[];
}

export interface ShortlistListItemDto {
  id: number;
  clientId: number;
  clientName: string;
  title: string;
  status: ShortlistStatus;
  roleTitle: string | null;
  dueDate: string | null;
  candidateCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ShortlistListFilters {
  organizationId: number;
  page: number;
  limit: number;
  sort?: string;
  clientId?: number;
  status?: ShortlistStatus;
}

export interface CreateShortlistInput {
  clientId: number;
  title: string;
  description?: string;
  roleTitle?: string;
  dueDate?: string;
}

export interface AddShortlistCandidateInput {
  candidateId: number;
  rank?: number;
  status?: string;
  notes?: string;
  clientNotes?: string;
}

export interface UpdateShortlistCandidateInput {
  rank?: number;
  status?: string | null;
  notes?: string | null;
  clientNotes?: string | null;
  isApproved?: boolean | null;
}

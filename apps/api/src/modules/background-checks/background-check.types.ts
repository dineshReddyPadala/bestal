import type {
  BackgroundCheckStatus,
  BackgroundCheckType,
} from '@prisma/client';

export interface BackgroundCheckDto {
  id: number;
  organizationId: number;
  candidateId: number;
  candidateName: string;
  requestedById: number;
  requestedByName: string;
  type: BackgroundCheckType;
  status: BackgroundCheckStatus;
  provider: string | null;
  externalReferenceId: string | null;
  resultSummary: string | null;
  initiatedAt: string | null;
  completedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BackgroundCheckListItemDto {
  id: number;
  candidateId: number;
  candidateName: string;
  type: BackgroundCheckType;
  status: BackgroundCheckStatus;
  provider: string | null;
  initiatedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BackgroundCheckListFilters {
  organizationId: number;
  page: number;
  limit: number;
  sort?: string;
  candidateId?: number;
  status?: BackgroundCheckStatus;
  type?: BackgroundCheckType;
}

export interface CreateBackgroundCheckInput {
  candidateId: number;
  type: BackgroundCheckType;
  status?: BackgroundCheckStatus;
  provider?: string;
  externalReferenceId?: string;
  resultSummary?: string;
  initiatedAt?: string;
  expiresAt?: string;
}

export interface UpdateBackgroundCheckInput {
  type?: BackgroundCheckType;
  status?: BackgroundCheckStatus;
  provider?: string;
  externalReferenceId?: string;
  resultSummary?: string;
  initiatedAt?: string | null;
  completedAt?: string | null;
  expiresAt?: string | null;
}

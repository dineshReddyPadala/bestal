import type {
  BackgroundCheckStatus,
  BackgroundCheckType,
} from '@prisma/client';

export type BgvDocumentDto = {
  id: number;
  fileName: string;
  originalName: string;
  mimeType: string;
  description: string | null;
  url: string | null;
  createdAt: string;
};

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
  aiSummary: string | null;
  reviewNotes: string | null;
  consentConfirmedAt: string | null;
  vendorAssignedAt: string | null;
  reviewedAt: string | null;
  reviewedByName: string | null;
  hasConsentDocument: boolean;
  hasReportDocument: boolean;
  supportingDocumentCount: number;
  documents?: BgvDocumentDto[];
  initiatedAt: string | null;
  completedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Sales / client-safe summary — no document URLs. */
export interface BackgroundCheckPublicSummaryDto {
  status: BackgroundCheckStatus;
  provider: string | null;
  completedAt: string | null;
  aiSummary: string | null;
  isBackgroundVerified: boolean;
}

export interface BackgroundCheckListItemDto {
  id: number;
  candidateId: number;
  candidateName: string;
  type: BackgroundCheckType;
  status: BackgroundCheckStatus;
  provider: string | null;
  consentConfirmedAt: string | null;
  aiSummary: string | null;
  hasReportDocument: boolean;
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
  search?: string;
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
  aiSummary?: string;
  reviewNotes?: string;
  initiatedAt?: string;
  completedAt?: string;
  expiresAt?: string;
}

export interface UpdateBackgroundCheckInput {
  type?: BackgroundCheckType;
  status?: BackgroundCheckStatus;
  provider?: string;
  externalReferenceId?: string;
  resultSummary?: string;
  aiSummary?: string | null;
  reviewNotes?: string | null;
  consentConfirmedAt?: string | null;
  consentConfirmedById?: number | null;
  vendorAssignedAt?: string | null;
  reviewedById?: number | null;
  reviewedAt?: string | null;
  consentDocumentId?: number | null;
  reportDocumentId?: number | null;
  initiatedAt?: string | null;
  completedAt?: string | null;
  expiresAt?: string | null;
}

export type UploadBgvAssetInput = {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  size: number;
};

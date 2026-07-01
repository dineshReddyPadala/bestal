import type {
  CandidateApprovalStatus,
  CandidateSource,
  CandidateStatus,
  CandidateVisibility,
  DocumentKind,
  DocumentStatus,
} from '@prisma/client';

export interface CandidateDocumentDto {
  id: number;
  kind: DocumentKind;
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  status: DocumentStatus;
  url: string | null;
  createdAt: string;
}

export interface CandidateSkillDto {
  id: number;
  skillCommunityId: number;
  skillCommunityName: string;
  proficiencyLevel: string;
  yearsExperience: number | null;
  isPrimary: boolean;
}

export interface CandidateDto {
  id: number;
  organizationId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  status: CandidateStatus;
  visibility: CandidateVisibility;
  approvalStatus: CandidateApprovalStatus;
  source: CandidateSource;
  headline: string | null;
  summary: string | null;
  location: string | null;
  yearsExperience: number | null;
  availableFrom: string | null;
  expectedRate: number | null;
  currency: string | null;
  linkedinUrl: string | null;
  primarySkillCommunityId: number | null;
  primarySkillCommunityName: string | null;
  publishedAt: string | null;
  hiddenAt: string | null;
  approvedAt: string | null;
  approvedById: number | null;
  rejectedAt: string | null;
  rejectedById: number | null;
  rejectionReason: string | null;
  resume: CandidateDocumentDto | null;
  profileImage: CandidateDocumentDto | null;
  introVideo: CandidateDocumentDto | null;
  skills: CandidateSkillDto[];
  createdAt: string;
  updatedAt: string;
}

export interface CandidateListItemDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  status: CandidateStatus;
  visibility: CandidateVisibility;
  approvalStatus: CandidateApprovalStatus;
  headline: string | null;
  location: string | null;
  yearsExperience: number | null;
  primarySkillCommunityName: string | null;
  hasResume: boolean;
  hasProfileImage: boolean;
  hasIntroVideo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CandidateListFilters {
  organizationId: number;
  page: number;
  limit: number;
  sort?: string;
  search?: string;
  status?: CandidateStatus;
  visibility?: CandidateVisibility;
  approvalStatus?: CandidateApprovalStatus;
  source?: CandidateSource;
  primarySkillCommunityId?: number;
  skillCommunityId?: number;
  /** When true, restrict to published + approved (client view). */
  clientView?: boolean;
}

export interface CreateCandidateInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status?: CandidateStatus;
  source?: CandidateSource;
  headline?: string;
  summary?: string;
  location?: string;
  yearsExperience?: number;
  availableFrom?: string;
  expectedRate?: number;
  currency?: string;
  linkedinUrl?: string;
  primarySkillCommunityId?: number;
}

export interface UpdateCandidateInput extends Partial<CreateCandidateInput> {}

export interface RejectCandidateInput {
  reason: string;
}

export type CandidateAssetKind = 'RESUME' | 'PROFILE_IMAGE' | 'INTRO_VIDEO';

export interface UploadAssetInput {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  size: number;
}

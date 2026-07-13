import type {
  CandidateApprovalStatus,
  CandidateAvailabilityStatus,
  CandidateProfileStatus,
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
  skillName: string | null;
  skillCategory: string | null;
  proficiencyLevel: string;
  yearsExperience: number | null;
  isPrimary: boolean;
  notes?: string | null;
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
  createdById: number | null;
  oorwinCandidateId: string | null;
  displayName: string | null;
  primaryRole: string | null;
  currentCompany: string | null;
  education: string | null;
  githubUrl: string | null;
  naukriUrl: string | null;
  clientBillRate: number | null;
  candidatePayRate: number | null;
  grossMargin: number | null;
  availabilityStatus: CandidateAvailabilityStatus | null;
  timezoneOverlap: string | null;
  preferredShift: string | null;
  minHoursPerWeek: number | null;
  maxHoursPerWeek: number | null;
  aiSummary: string | null;
  clientProfileSummary: string | null;
  strengths: string | null;
  weaknesses: string | null;
  riskFlags: string | null;
  bestalScore: number | null;
  technicalScore: number | null;
  communicationScore: number | null;
  reliabilityScore: number | null;
  evaluationStatus: string | null;
  bgvStatus: string | null;
  profileStatus: CandidateProfileStatus | null;
  deploymentStatus: string | null;
  submittedForApprovalAt: string | null;
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
  profileStatus: string | null;
  evaluationStatus: string | null;
  bgvStatus: string | null;
  submittedForApprovalAt: string | null;
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

export interface CreateCandidateSkillInput {
  skillCommunityId: number;
  skillName?: string;
  skillCategory?: string;
  proficiencyLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  yearsExperience?: number;
  isPrimary?: boolean;
  notes?: string;
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
  createdById?: number;
  oorwinCandidateId?: string;
  displayName?: string;
  primaryRole?: string;
  currentCompany?: string;
  education?: string;
  githubUrl?: string;
  naukriUrl?: string;
  clientBillRate?: number;
  candidatePayRate?: number;
  grossMargin?: number;
  availabilityStatus?: CandidateAvailabilityStatus;
  timezoneOverlap?: string;
  preferredShift?: string;
  minHoursPerWeek?: number;
  maxHoursPerWeek?: number;
  aiSummary?: string;
  clientProfileSummary?: string;
  strengths?: string;
  weaknesses?: string;
  riskFlags?: string;
  bestalScore?: number;
  technicalScore?: number;
  communicationScore?: number;
  reliabilityScore?: number;
  evaluationStatus?: string;
  bgvStatus?: string;
  profileStatus?: CandidateProfileStatus;
  visibility?: CandidateVisibility;
  deploymentStatus?: string;
  skills?: CreateCandidateSkillInput[];
}

export interface UpdateCandidateInput extends Partial<CreateCandidateInput> {}

export interface RejectCandidateInput {
  reason: string;
}

export interface RunAiScreeningInput {
  aiSummary?: string;
  strengths?: string;
  weaknesses?: string;
  riskFlags?: string;
}

export interface CompleteRecruiterReviewInput {
  clientProfileSummary?: string;
}

export type CandidateAssetKind = 'RESUME' | 'PROFILE_IMAGE' | 'INTRO_VIDEO';

export interface UploadAssetInput {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  size: number;
}

export interface PrepareAssetUploadInput {
  originalName: string;
  mimeType: string;
  size: number;
}

export interface CompleteAssetUploadInput {
  key: string;
  originalName: string;
  mimeType: string;
  size: number;
}

export interface AssetUploadUrlDto {
  uploadUrl: string;
  key: string;
  bucket: string;
}

export interface ResumeExtractionDraftResult {
  candidate: CandidateDto;
  extraction: import('../../services/resume-extraction.types.js').ResumeExtractionResponse;
}

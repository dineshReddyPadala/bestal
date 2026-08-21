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
  skillCommunityId: number | null;
  skillCommunityName: string | null;
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
  sourceCandidateId: string | null;
  displayName: string | null;
  primaryRole: string | null;
  currentCompany: string | null;
  currentTitle: string | null;
  education: string | null;
  timezone: string | null;
  noticePeriod: string | null;
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
  collaborationCulturalFitScore?: number | null;
  evaluationRecommendation?: string | null;
  reliabilityScore: number | null;
  evaluationStatus: string | null;
  bgvStatus: string | null;
  profileStatus: CandidateProfileStatus | null;
  deploymentStatus: string | null;
  submittedForApprovalAt: string | null;
  /** Client-safe BGV surface when status is CLEAR */
  bgvVerified?: boolean;
  bgvCompletedAt?: string | null;
  bgvSummary?: string | null;
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
  primaryRole: string | null;
  currentCompany: string | null;
  currentTitle: string | null;
  bestalScore: number | null;
  clientBillRate: number | null;
  currency: string | null;
  availabilityStatus: string | null;
  timezoneOverlap: string | null;
  hasResume: boolean;
  hasProfileImage: boolean;
  profileImageUrl: string | null;
  hasIntroVideo: boolean;
  profileStatus: string | null;
  evaluationStatus: string | null;
  bgvStatus: string | null;
  submittedForApprovalAt: string | null;
  hasAiSummary: boolean;
  hasSkills: boolean;
  hasAvailability: boolean;
  hasCommercials: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Marketing-safe evaluation summary for the landing page scorecard. */
export interface PublicFeaturedEvaluationDto {
  technicalScore: number | null;
  problemSolvingScore: number | null;
  collaborationCulturalFitScore: number | null;
  clientReadinessScore: number | null;
  communicationScore: number | null;
  evaluationSummary: string | null;
  recommendation: string | null;
  evaluatorComments: string | null;
  evaluationDate: string | null;
}

/** Marketing-safe candidate row for the public landing page slider. */
export interface PublicFeaturedCandidateDto extends Omit<CandidateListItemDto, 'email'> {
  skillNames: string[];
  publishedAt: string | null;
  evaluation: PublicFeaturedEvaluationDto | null;
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
  /** When true, only candidates submitted for admin approval. */
  pendingApproval?: boolean;
  /** When true, only archived (inactive) candidates; when false, exclude archived. */
  archived?: boolean;
}

export interface CreateCandidateSkillInput {
  skillCommunityId?: number;
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
  timezone?: string;
  noticePeriod?: string;
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

export interface ResumeExtractionDraftResult {
  candidate: CandidateDto;
  extraction: import('../../services/resume-extraction.types.js').ResumeExtractionResponse;
}

/** Async n8n resume screening acceptance (does not wait for OpenAI). */
export interface ResumeScreeningJobAccepted {
  jobId: number;
  status: string;
  /** Null when candidate is created after AI screening completes. */
  candidateId: number | null;
  documentId: number;
}

export type ExtractResumeResult =
  | ResumeExtractionDraftResult
  | ResumeScreeningJobAccepted;

export function isResumeScreeningJobAccepted(
  value: ExtractResumeResult,
): value is ResumeScreeningJobAccepted {
  return 'jobId' in value && !('extraction' in value);
}

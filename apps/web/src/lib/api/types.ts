export type Portal = 'ADMIN' | 'RECRUITER' | 'SALES' | 'CLIENT';

export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'RECRUITER' | 'SALES' | 'CLIENT' | 'VIEWER';

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ApiDataResponse<T> = {
  data: T;
};

export type ApiPaginatedResponse<T> = {
  data: T[];
  meta: PaginationMeta;
};

export type ApiProblemDetail = {
  title: string;
  status: number;
  detail?: string;
  code?: string;
  errors?: { field: string; message: string }[];
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly detail?: ApiProblemDetail,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
};

export type AuthUserProfile = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  organizationId: number | null;
  organizationName: string | null;
  clientId: number | null;
  clientName: string | null;
  role: Role;
  portal: Portal;
  permissions: string[];
  lastLoginAt: string | null;
};

export type LoginRequest = {
  email: string;
  password: string;
  portal: Portal;
  organizationId?: number;
};

export type ForgotPasswordRequest = {
  email: string;
  portal: Extract<Portal, 'RECRUITER' | 'SALES' | 'CLIENT'>;
};

export type ResetPasswordRequest = {
  token: string;
  password: string;
  confirmPassword: string;
};

export type ForgotPasswordResponse = {
  message: string;
  resetToken?: string;
};

export type SkillCommunityListItem = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
};

// ─── Trial ────────────────────────────────────────────────────────────────────

export type TrialDto = {
  id: number;
  organizationId: number;
  candidateId: number;
  candidateName: string;
  clientId: number;
  clientName: string;
  deploymentId: number | null;
  requestedById: number;
  requestedByName: string;
  assignedRecruiterId?: number | null;
  assignedRecruiterName?: string | null;
  status: string;
  roleTitle: string | null;
  startDate: string | null;
  endDate: string | null;
  durationDays: number | null;
  trialType: string | null;
  maxTrialHours: number | null;
  taskDescription: string | null;
  successCriteria: string | null;
  feedback: string | null;
  clientRating: number | null;
  convertedToPaid: boolean;
  outcome: string | null;
  approvedAt: string | null;
  candidateConfirmedAt?: string | null;
  rejectedAt: string | null;
  rejectReason: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TrialListItem = {
  id: number;
  candidateId: number;
  candidateName: string;
  clientId: number;
  clientName: string;
  status: string;
  roleTitle: string | null;
  startDate: string | null;
  endDate: string | null;
  assignedRecruiterId?: number | null;
  assignedRecruiterName?: string | null;
  candidateConfirmedAt?: string | null;
  feedback?: string | null;
  clientRating?: number | null;
  outcome?: string | null;
  createdAt: string;
  updatedAt: string;
};

// ─── Interview ────────────────────────────────────────────────────────────────

export type InterviewDto = {
  id: number;
  organizationId: number;
  candidateId: number;
  candidateName: string;
  clientId: number;
  clientName: string;
  shortlistId: number | null;
  requestedById: number;
  requestedByName: string;
  assignedToId: number | null;
  assignedToName: string | null;
  type: string;
  status: string;
  scheduledAt: string | null;
  durationMinutes: number | null;
  timezone: string | null;
  location: string | null;
  meetingLink: string | null;
  notes: string | null;
  feedback: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  createdAt: string;
  updatedAt: string;
};

export type InterviewListItem = {
  id: number;
  candidateId: number;
  candidateName: string;
  clientId: number;
  clientName: string;
  type: string;
  status: string;
  scheduledAt: string | null;
  durationMinutes: number | null;
  createdAt: string;
  updatedAt: string;
};

// ─── Client ───────────────────────────────────────────────────────────────────

export type ClientDto = {
  id: number;
  organizationId: number;
  accountManagerId: number | null;
  accountManagerName: string | null;
  name: string;
  slug: string;
  status: string;
  industry: string | null;
  website: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  companySize: string | null;
  headquarters: string | null;
  contactName: string | null;
  paymentTerms: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ClientListItem = {
  id: number;
  name: string;
  slug: string;
  status: string;
  industry: string | null;
  accountManagerName: string | null;
  contactEmail: string | null;
  createdAt: string;
  updatedAt: string;
};

// ─── Deployment ─────────────────────────────────────────────────────────────

export type DeploymentDto = {
  id: number;
  organizationId: number;
  candidateId: number;
  candidateName: string;
  clientId: number;
  clientName: string;
  createdById: number;
  createdByName: string;
  requestedById?: number | null;
  status: string;
  placementType: string;
  roleTitle: string;
  startDate: string | null;
  endDate: string | null;
  billingRate: number | null;
  candidatePayRate: number | null;
  grossMarginPerHour: number | null;
  expectedHoursPerWeek: number | null;
  timezone: string | null;
  reportingManagerName: string | null;
  reportingManagerEmail: string | null;
  currency: string | null;
  workLocation: string | null;
  notes: string | null;
  extensionRequestedEndDate?: string | null;
  terminatedAt: string | null;
  terminateReason: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DeploymentListItem = {
  id: number;
  candidateId: number;
  candidateName: string;
  clientId: number;
  clientName: string;
  status: string;
  placementType: string;
  roleTitle: string;
  startDate: string | null;
  endDate: string | null;
  billingRate: number | null;
  candidatePayRate?: number | null;
  expectedHoursPerWeek?: number | null;
  currency: string | null;
  notes?: string | null;
  extensionRequestedEndDate?: string | null;
  createdAt: string;
  updatedAt: string;
};

// ─── Candidate ────────────────────────────────────────────────────────────────

export type CandidateDocumentDto = {
  id: number;
  kind: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  status: string;
  url: string | null;
  createdAt: string;
};

export type CandidateSkillDto = {
  id: number;
  skillCommunityId: number;
  skillCommunityName: string;
  skillName: string | null;
  skillCategory: string | null;
  proficiencyLevel: string;
  yearsExperience: number | null;
  isPrimary: boolean;
  notes?: string | null;
};

export type CandidateListItem = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  visibility: string;
  approvalStatus: string;
  headline: string | null;
  location: string | null;
  yearsExperience: number | null;
  primarySkillCommunityName: string | null;
  primaryRole?: string | null;
  currentCompany?: string | null;
  currentTitle?: string | null;
  bestalScore?: number | null;
  clientBillRate?: number | null;
  currency?: string | null;
  availabilityStatus?: string | null;
  timezoneOverlap?: string | null;
  hasResume?: boolean;
  hasAiSummary?: boolean;
  hasSkills?: boolean;
  hasAvailability?: boolean;
  hasCommercials?: boolean;
  profileStatus: string | null;
  evaluationStatus: string | null;
  bgvStatus: string | null;
  submittedForApprovalAt: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CandidateDto = CandidateListItem & {
  organizationId: number;
  phone: string | null;
  source: string | null;
  summary: string | null;
  availableFrom: string | null;
  expectedRate: number | null;
  currency: string | null;
  linkedinUrl: string | null;
  githubUrl?: string | null;
  naukriUrl?: string | null;
  primarySkillCommunityId: number | null;
  displayName?: string | null;
  primaryRole?: string | null;
  currentCompany?: string | null;
  currentTitle?: string | null;
  education?: string | null;
  clientBillRate?: number | null;
  candidatePayRate?: number | null;
  grossMargin?: number | null;
  availabilityStatus?: string | null;
  timezoneOverlap?: string | null;
  preferredShift?: string | null;
  minHoursPerWeek?: number | null;
  maxHoursPerWeek?: number | null;
  aiSummary?: string | null;
  clientProfileSummary?: string | null;
  strengths?: string | null;
  weaknesses?: string | null;
  riskFlags?: string | null;
  bestalScore?: number | null;
  technicalScore?: number | null;
  communicationScore?: number | null;
  reliabilityScore?: number | null;
  deploymentStatus?: string | null;
  bgvVerified?: boolean;
  bgvCompletedAt?: string | null;
  bgvSummary?: string | null;
  hiddenAt: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  resume?: CandidateDocumentDto | null;
  profileImage?: CandidateDocumentDto | null;
  introVideo?: CandidateDocumentDto | null;
  skills?: CandidateSkillDto[];
};

// ─── Shortlist ────────────────────────────────────────────────────────────────

export type ShortlistCandidateDto = {
  id: number;
  candidateId: number;
  candidateName: string;
  rank: number;
  notes: string | null;
  clientNotes: string | null;
  isApproved: boolean | null;
  approvedAt: string | null;
  createdAt: string;
};

export type ShortlistDto = {
  id: number;
  organizationId: number;
  clientId: number;
  clientName: string;
  createdById: number;
  createdByName: string;
  title: string;
  description: string | null;
  status: string;
  roleTitle: string | null;
  dueDate: string | null;
  closedAt: string | null;
  candidates: ShortlistCandidateDto[];
  createdAt: string;
  updatedAt: string;
};

export type ShortlistListItem = {
  id: number;
  clientId: number;
  clientName: string;
  title: string;
  status: string;
  roleTitle: string | null;
  candidateCount: number;
  createdAt: string;
  updatedAt: string;
};

// ─── Evaluation & BGV (minimal list shapes) ───────────────────────────────────

export type EvaluationListItem = {
  id: number;
  candidateId: number;
  candidateName: string;
  evaluatorName: string;
  evaluatorCompany?: string | null;
  evaluationType?: string | null;
  evaluationDate?: string | null;
  recommendation?: string | null;
  technicalScore?: number | null;
  communicationScore?: number | null;
  problemSolvingScore?: number | null;
  architectureScore?: number | null;
  clientReadinessScore?: number | null;
  evaluatorComments?: string | null;
  aiEvaluationSummary?: string | null;
  recordingUrl?: string | null;
  evaluationFileUrl?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BackgroundCheckListItem = {
  id: number;
  candidateId: number;
  candidateName: string;
  type?: string;
  status: string;
  vendor?: string | null;
  provider?: string | null;
  consentConfirmedAt?: string | null;
  aiSummary?: string | null;
  hasReportDocument?: boolean;
  requestedAt?: string | null;
  initiatedAt?: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BackgroundCheckDto = BackgroundCheckListItem & {
  organizationId?: number;
  requestedById?: number;
  requestedByName?: string;
  externalReferenceId?: string | null;
  resultSummary?: string | null;
  reviewNotes?: string | null;
  vendorAssignedAt?: string | null;
  reviewedAt?: string | null;
  reviewedByName?: string | null;
  hasConsentDocument?: boolean;
  supportingDocumentCount?: number;
  documents?: Array<{
    id: number;
    fileName: string;
    originalName: string;
    mimeType: string;
    description: string | null;
    url: string | null;
    createdAt: string;
  }>;
  expiresAt?: string | null;
};

export type SearchResultItem = {
  type: string;
  id: number;
  title: string;
  subtitle: string | null;
  meta: Record<string, unknown> | null;
};

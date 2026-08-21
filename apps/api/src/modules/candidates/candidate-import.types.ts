import type {
  CandidateAvailabilityStatus,
  CandidateImportRowAction,
  CandidateScoreSource,
  CandidateSource,
  ProficiencyLevel,
} from '@prisma/client';

export type ImportValidationError = {
  sheetName: string;
  rowNumber?: number;
  sourceCandidateId?: string;
  columnName?: string;
  suppliedValue?: string;
  errorCode: string;
  message: string;
};

export type NormalizedSkillRow = {
  skillName: string;
  skillCategory: string | null;
  proficiency: ProficiencyLevel;
  yearsExperience: number | null;
  isPrimary: boolean;
  skillCommunityName: string | null;
};

export type NormalizedEvaluationRow = {
  evaluationType: string | null;
  evaluationDate: string | null;
  evaluatorName: string;
  evaluatorCompany: string | null;
  technicalScore: number | null;
  communicationScore: number | null;
  problemSolvingScore: number | null;
  collaborationCulturalFitScore: number | null;
  clientReadinessScore: number | null;
  recommendation: string | null;
  evaluationSummary: string | null;
  aiEvaluationSummary: string | null;
  comments: string | null;
};

export type NormalizedBgvRow = {
  bgvStatus: string;
  packageType: string;
  vendor: string | null;
  idCheckStatus: string | null;
  addressCheckStatus: string | null;
  employmentCheckStatus: string | null;
  educationCheckStatus: string | null;
  criminalCheckStatus: string | null;
  referenceCheckStatus: string | null;
  initiatedDate: string | null;
  completedDate: string | null;
  bgvSummary: string | null;
  concernNotes: string | null;
};

export type NormalizedScoreRow = {
  bestalScore: number | null;
  reliabilityScore: number | null;
  scoreSource: CandidateScoreSource;
  scoreDate: string | null;
};

export type NormalizedCandidateImport = {
  sourceCandidateId: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  location: string | null;
  country: string | null;
  timezone: string | null;
  headline: string | null;
  yearsExperience: number;
  primaryRole: string;
  skillCommunity: string | null;
  summary: string | null;
  aiSummary: string | null;
  strengths: string | null;
  weaknesses: string | null;
  availabilityStatus: CandidateAvailabilityStatus | null;
  availableFrom: string | null;
  billRate: number | null;
  payRate: number | null;
  currency: string | null;
  source: CandidateSource;
  linkedinUrl: string | null;
  githubUrl: string | null;
  portfolioUrl: string | null;
  currentCompany: string | null;
  currentTitle: string | null;
  noticePeriod: string | null;
  noticePeriodDays: number | null;
  preferredShift: string | null;
  preferredEngagement: string | null;
  minHoursPerWeek: number | null;
  maxHoursPerWeek: number | null;
  hoursPerWeek: number | null;
  education: string | null;
  resumeUrl: string | null;
  skills: NormalizedSkillRow[];
  evaluations: NormalizedEvaluationRow[];
  bgv: NormalizedBgvRow | null;
  scores: NormalizedScoreRow[];
  hasAiFields: boolean;
};

export type CandidateImportPreviewRow = {
  rowNumber: number;
  sourceCandidateId: string;
  email: string | null;
  firstName: string;
  lastName: string;
  source: CandidateSource;
  action: CandidateImportRowAction;
  existingCandidateId: number | null;
  errorMessage: string | null;
};

export type CandidateImportPreviewResult = {
  batchId: number;
  fileName: string;
  expiresAt: string;
  canConfirm: boolean;
  sheetCounts: Record<string, number>;
  created: number;
  updated: number;
  skipped: number;
  failed: number;
  errors: ImportValidationError[];
  rows: CandidateImportPreviewRow[];
};

export type CandidateImportBatchStatusDto = {
  batchId: number;
  fileName: string;
  status: string;
  created: number;
  updated: number;
  skipped: number;
  failed: number;
  processed: number;
  total: number;
  errorSummary: string | null;
  expiresAt: string;
  confirmedAt: string | null;
  completedAt: string | null;
  createdAt: string | null;
  uploadedBy: string | null;
  hasErrorReport: boolean;
  hasSourceFile: boolean;
  canConfirm: boolean;
};

export type CandidateImportHistoryItemDto = {
  batchId: number;
  fileName: string;
  status: string;
  created: number;
  updated: number;
  skipped: number;
  failed: number;
  processed: number;
  total: number;
  errorSummary: string | null;
  uploadedBy: string;
  createdAt: string;
  completedAt: string | null;
  hasErrorReport: boolean;
  hasSourceFile: boolean;
};

export type CandidateImportErrorDto = {
  id: number;
  sheetName: string;
  rowNumber: number | null;
  sourceCandidateId: string | null;
  columnName: string | null;
  suppliedValue: string | null;
  errorCode: string;
  message: string;
};

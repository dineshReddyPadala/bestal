import {
  CANDIDATE_AVAILABILITY_STATUSES,
  CANDIDATE_PROFILE_STATUSES,
  CANDIDATE_SOURCE_LABELS,
  CANDIDATE_SOURCE_OPTIONS,
  CANDIDATE_VISIBILITY_STATUSES,
  displayBgvResultSummary,
  fileNameFromEvaluationFileUrl,
  formatBgvCheckStatusesSummary,
  hasAnyBgvCheckStatus,
  normalizeEvaluationRecommendation,
  normalizeEvaluationType,
  parseNoticePeriodToDays,
  type CandidateProfileStatusValue,
  type CandidateVisibilityStatusValue,
} from '@bestal/shared-utils';
import { z } from 'zod';

const candidateSourceEnum = z.enum(CANDIDATE_SOURCE_OPTIONS);

export const PREFERRED_SHIFT_OPTIONS = [
  'IST Morning',
  'IST Evening',
  'US Eastern',
  'US Pacific',
  'Flexible',
  'Custom/Other',
] as const;

const optionalNumber = z.preprocess(
  (v) =>
    v === '' || v === null || v === undefined || (typeof v === 'number' && Number.isNaN(v))
      ? undefined
      : Number(v),
  z.number().optional().nullable(),
);

export const skillEntrySchema = z.object({
  skillName: z.string().max(150),
  skillCategory: z.string().max(100).optional().nullable(),
  skillCommunityId: z.preprocess(
    (value) => {
      if (value === '' || value === null || value === undefined) return undefined;
      const parsed = Number(value);
      return Number.isNaN(parsed) ? undefined : parsed;
    },
    z.number().int().positive().optional(),
  ),
  proficiencyLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
  yearsExperience: optionalNumber,
  isPrimary: z.boolean(),
  notes: z.string().max(5000).optional().nullable(),
});

/** Fields the recruiter/admin fills in (draft-friendly; submit validates required fields). */
export const candidateWizardFormSchema = z.object({
  firstName: z.string().max(100),
  lastName: z.string().max(100),
  email: z.string().max(255),
  phone: z.string().max(30).optional().nullable(),
  location: z.string().max(255).optional().nullable(),
  linkedinUrl: z.string().max(500).optional().nullable(),
  githubUrl: z.string().max(500).optional().nullable(),
  naukriUrl: z.string().max(500).optional().nullable(),
  displayName: z.string().max(200).optional().nullable(),
  oorwinCandidateId: z.string().max(100).optional().nullable(),
  source: candidateSourceEnum,
  headline: z.string().max(255).optional().nullable(),
  primaryRole: z.string().max(255).optional().nullable(),
  currentCompany: z.string().max(255).optional().nullable(),
  education: z.string().max(500).optional().nullable(),
  summary: z.string().max(10000).optional().nullable(),
  aiSummary: z.string().max(10000).optional().nullable(),
  clientProfileSummary: z.string().max(10000).optional().nullable(),
  strengths: z.string().max(5000).optional().nullable(),
  weaknesses: z.string().max(5000).optional().nullable(),
  yearsExperience: optionalNumber,
  primarySkillCommunityId: optionalNumber,
  skills: z.array(skillEntrySchema),
  availableFrom: z.string().optional().nullable(),
  timezone: z.string().max(100).optional().nullable(),
  availabilityStatus: z.enum(CANDIDATE_AVAILABILITY_STATUSES).optional().nullable(),
  preferredShift: z.string().max(50).optional().nullable(),
  noticePeriodDays: optionalNumber,
  hoursPerWeek: optionalNumber,
  minHoursPerWeek: optionalNumber,
  maxHoursPerWeek: optionalNumber,
  preferredEngagement: z
    .enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE'])
    .optional()
    .nullable(),
  blackoutDates: z.string().optional().nullable(),
  availabilityNotes: z.string().max(2000).optional().nullable(),
  expectedRate: optionalNumber,
  currency: z.string().length(3).optional().nullable(),
  payRate: optionalNumber,
  billRate: optionalNumber,
  pricingNotes: z.string().max(2000).optional().nullable(),
  trialEligible: z.boolean().optional(),
  bestalScore: optionalNumber,
  technicalScore: optionalNumber,
  communicationScore: optionalNumber,
  problemSolvingScore: optionalNumber,
  collaborationCulturalFitScore: optionalNumber,
  clientReadinessScore: optionalNumber,
  evaluatorName: z.string().max(200).optional().nullable(),
  evaluatorCompany: z.string().max(200).optional().nullable(),
  evaluationType: z.string().max(100).optional().nullable(),
  evaluationDate: z.string().optional().nullable(),
  evaluationRecommendation: z.string().max(100).optional().nullable(),
  evaluatorComments: z.string().max(10000).optional().nullable(),
  aiEvaluationSummary: z.string().max(10000).optional().nullable(),
  evaluationFileName: z.string().optional().nullable(),
  bgvStatus: z.string().max(50).optional().nullable(),
  bgvVendor: z.string().max(100).optional().nullable(),
  bgvRequestedByName: z.string().max(100).optional().nullable(),
  bgvCheckType: z
    .enum([
      'COMPREHENSIVE',
      'CRIMINAL',
      'EMPLOYMENT',
      'EDUCATION',
      'REFERENCE',
      'IDENTITY',
      'CREDIT',
    ])
    .optional()
    .nullable(),
  bgvEmployment: z.string().max(50).optional().nullable(),
  bgvCriminal: z.string().max(50).optional().nullable(),
  bgvIdCheck: z.string().max(50).optional().nullable(),
  bgvNotes: z.string().max(2000).optional().nullable(),
  bgvConsentFileName: z.string().optional().nullable(),
  bgvSupportingFileName: z.string().optional().nullable(),
  bgvFileName: z.string().optional().nullable(),
  aiBgvSummary: z.string().max(10000).optional().nullable(),
  bgvResultSummary: z.string().max(5000).optional().nullable(),
  bgvConcernNotes: z.string().max(5000).optional().nullable(),
  bgvInitiatedDate: z.string().optional().nullable(),
  bgvCompletedDate: z.string().optional().nullable(),
  evaluationId: z.number().int().positive().optional().nullable(),
  bgvBackgroundCheckId: z.number().int().positive().optional().nullable(),
  profileStatus: z.enum(CANDIDATE_PROFILE_STATUSES).optional().nullable(),
  visibility: z.enum(CANDIDATE_VISIBILITY_STATUSES).optional().nullable(),
  publishAfterApproval: z.boolean().optional(),
  recruiterNotes: z.string().max(10000).optional().nullable(),
  rejectionReason: z.string().max(500).optional().nullable(),
  resumeFileName: z.string().optional().nullable(),
  profileImageFileName: z.string().optional().nullable(),
  profileImagePreviewUrl: z.string().optional().nullable(),
  introVideoFileName: z.string().optional().nullable(),
});

export type CandidateWizardFormValues = z.infer<typeof candidateWizardFormSchema>;

/** Minimum fields required to create/update a draft in the API. */
export const candidateWizardSaveSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  source: candidateSourceEnum,
});

/** Stricter checks before Submit for Approval. */
export const candidateWizardSubmitSchema = candidateWizardFormSchema
  .extend({
    firstName: z.string().min(1, 'First name is required').max(100),
    lastName: z.string().min(1, 'Last name is required').max(100),
    email: z.string().email('Invalid email').max(255),
    source: candidateSourceEnum,
    availableFrom: z.string().min(1, 'Available from date is required'),
    primarySkillCommunityId: z.number().int().positive('Select a skill community'),
    billRate: z.number().positive('Client bill rate is required'),
    skills: z
      .array(
        skillEntrySchema.extend({
          skillName: z.string().min(1, 'Skill name is required').max(150),
        }),
      )
      .min(1, 'Add at least one skill'),
  });

export type CandidateWizardUploads = {
  resume?: File;
  profileImage?: File;
  introVideo?: File;
  evaluationFile?: File;
  bgvFile?: File;
  bgvConsentFile?: File;
  bgvSupportingFile?: File;
};

export type CandidateWizardValues = CandidateWizardFormValues & {
  organizationId: number;
  photoUrl: string | null;
  status: 'NEW' | 'ACTIVE' | 'INACTIVE' | 'PLACED' | 'DO_NOT_CONTACT';
  visibility: CandidateVisibilityStatusValue;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  publishedAt: string | null;
  hiddenAt: string | null;
  approvedAt: string | null;
  approvedById: number | null;
  rejectedAt: string | null;
  rejectedById: number | null;
  rejectionReason: string | null;
  pricingEffectiveFrom: string | null;
  resumeDocumentId: number | null;
  profileImageDocumentId: number | null;
  introVideoDocumentId: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export const candidateWizardDefaults: CandidateWizardFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  location: '',
  linkedinUrl: '',
  githubUrl: '',
  naukriUrl: '',
  displayName: '',
  oorwinCandidateId: '',
  source: 'LINKEDIN',
  headline: '',
  primaryRole: '',
  currentCompany: '',
  education: '',
  summary: '',
  aiSummary: '',
  clientProfileSummary: '',
  strengths: '',
  weaknesses: '',
  yearsExperience: undefined,
  primarySkillCommunityId: undefined,
  skills: [],
  availableFrom: '',
  timezone: 'Asia/Kolkata',
  availabilityStatus: 'IMMEDIATE',
  preferredShift: '',
  noticePeriodDays: 14,
  hoursPerWeek: 40,
  minHoursPerWeek: undefined,
  maxHoursPerWeek: undefined,
  preferredEngagement: 'CONTRACT',
  blackoutDates: '',
  availabilityNotes: '',
  expectedRate: undefined,
  currency: 'USD',
  payRate: undefined,
  billRate: undefined,
  pricingNotes: '',
  trialEligible: false,
  bestalScore: undefined,
  technicalScore: undefined,
  communicationScore: undefined,
  problemSolvingScore: undefined,
  collaborationCulturalFitScore: undefined,
  clientReadinessScore: undefined,
  evaluatorName: '',
  evaluatorCompany: '',
  evaluationType: '',
  evaluationDate: '',
  evaluationRecommendation: '',
  evaluatorComments: '',
  aiEvaluationSummary: '',
  evaluationFileName: '',
  bgvStatus: 'NOT_STARTED',
  bgvVendor: '',
  bgvRequestedByName: '',
  bgvCheckType: 'COMPREHENSIVE',
  bgvEmployment: 'PENDING',
  bgvCriminal: 'PENDING',
  bgvIdCheck: 'PENDING',
  bgvNotes: '',
  bgvConsentFileName: '',
  bgvSupportingFileName: '',
  bgvFileName: '',
  aiBgvSummary: '',
  bgvResultSummary: '',
  bgvConcernNotes: '',
  bgvInitiatedDate: '',
  bgvCompletedDate: '',
  evaluationId: null,
  bgvBackgroundCheckId: null,
  profileStatus: 'SOURCED',
  visibility: 'INTERNAL_ONLY',
  publishAfterApproval: false,
  recruiterNotes: '',
  rejectionReason: null,
  resumeFileName: '',
  profileImageFileName: '',
  profileImagePreviewUrl: '',
  introVideoFileName: '',
};

/** @deprecated Use candidateWizardFormSchema */
export const candidateWizardSchema = candidateWizardFormSchema;

function demoDocumentId(fileName: string): number {
  let hash = 0;
  for (let i = 0; i < fileName.length; i++) {
    hash = (hash << 5) - hash + fileName.charCodeAt(i);
  }
  return Math.abs(hash % 9000) + 1000;
}

/** Merge user input with server-side defaults (org, audit, workflow). */
export function buildCandidatePayload(form: CandidateWizardFormValues): CandidateWizardValues {
  const now = new Date().toISOString();

  return {
    ...form,
    organizationId: 1,
    photoUrl: null,
    status: 'NEW',
    visibility: form.visibility ?? 'INTERNAL_ONLY',
    approvalStatus: 'PENDING',
    publishedAt: null,
    hiddenAt: null,
    approvedAt: null,
    approvedById: null,
    rejectedAt: null,
    rejectedById: null,
    rejectionReason: null,
    pricingEffectiveFrom: form.availableFrom || null,
    resumeDocumentId: form.resumeFileName ? demoDocumentId(form.resumeFileName) : null,
    profileImageDocumentId: form.profileImageFileName
      ? demoDocumentId(form.profileImageFileName)
      : null,
    introVideoDocumentId: form.introVideoFileName ? demoDocumentId(form.introVideoFileName) : null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
}

/** Progress track shown above the form (wireframe order). */
export const WIZARD_PROGRESS_STEPS = [
  { id: 'basic', label: 'Basic Info', tabId: 'basic' },
  { id: 'professional', label: 'Professional', tabId: 'professional' },
  { id: 'skills', label: 'Skills', tabId: 'skills' },
  { id: 'availability', label: 'Availability', tabId: 'availability' },
  { id: 'pricing', label: 'Pricing', tabId: 'pricing' },
  { id: 'documents', label: 'Documents', tabId: 'documents' },
  { id: 'evaluation', label: 'Evaluation', tabId: 'evaluation' },
  { id: 'background-check', label: 'Background Check', tabId: 'background-check' },
  { id: 'review', label: 'Review', tabId: 'review' },
] as const;

/** Tabbed sections for create-candidate wizard. */
export const WIZARD_TABS = [
  {
    id: 'basic',
    label: 'Basic Details',
    description: 'Contact details, upload resume, and run AI screening',
  },
  {
    id: 'professional',
    label: 'Professional Details',
    description: 'Role, experience, links, and AI profile summary',
  },
  {
    id: 'skills',
    label: 'Skills',
    description: 'Skill communities, proficiency, and primary skill',
  },
  {
    id: 'availability',
    label: 'Availability',
    description: 'Availability status, hours, and engagement',
  },
  {
    id: 'pricing',
    label: 'Pricing',
    description: 'Pay rate, bill rate, and margin',
  },
  {
    id: 'documents',
    label: 'Documents',
    description: 'Photo, video, resume, and supporting files',
  },
  {
    id: 'evaluation',
    label: 'Evaluation',
    description: 'Technical and communication scores',
  },
  {
    id: 'background-check',
    label: 'Background Verification',
    description: 'BGV status and report',
  },
  {
    id: 'review',
    label: 'Review',
    description: 'Confirm details, visibility, and recruiter notes',
  },
] as const;

export type WizardTabId = (typeof WIZARD_TABS)[number]['id'];
export type WizardProgressId = (typeof WIZARD_PROGRESS_STEPS)[number]['id'];

const tabSaveSchemas: Partial<Record<WizardTabId, z.ZodTypeAny>> = {
  basic: candidateWizardSaveSchema,
  professional: z.object({
    primaryRole: z.string().min(1, 'Primary role is required'),
  }),
  skills: z.object({
    skills: z
      .array(skillEntrySchema)
      .refine((skills) => skills.some((s) => s.skillName?.trim()), {
        message: 'Add at least one skill',
      }),
  }),
  availability: z.object({
    availableFrom: z.string().min(1, 'Available from date is required'),
    availabilityStatus: z.enum(CANDIDATE_AVAILABILITY_STATUSES, {
      message: 'Availability status is required',
    }),
  }),
  pricing: z.object({
    billRate: z
      .number({ message: 'Client bill rate is required' })
      .positive('Client bill rate must be greater than 0'),
  }),
  evaluation: z.object({
    evaluatorName: z.string().min(1, 'Evaluator name is required'),
    technicalScore: z.number({ message: 'Technical score is required' }),
    communicationScore: z.number({ message: 'Communication score is required' }),
  }),
};

export function validateWizardTabForSave(
  tabId: WizardTabId,
  values: CandidateWizardFormValues,
): { success: true } | { success: false; message: string } {
  const schema = tabSaveSchemas[tabId];
  if (!schema) return { success: true };
  const parsed = schema.safeParse(values);
  if (parsed.success) return { success: true };
  const first = parsed.error.issues[0];
  return {
    success: false,
    message: first?.message ?? 'Please complete required fields on this tab',
  };
}

export function getCandidateSourceLabel(source: string): string {
  return CANDIDATE_SOURCE_LABELS[source as keyof typeof CANDIDATE_SOURCE_LABELS] ?? source;
}

/** @deprecated Prefer WIZARD_TABS */
export const WIZARD_STEPS = WIZARD_TABS;
/** @deprecated Prefer WizardTabId */
export type WizardStepId = WizardTabId;

export type CandidateEntryMethod = 'resume' | 'oorwin' | 'manual' | 'csv';

export function getInitialTabForEntryMethod(_method: CandidateEntryMethod): WizardTabId {
  return 'basic';
}

/** @deprecated Prefer getInitialTabForEntryMethod */
export function getInitialStepIndexForEntryMethod(method: CandidateEntryMethod): number {
  const tabId = getInitialTabForEntryMethod(method);
  return WIZARD_TABS.findIndex((tab) => tab.id === tabId);
}

export function isProgressStepComplete(
  stepId: WizardProgressId,
  values: CandidateWizardFormValues,
): boolean {
  switch (stepId) {
    case 'basic':
      return Boolean(
        values.firstName?.trim() &&
          values.lastName?.trim() &&
          values.email?.trim() &&
          values.source,
      );
    case 'professional':
      return Boolean(values.primaryRole?.trim() || values.yearsExperience != null);
    case 'skills':
      return values.skills.some((s) => s.skillName?.trim());
    case 'availability':
      return Boolean(values.availableFrom?.trim() && values.availabilityStatus);
    case 'pricing':
      return values.billRate != null && !Number.isNaN(values.billRate) && values.billRate > 0;
    case 'evaluation':
      return (
        values.technicalScore != null &&
        !Number.isNaN(values.technicalScore) &&
        values.communicationScore != null &&
        !Number.isNaN(values.communicationScore)
      );
    case 'background-check':
      return Boolean(
        values.aiBgvSummary?.trim() ||
          (values.bgvStatus &&
            values.bgvStatus !== 'NOT_STARTED' &&
            values.bgvStatus !== 'FAILED' &&
            values.bgvVendor?.trim()),
      );
    case 'documents':
      return Boolean(values.resumeFileName?.trim() || values.profileImageFileName?.trim());
    case 'review':
      return Boolean(values.profileStatus);
    default:
      return false;
  }
}

/** Submit for Approval unlocks after basic, skills, availability, pricing, evaluation, and BGV. */
export function canSubmitCandidateForApproval(
  values: CandidateWizardFormValues,
): boolean {
  return (
    isProgressStepComplete('basic', values) &&
    isProgressStepComplete('skills', values) &&
    isProgressStepComplete('availability', values) &&
    isProgressStepComplete('pricing', values) &&
    isProgressStepComplete('evaluation', values) &&
    isProgressStepComplete('background-check', values)
  );
}

export const DRAFT_STORAGE_KEY = 'bestal-candidate-wizard-draft';

export const USER_FIELD_LABELS: Record<keyof CandidateWizardFormValues, string> = {
  firstName: 'First Name',
  lastName: 'Last Name',
  email: 'Email',
  phone: 'Phone',
  location: 'Location',
  linkedinUrl: 'LinkedIn',
  githubUrl: 'GitHub',
  naukriUrl: 'Naukri',
  displayName: 'Display Name',
  oorwinCandidateId: 'Oorwin ID',
  source: 'Source',
  headline: 'Headline',
  primaryRole: 'Current Role',
  currentCompany: 'Current Company',
  education: 'Education',
  summary: 'Summary',
  aiSummary: 'Candidate Summary',
  clientProfileSummary: 'Client Profile Summary',
  strengths: 'Strengths',
  weaknesses: 'Weaknesses',
  yearsExperience: 'Years Experience',
  primarySkillCommunityId: 'Skill Community',
  skills: 'Skills',
  availableFrom: 'Available From',
  timezone: 'Timezone',
  availabilityStatus: 'Availability',
  preferredShift: 'Preferred Shift',
  noticePeriodDays: 'Notice Period (days)',
  hoursPerWeek: 'Hours Per Week',
  minHoursPerWeek: 'Min Hours / Week',
  maxHoursPerWeek: 'Max Hours / Week',
  preferredEngagement: 'Preferred Engagement',
  blackoutDates: 'Blackout Dates',
  availabilityNotes: 'Availability Notes',
  expectedRate: 'Expected Rate',
  currency: 'Currency',
  payRate: 'Candidate Pay Rate',
  billRate: 'Client Bill Rate',
  pricingNotes: 'Pricing Notes',
  trialEligible: 'Trial Eligible',
  bestalScore: 'BesTal Score',
  technicalScore: 'Technical Score',
  communicationScore: 'Communication',
  problemSolvingScore: 'Problem Solving',
  collaborationCulturalFitScore: 'Collaboration & Cultural Fit',
  clientReadinessScore: 'Client Readiness',
  evaluatorName: 'Evaluator Name',
  evaluatorCompany: 'Evaluator Company',
  evaluationType: 'Evaluation Type',
  evaluationDate: 'Evaluation Date',
  evaluationRecommendation: 'Recommendation',
  evaluatorComments: 'Evaluator Comments',
  aiEvaluationSummary: 'AI Evaluation Summary',
  evaluationFileName: 'Evaluation File',
  bgvStatus: 'BGV Status',
  bgvVendor: 'BGV Vendor',
  bgvRequestedByName: 'BGV Requested By',
  bgvCheckType: 'BGV Package Type',
  bgvEmployment: 'Employment Check',
  bgvCriminal: 'Criminal Check',
  bgvIdCheck: 'Identity Check',
  bgvNotes: 'BGV Notes',
  bgvConsentFileName: 'BGV Consent',
  bgvSupportingFileName: 'BGV Supporting Document',
  bgvFileName: 'BGV Report',
  aiBgvSummary: 'AI BGV Summary',
  bgvResultSummary: 'BGV Summary',
  bgvConcernNotes: 'BGV Concern Notes',
  bgvInitiatedDate: 'BGV Initiated Date',
  bgvCompletedDate: 'BGV Completed Date',
  evaluationId: 'Evaluation Record ID',
  bgvBackgroundCheckId: 'BGV Record ID',
  profileStatus: 'Profile Status',
  visibility: 'Visibility',
  publishAfterApproval: 'Publish after Approval',
  recruiterNotes: 'Recruiter Notes',
  rejectionReason: 'Return Reason',
  resumeFileName: 'Resume',
  profileImageFileName: 'Profile Photo',
  profileImagePreviewUrl: 'Profile Photo Preview',
  introVideoFileName: 'Intro Video',
};

export const FIELD_LABELS = USER_FIELD_LABELS;

export const REVIEW_FIELD_KEYS: (keyof CandidateWizardFormValues)[] = [
  'firstName',
  'lastName',
  'email',
  'phone',
  'location',
  'primaryRole',
  'yearsExperience',
  'primarySkillCommunityId',
  'availableFrom',
  'timezone',
  'aiSummary',
  'bestalScore',
  'payRate',
  'billRate',
  'technicalScore',
  'communicationScore',
  'bgvStatus',
  'profileStatus',
  'visibility',
  'resumeFileName',
];

/** Split a single full-name string into first / last. */
export function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const trimmed = fullName.trim().replace(/\s+/g, ' ');
  if (!trimmed) return { firstName: '', lastName: '' };
  const space = trimmed.indexOf(' ');
  if (space === -1) return { firstName: trimmed, lastName: '' };
  return {
    firstName: trimmed.slice(0, space),
    lastName: trimmed.slice(space + 1),
  };
}

export function joinFullName(firstName: string, lastName: string): string {
  return [firstName, lastName].filter(Boolean).join(' ').trim();
}

/** Dedupe wizard skill rows that share the same skill name (case-insensitive). */
export function mergeWizardSkills<
  T extends {
    skillName: string;
    skillCategory?: string | null;
    skillCommunityId?: number | null;
    proficiencyLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
    yearsExperience?: number | null;
    isPrimary: boolean;
    notes?: string | null;
  },
>(skills: T[]): T[] {
  const rank = { BEGINNER: 1, INTERMEDIATE: 2, ADVANCED: 3, EXPERT: 4 } as const;
  const byName = new Map<string, T>();

  for (const skill of skills) {
    const label = skill.skillName?.trim();
    if (!label) continue;
    const key = label.toLowerCase();
    const existing = byName.get(key);
    if (!existing) {
      byName.set(key, { ...skill, skillName: label });
      continue;
    }

    const existingRank = rank[existing.proficiencyLevel];
    const incomingRank = rank[skill.proficiencyLevel];
    byName.set(key, {
      ...existing,
      skillCategory: existing.skillCategory ?? skill.skillCategory,
      skillCommunityId: existing.skillCommunityId ?? skill.skillCommunityId,
      notes: [existing.notes, skill.notes].filter(Boolean).join('; ').slice(0, 5000) || undefined,
      isPrimary: existing.isPrimary || skill.isPrimary,
      yearsExperience:
        Math.max(existing.yearsExperience ?? 0, skill.yearsExperience ?? 0) || undefined,
      proficiencyLevel:
        incomingRank > existingRank ? skill.proficiencyLevel : existing.proficiencyLevel,
    });
  }

  return [...byName.values()];
}

/** Map wizard form values to the API create/update-candidate request body. */
export function mapWizardToApiCreateBody(
  form: CandidateWizardFormValues,
): Record<string, unknown> {
  const expectedRate = finiteNumberOrUndefined(form.expectedRate);
  const payRate = finiteNumberOrUndefined(form.payRate) ?? expectedRate;
  const bill = finiteNumberOrUndefined(form.billRate);
  const grossMargin = payRate != null && bill != null ? bill - payRate : undefined;
  const aiSummary = form.aiSummary?.trim() || form.summary?.trim() || undefined;
  const primarySkillCommunityId = positiveIdOrUndefined(form.primarySkillCommunityId);
  const skills = mergeWizardSkills(form.skills)
    .map((skill) => {
      const skillName = skill.skillName?.trim();
      if (!skillName) return null;
      const skillCommunityId =
        positiveIdOrUndefined(skill.skillCommunityId) ?? primarySkillCommunityId;
      return {
        skillCommunityId,
        skillName: skillName.slice(0, 150),
        skillCategory: emptyToUndefined(skill.skillCategory ?? undefined),
        proficiencyLevel: skill.proficiencyLevel,
        yearsExperience: finiteNumberOrUndefined(skill.yearsExperience),
        isPrimary: skill.isPrimary,
        notes: emptyToUndefined(skill.notes),
      };
    })
    .filter((skill): skill is NonNullable<typeof skill> => skill !== null);

  return {
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    email: form.email.trim(),
    phone: emptyToUndefined(form.phone),
    source: form.source,
    headline: emptyToUndefined(form.headline) ?? emptyToUndefined(form.primaryRole),
    summary: emptyToUndefined(form.summary) ?? aiSummary,
    location: emptyToUndefined(form.location),
    yearsExperience: finiteNumberOrUndefined(form.yearsExperience),
    availableFrom: emptyToUndefined(form.availableFrom),
    expectedRate,
    currency: emptyToUndefined(form.currency),
    linkedinUrl: emptyToUndefined(form.linkedinUrl),
    githubUrl: emptyToUndefined(form.githubUrl),
    naukriUrl: emptyToUndefined(form.naukriUrl),
    displayName: emptyToUndefined(form.displayName),
    oorwinCandidateId: emptyToUndefined(form.oorwinCandidateId),
    primaryRole: emptyToUndefined(form.primaryRole),
    currentCompany: emptyToUndefined(form.currentCompany),
    education: emptyToUndefined(form.education),
    aiSummary,
    clientProfileSummary: emptyToUndefined(form.clientProfileSummary) ?? aiSummary,
    strengths: emptyToUndefined(form.strengths),
    weaknesses: emptyToUndefined(form.weaknesses),
    ...(primarySkillCommunityId != null ? { primarySkillCommunityId } : {}),
    clientBillRate: bill,
    candidatePayRate: payRate,
    grossMargin: finiteNumberOrUndefined(grossMargin),
    bestalScore: finiteNumberOrUndefined(form.bestalScore),
    technicalScore: finiteNumberOrUndefined(form.technicalScore),
    communicationScore: finiteNumberOrUndefined(form.communicationScore),
    evaluationStatus:
      form.technicalScore != null &&
      !Number.isNaN(form.technicalScore) &&
      form.communicationScore != null &&
      !Number.isNaN(form.communicationScore)
        ? 'COMPLETED'
        : emptyToUndefined(form.evaluationRecommendation) ?? 'NOT_STARTED',
    bgvStatus: emptyToUndefined(form.bgvStatus) ?? 'NOT_STARTED',
    profileStatus: (form.profileStatus ?? undefined) as CandidateProfileStatusValue | undefined,
    timezone: emptyToUndefined(form.timezone),
    timezoneOverlap: emptyToUndefined(form.timezone),
    noticePeriod:
      form.noticePeriodDays != null && !Number.isNaN(form.noticePeriodDays)
        ? `${form.noticePeriodDays} days`
        : undefined,
    availabilityStatus: form.availabilityStatus ?? undefined,
    preferredShift: emptyToUndefined(form.preferredShift),
    minHoursPerWeek: finiteNumberOrUndefined(
      form.minHoursPerWeek ?? form.hoursPerWeek ?? undefined,
    ),
    maxHoursPerWeek: finiteNumberOrUndefined(
      form.maxHoursPerWeek ?? form.hoursPerWeek ?? undefined,
    ),
    visibility: (form.visibility ?? 'INTERNAL_ONLY') satisfies CandidateVisibilityStatusValue,
    ...(skills.length > 0 ? { skills } : {}),
  };
}

/** Map wizard evaluation fields to PATCH /evaluations/:id body. */
export function mapWizardToEvaluationUpdateBody(
  form: CandidateWizardFormValues,
): Record<string, unknown> {
  const body: Record<string, unknown> = {};

  const evaluatorName = emptyToUndefined(form.evaluatorName);
  if (evaluatorName) body.evaluatorName = evaluatorName;

  const evaluatorCompany = emptyToUndefined(form.evaluatorCompany);
  if (evaluatorCompany !== undefined) body.evaluatorCompany = evaluatorCompany;

  const evaluationType = normalizeEvaluationType(form.evaluationType);
  if (evaluationType) body.evaluationType = evaluationType;

  const evaluationDate = emptyToUndefined(form.evaluationDate);
  if (evaluationDate !== undefined) body.evaluationDate = evaluationDate;

  const technicalScore = finiteNumberOrUndefined(form.technicalScore);
  if (technicalScore !== undefined) body.technicalScore = technicalScore;

  const communicationScore = finiteNumberOrUndefined(form.communicationScore);
  if (communicationScore !== undefined) body.communicationScore = communicationScore;

  const problemSolvingScore = finiteNumberOrUndefined(form.problemSolvingScore);
  if (problemSolvingScore !== undefined) body.problemSolvingScore = problemSolvingScore;

  const collaborationCulturalFitScore = finiteNumberOrUndefined(form.collaborationCulturalFitScore);
  if (collaborationCulturalFitScore !== undefined) body.collaborationCulturalFitScore = collaborationCulturalFitScore;

  const clientReadinessScore = finiteNumberOrUndefined(form.clientReadinessScore);
  if (clientReadinessScore !== undefined) body.clientReadinessScore = clientReadinessScore;

  const recommendation = normalizeEvaluationRecommendation(form.evaluationRecommendation);
  if (recommendation) body.recommendation = recommendation;

  const evaluatorComments = emptyToUndefined(form.evaluatorComments);
  if (evaluatorComments !== undefined) body.evaluatorComments = evaluatorComments;

  const aiEvaluationSummary = emptyToUndefined(form.aiEvaluationSummary);
  if (aiEvaluationSummary !== undefined) body.aiEvaluationSummary = aiEvaluationSummary;

  return body;
}

export const BGV_WIZARD_STATUS_OPTIONS = [
  'NOT_STARTED',
  'PENDING',
  'CONSENT_PENDING',
  'INITIATED',
  'IN_PROGRESS',
  'SUSPENDED',
  'CLEAR',
  'COMPLETED_CLEAR',
  'COMPLETED_WITH_CONCERN',
  'FAILED',
  'EXPIRED',
] as const;

export function mapWizardBgvStatusFromApi(status: string): string {
  if (status === 'COMPLETED_CLEAR') return 'CLEAR';
  return status;
}

export function mapWizardBgvStatusToApi(status: string | undefined): string | undefined {
  const trimmed = status?.trim();
  if (!trimmed) return undefined;
  if (trimmed === 'CLEAR') return 'COMPLETED_CLEAR';
  return trimmed;
}

/** Map wizard BGV fields to PATCH /background-checks/:id body. */
export function mapWizardToBgvUpdateBody(
  form: CandidateWizardFormValues,
): Record<string, unknown> {
  const checkFields = {
    idCheckStatus: form.bgvIdCheck ?? null,
    employmentCheckStatus: form.bgvEmployment ?? null,
    criminalCheckStatus: form.bgvCriminal ?? null,
  };
  const body: Record<string, unknown> = {};
  const status = mapWizardBgvStatusToApi(emptyToUndefined(form.bgvStatus));
  if (status) body.status = status;
  const provider = emptyToUndefined(form.bgvVendor);
  if (provider) body.provider = provider;
  body.aiSummary = emptyToUndefined(form.aiBgvSummary) ?? null;
  body.reviewNotes = emptyToUndefined(form.bgvConcernNotes) ?? null;
  body.resultSummary =
    emptyToUndefined(form.bgvResultSummary) ??
    (hasAnyBgvCheckStatus(checkFields) ? formatBgvCheckStatusesSummary(checkFields) : null);
  if (form.bgvCheckType) body.type = form.bgvCheckType;
  body.idCheckStatus = emptyToUndefined(form.bgvIdCheck) ?? null;
  body.employmentCheckStatus = emptyToUndefined(form.bgvEmployment) ?? null;
  body.criminalCheckStatus = emptyToUndefined(form.bgvCriminal) ?? null;
  const initiatedDate = emptyToUndefined(form.bgvInitiatedDate);
  if (initiatedDate) body.initiatedAt = `${initiatedDate}T00:00:00.000Z`;
  const completedDate = emptyToUndefined(form.bgvCompletedDate);
  if (completedDate) body.completedAt = `${completedDate}T00:00:00.000Z`;
  return body;
}

function emptyToUndefined(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function finiteNumberOrUndefined(value: number | null | undefined): number | undefined {
  if (value == null || Number.isNaN(value) || !Number.isFinite(value)) return undefined;
  return value;
}

/** Omit unset / empty select values (HTML number selects often coerce "" → 0). */
function positiveIdOrUndefined(value: number | null | undefined): number | undefined {
  if (value == null || Number.isNaN(value) || value <= 0) return undefined;
  return value;
}

/** Prefill wizard when editing an existing candidate (SOURCED / AI_SCREENED / drafts). */
export function mapCandidateDtoToWizardForm(
  candidate: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
    location?: string | null;
    linkedinUrl?: string | null;
    githubUrl?: string | null;
    naukriUrl?: string | null;
    displayName?: string | null;
    oorwinCandidateId?: string | null;
    source?: string | null;
    headline?: string | null;
    primaryRole?: string | null;
    currentCompany?: string | null;
    education?: string | null;
    summary?: string | null;
    aiSummary?: string | null;
    clientProfileSummary?: string | null;
    strengths?: string | null;
    weaknesses?: string | null;
    yearsExperience?: number | null;
    primarySkillCommunityId?: number | null;
    availableFrom?: string | null;
    timezone?: string | null;
    timezoneOverlap?: string | null;
    noticePeriod?: string | null;
    availabilityStatus?: string | null;
    preferredShift?: string | null;
    minHoursPerWeek?: number | null;
    maxHoursPerWeek?: number | null;
    expectedRate?: number | null;
    currency?: string | null;
    clientBillRate?: number | null;
    candidatePayRate?: number | null;
    grossMargin?: number | null;
    bestalScore?: number | null;
    technicalScore?: number | null;
    communicationScore?: number | null;
    profileStatus?: string | null;
    visibility?: string | null;
    rejectionReason?: string | null;
    bgvStatus?: string | null;
    profileImage?: { fileName: string; originalName: string; url: string | null } | null;
    resume?: { fileName: string; originalName: string; url: string | null } | null;
    skills?: Array<{
      skillCommunityId: number;
      skillCommunityName?: string;
      skillName?: string | null;
      skillCategory?: string | null;
      proficiencyLevel: string;
      yearsExperience?: number | null;
      isPrimary: boolean;
      notes?: string | null;
    }>;
  },
  linked?: {
    evaluation?: {
      id: number;
      evaluatorName?: string | null;
      evaluatorCompany?: string | null;
      evaluationType?: string | null;
      evaluationDate?: string | null;
      recommendation?: string | null;
      technicalScore?: number | null;
      communicationScore?: number | null;
      problemSolvingScore?: number | null;
      collaborationCulturalFitScore?: number | null;
      clientReadinessScore?: number | null;
      evaluatorComments?: string | null;
      aiEvaluationSummary?: string | null;
    } | null;
    bgv?: {
      id: number;
      status: string;
      provider?: string | null;
      vendor?: string | null;
      aiSummary?: string | null;
      resultSummary?: string | null;
      reviewNotes?: string | null;
      type?: string | null;
      idCheckStatus?: string | null;
      employmentCheckStatus?: string | null;
      criminalCheckStatus?: string | null;
      initiatedAt?: string | null;
      completedAt?: string | null;
      documents?: Array<{
        description: string | null;
        originalName: string;
      }>;
    } | null;
  },
): Partial<CandidateWizardFormValues> {
  const base: Partial<CandidateWizardFormValues> = {
    firstName: candidate.firstName,
    lastName: candidate.lastName,
    email: candidate.email,
    phone: candidate.phone ?? '',
    location: candidate.location ?? '',
    linkedinUrl: candidate.linkedinUrl ?? '',
    githubUrl: candidate.githubUrl ?? '',
    naukriUrl: candidate.naukriUrl ?? '',
    displayName: candidate.displayName ?? '',
    oorwinCandidateId: candidate.oorwinCandidateId ?? '',
    source: (candidate.source as CandidateWizardFormValues['source']) || 'OTHER',
    headline: candidate.headline ?? '',
    primaryRole: candidate.primaryRole ?? '',
    currentCompany: candidate.currentCompany ?? '',
    education: candidate.education ?? '',
    summary: candidate.summary ?? '',
    aiSummary: candidate.aiSummary ?? '',
    clientProfileSummary: candidate.clientProfileSummary ?? '',
    strengths: candidate.strengths ?? '',
    weaknesses: candidate.weaknesses ?? '',
    yearsExperience: candidate.yearsExperience ?? undefined,
    primarySkillCommunityId: candidate.primarySkillCommunityId ?? undefined,
    skills: (candidate.skills ?? []).map((s) => ({
      skillName: s.skillName ?? s.notes ?? s.skillCommunityName ?? '',
      skillCategory: s.skillCategory ?? '',
      skillCommunityId: s.skillCommunityId ?? candidate.primarySkillCommunityId ?? undefined,
      proficiencyLevel: s.proficiencyLevel as CandidateWizardFormValues['skills'][number]['proficiencyLevel'],
      yearsExperience: s.yearsExperience ?? undefined,
      isPrimary: s.isPrimary,
      notes: s.notes ?? '',
    })),
    availableFrom: candidate.availableFrom ?? '',
    timezone: candidate.timezone ?? candidate.timezoneOverlap ?? '',
    availabilityStatus:
      (candidate.availabilityStatus as CandidateWizardFormValues['availabilityStatus']) ||
      'IMMEDIATE',
    preferredShift: candidate.preferredShift ?? '',
    noticePeriodDays: parseNoticePeriodToDays(candidate.noticePeriod) ?? undefined,
    minHoursPerWeek: candidate.minHoursPerWeek ?? undefined,
    maxHoursPerWeek: candidate.maxHoursPerWeek ?? undefined,
    hoursPerWeek: candidate.maxHoursPerWeek ?? candidate.minHoursPerWeek ?? 40,
    expectedRate: candidate.expectedRate ?? candidate.candidatePayRate ?? undefined,
    currency: candidate.currency ?? 'USD',
    billRate: candidate.clientBillRate ?? undefined,
    payRate: candidate.candidatePayRate ?? undefined,
    bestalScore: candidate.bestalScore ?? undefined,
    technicalScore: candidate.technicalScore ?? undefined,
    communicationScore: candidate.communicationScore ?? undefined,
    profileStatus:
      (candidate.profileStatus as CandidateWizardFormValues['profileStatus']) || 'SOURCED',
    visibility:
      (candidate.visibility as CandidateWizardFormValues['visibility']) || 'INTERNAL_ONLY',
    bgvStatus: (candidate.bgvStatus as CandidateWizardFormValues['bgvStatus']) || 'NOT_STARTED',
    resumeFileName:
      candidate.resume?.originalName ?? candidate.resume?.fileName ?? undefined,
    profileImageFileName:
      candidate.profileImage?.originalName ?? candidate.profileImage?.fileName ?? undefined,
    profileImagePreviewUrl: candidate.profileImage?.url ?? undefined,
    rejectionReason: candidate.rejectionReason ?? null,
  };

  if (linked?.evaluation) {
    const evaluation = linked.evaluation;
    base.evaluationId = evaluation.id;
    base.evaluatorName = evaluation.evaluatorName ?? '';
    base.evaluatorCompany = evaluation.evaluatorCompany ?? '';
    base.evaluationType = normalizeEvaluationType(evaluation.evaluationType) ?? '';
    base.evaluationDate = evaluation.evaluationDate ?? '';
    base.evaluationRecommendation =
      normalizeEvaluationRecommendation(evaluation.recommendation) ?? '';
    base.evaluatorComments = evaluation.evaluatorComments ?? '';
    base.aiEvaluationSummary = evaluation.aiEvaluationSummary ?? '';
    const evalFileName = fileNameFromEvaluationFileUrl(
      (evaluation as { evaluationFileUrl?: string | null }).evaluationFileUrl,
    );
    if (evalFileName) {
      base.evaluationFileName = evalFileName;
    }
    if (evaluation.technicalScore != null) base.technicalScore = evaluation.technicalScore;
    if (evaluation.communicationScore != null) {
      base.communicationScore = evaluation.communicationScore;
    }
    if (evaluation.problemSolvingScore != null) {
      base.problemSolvingScore = evaluation.problemSolvingScore;
    }
    if (evaluation.collaborationCulturalFitScore != null) {
      base.collaborationCulturalFitScore = evaluation.collaborationCulturalFitScore;
    }
    if (evaluation.clientReadinessScore != null) {
      base.clientReadinessScore = evaluation.clientReadinessScore;
    }
  }

  if (linked?.bgv) {
    const bgv = linked.bgv;
    const checkFields = {
      idCheckStatus: bgv.idCheckStatus,
      employmentCheckStatus: bgv.employmentCheckStatus,
      criminalCheckStatus: bgv.criminalCheckStatus,
    };
    base.bgvBackgroundCheckId = bgv.id;
    base.bgvStatus = mapWizardBgvStatusFromApi(bgv.status);
    base.bgvVendor = bgv.provider ?? bgv.vendor ?? '';
    base.aiBgvSummary = bgv.aiSummary ?? '';
    base.bgvResultSummary = displayBgvResultSummary(bgv.resultSummary, checkFields);
    base.bgvConcernNotes = bgv.reviewNotes ?? '';
    if (bgv.type) {
      base.bgvCheckType = bgv.type as CandidateWizardFormValues['bgvCheckType'];
    }
    base.bgvEmployment = bgv.employmentCheckStatus ?? '';
    base.bgvCriminal = bgv.criminalCheckStatus ?? '';
    base.bgvIdCheck = bgv.idCheckStatus ?? '';
    base.bgvInitiatedDate = bgv.initiatedAt ? bgv.initiatedAt.slice(0, 10) : '';
    base.bgvCompletedDate = bgv.completedAt ? bgv.completedAt.slice(0, 10) : '';
    for (const doc of bgv.documents ?? []) {
      if (doc.description === 'CONSENT' && !base.bgvConsentFileName) {
        base.bgvConsentFileName = doc.originalName;
      }
      if (doc.description === 'REPORT' && !base.bgvFileName) {
        base.bgvFileName = doc.originalName;
      }
      if (doc.description === 'SUPPORTING' && !base.bgvSupportingFileName) {
        base.bgvSupportingFileName = doc.originalName;
      }
    }
  }

  return base;
}

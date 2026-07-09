import { z } from 'zod';

const optionalNumber = z.preprocess(
  (v) =>
    v === '' || v === null || v === undefined || (typeof v === 'number' && Number.isNaN(v))
      ? undefined
      : Number(v),
  z.number().optional().nullable(),
);

export const skillEntrySchema = z.object({
  skillCommunityId: z.preprocess(
    (value) => {
      if (value === '' || value === null || value === undefined) return undefined;
      const parsed = Number(value);
      return Number.isNaN(parsed) ? undefined : parsed;
    },
    z.number().int().positive('Select a skill community'),
  ),
  proficiencyLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
  yearsExperience: optionalNumber,
  isPrimary: z.boolean(),
  notes: z.string().max(5000).optional().nullable(),
});

/** Fields the recruiter/admin actually fills in. */
export const candidateWizardFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email').max(255),
  phone: z.string().max(30).optional().nullable(),
  location: z.string().max(255).optional().nullable(),
  linkedinUrl: z.string().max(500).optional().nullable(),
  githubUrl: z.string().max(500).optional().nullable(),
  naukriUrl: z.string().max(500).optional().nullable(),
  displayName: z.string().max(200).optional().nullable(),
  oorwinCandidateId: z.string().max(100).optional().nullable(),
  source: z.enum(['DIRECT', 'REFERRAL', 'JOB_BOARD', 'LINKEDIN', 'AGENCY', 'INTERNAL', 'OTHER']),
  headline: z.string().max(255).optional().nullable(),
  primaryRole: z.string().max(255).optional().nullable(),
  currentCompany: z.string().max(255).optional().nullable(),
  education: z.string().max(500).optional().nullable(),
  summary: z.string().max(10000).optional().nullable(),
  clientProfileSummary: z.string().max(10000).optional().nullable(),
  strengths: z.string().max(5000).optional().nullable(),
  weaknesses: z.string().max(5000).optional().nullable(),
  yearsExperience: optionalNumber,
  primarySkillCommunityId: optionalNumber,
  skills: z.array(skillEntrySchema).min(1, 'Add at least one skill'),
  availableFrom: z.string().min(1, 'Available from date is required'),
  timezone: z.string().max(100).optional().nullable(),
  availabilityStatus: z.string().max(50).optional().nullable(),
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
  resumeFileName: z.string().optional().nullable(),
  profileImageFileName: z.string().optional().nullable(),
  introVideoFileName: z.string().optional().nullable(),
});

export type CandidateWizardFormValues = z.infer<typeof candidateWizardFormSchema>;

/** Full payload shape (includes system-managed fields set on submit). */
export type CandidateWizardUploads = {
  resume?: File;
  profileImage?: File;
  introVideo?: File;
};

export type CandidateWizardValues = CandidateWizardFormValues & {
  organizationId: number;
  photoUrl: string | null;
  status: 'NEW' | 'ACTIVE' | 'INACTIVE' | 'PLACED' | 'DO_NOT_CONTACT';
  visibility: 'DRAFT' | 'PUBLISHED' | 'HIDDEN';
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
  clientProfileSummary: '',
  strengths: '',
  weaknesses: '',
  yearsExperience: undefined,
  primarySkillCommunityId: undefined,
  skills: [
    {
      skillCommunityId: '' as unknown as number,
      proficiencyLevel: 'INTERMEDIATE',
      yearsExperience: undefined,
      isPrimary: true,
      notes: '',
    },
  ],
  availableFrom: '',
  timezone: 'America/New_York',
  availabilityStatus: 'AVAILABLE',
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
  resumeFileName: '',
  profileImageFileName: '',
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
    visibility: 'DRAFT',
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

export const WIZARD_STEPS = [
  {
    id: 'personal',
    label: 'Personal',
    description: 'Name, contact details, and how you sourced this candidate',
    fields: ['firstName', 'lastName', 'email', 'phone', 'location', 'linkedinUrl', 'githubUrl', 'naukriUrl', 'displayName', 'oorwinCandidateId', 'source'] as const,
  },
  {
    id: 'professional',
    label: 'Professional',
    description: 'Role headline, experience, and profile summary',
    fields: ['headline', 'primaryRole', 'currentCompany', 'education', 'summary', 'clientProfileSummary', 'strengths', 'weaknesses', 'yearsExperience', 'primarySkillCommunityId'] as const,
  },
  {
    id: 'skills',
    label: 'Skills',
    description: 'Skill communities, proficiency, and primary skill',
    fields: ['skills', 'primarySkillCommunityId'] as const,
  },
  {
    id: 'availability',
    label: 'Availability',
    description: 'Start date, timezone, and weekly hours',
    fields: [
      'availableFrom',
      'timezone',
      'availabilityStatus',
      'preferredShift',
      'noticePeriodDays',
      'hoursPerWeek',
      'minHoursPerWeek',
      'maxHoursPerWeek',
      'preferredEngagement',
      'blackoutDates',
      'availabilityNotes',
    ] as const,
  },
  {
    id: 'pricing',
    label: 'Pricing',
    description: 'Expected, pay, and bill rates',
    fields: ['expectedRate', 'currency', 'payRate', 'billRate', 'pricingNotes'] as const,
  },
  {
    id: 'upload',
    label: 'Documents',
    description: 'Upload resume, profile photo, and optional intro video',
    fields: ['resumeFileName', 'profileImageFileName', 'introVideoFileName'] as const,
  },
  {
    id: 'review',
    label: 'Review',
    description: 'Confirm details before creating the candidate',
    fields: [] as const,
  },
] as const;

export type WizardStepId = (typeof WIZARD_STEPS)[number]['id'];

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
  primaryRole: 'Primary Role',
  currentCompany: 'Current Company',
  education: 'Education',
  summary: 'Summary',
  clientProfileSummary: 'Client Profile Summary',
  strengths: 'Strengths',
  weaknesses: 'Weaknesses',
  yearsExperience: 'Years Experience',
  primarySkillCommunityId: 'Primary Skill Community',
  skills: 'Skills',
  availableFrom: 'Available From',
  timezone: 'Timezone',
  availabilityStatus: 'Availability Status',
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
  payRate: 'Pay Rate',
  billRate: 'Bill Rate',
  pricingNotes: 'Pricing Notes',
  resumeFileName: 'Resume',
  profileImageFileName: 'Profile Photo',
  introVideoFileName: 'Intro Video',
};

export const FIELD_LABELS = USER_FIELD_LABELS;

export const REVIEW_FIELD_KEYS: (keyof CandidateWizardFormValues)[] = [
  'firstName',
  'lastName',
  'email',
  'phone',
  'location',
  'linkedinUrl',
  'source',
  'headline',
  'summary',
  'yearsExperience',
  'primarySkillCommunityId',
  'availableFrom',
  'timezone',
  'noticePeriodDays',
  'hoursPerWeek',
  'preferredEngagement',
  'expectedRate',
  'currency',
  'payRate',
  'billRate',
  'resumeFileName',
  'profileImageFileName',
  'introVideoFileName',
];

/** Map wizard form values to the API create-candidate request body. */
export function mapWizardToApiCreateBody(form: CandidateWizardFormValues): Record<string, unknown> {
  const grossMargin =
    form.billRate != null && form.payRate != null ? form.billRate - form.payRate : undefined;

  return {
    firstName: form.firstName,
    lastName: form.lastName,
    email: form.email,
    phone: form.phone ?? undefined,
    source: form.source,
    headline: form.headline ?? undefined,
    summary: form.summary ?? undefined,
    location: form.location ?? undefined,
    yearsExperience: form.yearsExperience ?? undefined,
    availableFrom: form.availableFrom,
    expectedRate: form.expectedRate ?? undefined,
    currency: form.currency ?? undefined,
    linkedinUrl: form.linkedinUrl ?? undefined,
    githubUrl: form.githubUrl ?? undefined,
    naukriUrl: form.naukriUrl ?? undefined,
    displayName: form.displayName ?? undefined,
    oorwinCandidateId: form.oorwinCandidateId ?? undefined,
    primaryRole: form.primaryRole ?? undefined,
    currentCompany: form.currentCompany ?? undefined,
    education: form.education ?? undefined,
    clientProfileSummary: form.clientProfileSummary ?? undefined,
    strengths: form.strengths ?? undefined,
    weaknesses: form.weaknesses ?? undefined,
    primarySkillCommunityId: form.primarySkillCommunityId ?? undefined,
    clientBillRate: form.billRate ?? undefined,
    candidatePayRate: form.payRate ?? undefined,
    grossMargin,
    timezoneOverlap: form.timezone ?? undefined,
    availabilityStatus: form.availabilityStatus ?? undefined,
    preferredShift: form.preferredShift ?? undefined,
    minHoursPerWeek: form.minHoursPerWeek ?? form.hoursPerWeek ?? undefined,
    maxHoursPerWeek: form.maxHoursPerWeek ?? form.hoursPerWeek ?? undefined,
    skills: form.skills.map((skill) => ({
      skillCommunityId: skill.skillCommunityId,
      proficiencyLevel: skill.proficiencyLevel,
      yearsExperience: skill.yearsExperience ?? undefined,
      isPrimary: skill.isPrimary,
      notes: skill.notes ?? undefined,
    })),
  };
}

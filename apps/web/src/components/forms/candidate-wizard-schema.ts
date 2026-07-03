import { z } from 'zod';

const optionalNumber = z.preprocess(
  (v) =>
    v === '' || v === null || v === undefined || (typeof v === 'number' && Number.isNaN(v))
      ? undefined
      : Number(v),
  z.number().optional().nullable(),
);

export const skillEntrySchema = z.object({
  skillCommunityId: z.preprocess((v) => Number(v), z.number().int().positive('Select a skill community')),
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
  source: z.enum(['DIRECT', 'REFERRAL', 'JOB_BOARD', 'LINKEDIN', 'AGENCY', 'INTERNAL', 'OTHER']),
  headline: z.string().max(255).optional().nullable(),
  summary: z.string().max(10000).optional().nullable(),
  yearsExperience: optionalNumber,
  primarySkillCommunityId: optionalNumber,
  skills: z.array(skillEntrySchema).min(1, 'Add at least one skill'),
  availableFrom: z.string().min(1, 'Available from date is required'),
  timezone: z.string().max(100).optional().nullable(),
  noticePeriodDays: optionalNumber,
  hoursPerWeek: optionalNumber,
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
  source: 'LINKEDIN',
  headline: '',
  summary: '',
  yearsExperience: undefined,
  primarySkillCommunityId: undefined,
  skills: [
    {
      skillCommunityId: 1,
      proficiencyLevel: 'INTERMEDIATE',
      yearsExperience: undefined,
      isPrimary: true,
      notes: '',
    },
  ],
  availableFrom: '',
  timezone: 'America/New_York',
  noticePeriodDays: 14,
  hoursPerWeek: 40,
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
    fields: ['firstName', 'lastName', 'email', 'phone', 'location', 'linkedinUrl', 'source'] as const,
  },
  {
    id: 'professional',
    label: 'Professional',
    description: 'Role headline, experience, and profile summary',
    fields: ['headline', 'summary', 'yearsExperience', 'primarySkillCommunityId'] as const,
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
      'noticePeriodDays',
      'hoursPerWeek',
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
  source: 'Source',
  headline: 'Headline',
  summary: 'Summary',
  yearsExperience: 'Years Experience',
  primarySkillCommunityId: 'Primary Skill Community',
  skills: 'Skills',
  availableFrom: 'Available From',
  timezone: 'Timezone',
  noticePeriodDays: 'Notice Period (days)',
  hoursPerWeek: 'Hours Per Week',
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

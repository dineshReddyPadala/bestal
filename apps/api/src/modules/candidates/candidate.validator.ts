import { z } from 'zod';
import {
  CANDIDATE_AVAILABILITY_STATUSES,
  CANDIDATE_PROFILE_STATUSES,
  CANDIDATE_VISIBILITY_STATUSES,
} from '@bestal/shared-utils';
import {
  optionalIntField,
  optionalRateField,
  optionalTextField,
  optionalUrlField,
} from '../../validators/optional-fields.js';

const candidateStatusEnum = z.enum([
  'NEW',
  'ACTIVE',
  'INACTIVE',
  'PLACED',
  'DO_NOT_CONTACT',
]);

const candidateVisibilityEnum = z.enum(CANDIDATE_VISIBILITY_STATUSES);

const candidateApprovalStatusEnum = z.enum(['PENDING', 'APPROVED', 'REJECTED']);

const candidateSourceEnum = z.enum([
  'DIRECT',
  'REFERRAL',
  'JOB_BOARD',
  'LINKEDIN',
  'AGENCY',
  'INTERNAL',
  'OTHER',
]);

const proficiencyLevelEnum = z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']);

const optionalSkillNameField = z
  .string()
  .optional()
  .transform((value) => {
    const trimmed = value?.trim();
    if (!trimmed) return undefined;
    // Resume AI can merge many labels into one field; clamp to DB VarChar(150).
    return trimmed.slice(0, 150);
  });

export const candidateSkillBodySchema = z.object({
  skillCommunityId: z.coerce.number().int().positive(),
  skillName: optionalSkillNameField,
  skillCategory: z.string().max(100).optional(),
  proficiencyLevel: proficiencyLevelEnum.optional(),
  yearsExperience: z.coerce.number().int().min(0).max(60).optional(),
  isPrimary: z.boolean().optional(),
  notes: optionalTextField(),
});

const candidateExtendedFieldsSchema = {
  oorwinCandidateId: z.string().max(100).optional(),
  displayName: z.string().max(200).optional(),
  primaryRole: z.string().max(150).optional(),
  currentCompany: z.string().max(255).optional(),
  education: optionalTextField(10000),
  githubUrl: optionalUrlField,
  naukriUrl: optionalUrlField,
  clientBillRate: optionalRateField,
  candidatePayRate: optionalRateField,
  grossMargin: optionalRateField,
  availabilityStatus: z.enum(CANDIDATE_AVAILABILITY_STATUSES).optional(),
  timezoneOverlap: z.string().max(100).optional(),
  preferredShift: z.string().max(50).optional(),
  minHoursPerWeek: optionalIntField,
  maxHoursPerWeek: optionalIntField,
  aiSummary: optionalTextField(),
  clientProfileSummary: optionalTextField(),
  strengths: optionalTextField(),
  weaknesses: optionalTextField(),
  riskFlags: optionalTextField(),
  bestalScore: z.coerce.number().int().min(0).max(100).optional(),
  technicalScore: z.coerce.number().int().min(0).max(100).optional(),
  communicationScore: z.coerce.number().int().min(0).max(100).optional(),
  reliabilityScore: z.coerce.number().int().min(0).max(100).optional(),
  evaluationStatus: z.string().max(50).optional(),
  bgvStatus: z.string().max(50).optional(),
  profileStatus: z.enum(CANDIDATE_PROFILE_STATUSES).optional(),
  visibility: candidateVisibilityEnum.optional(),
  deploymentStatus: z.string().max(50).optional(),
  skills: z.array(candidateSkillBodySchema).optional(),
};

export const createCandidateBodySchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().max(255),
  phone: z.string().max(30).optional(),
  status: candidateStatusEnum.optional(),
  source: candidateSourceEnum.optional(),
  headline: z.string().max(255).optional(),
  summary: optionalTextField(),
  location: z.string().max(255).optional(),
  yearsExperience: z.coerce.number().int().min(0).max(60).optional(),
  availableFrom: z.string().date().optional(),
  expectedRate: optionalRateField,
  currency: z.string().length(3).optional(),
  linkedinUrl: optionalUrlField,
  primarySkillCommunityId: z.coerce.number().int().positive().optional(),
  ...candidateExtendedFieldsSchema,
});

export const updateCandidateBodySchema = createCandidateBodySchema.partial();

export const listCandidatesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort: z
    .string()
    .regex(
      /^(-?(createdAt|updatedAt|firstName|lastName|email|status|visibility|approvalStatus|yearsExperience))(,-?(createdAt|updatedAt|firstName|lastName|email|status|visibility|approvalStatus|yearsExperience))*$/,
      'Invalid sort format. Example: -createdAt,lastName',
    )
    .optional(),
  search: z.string().max(200).optional(),
  status: candidateStatusEnum.optional(),
  visibility: candidateVisibilityEnum.optional(),
  approvalStatus: candidateApprovalStatusEnum.optional(),
  source: candidateSourceEnum.optional(),
  primarySkillCommunityId: z.coerce.number().int().positive().optional(),
  skillCommunityId: z.coerce.number().int().positive().optional(),
  /** Pending admin approval queue: submitted + approvalStatus PENDING. */
  pendingApproval: z
    .union([z.boolean(), z.enum(['true', 'false', '1', '0'])])
    .optional()
    .transform((v) => v === true || v === 'true' || v === '1'),
});

export const rejectCandidateBodySchema = z.object({
  reason: z.string().min(3).max(500),
});

export const sendBackCandidateBodySchema = z.object({
  reason: z.string().min(3).max(500).optional(),
});

export const runAiScreeningBodySchema = z.object({
  aiSummary: optionalTextField(),
  strengths: optionalTextField(),
  weaknesses: optionalTextField(),
  riskFlags: optionalTextField(),
});

export const completeRecruiterReviewBodySchema = z.object({
  clientProfileSummary: optionalTextField(),
});

export const candidateIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CreateCandidateBody = z.infer<typeof createCandidateBodySchema>;
export type UpdateCandidateBody = z.infer<typeof updateCandidateBodySchema>;
export type ListCandidatesQuery = z.infer<typeof listCandidatesQuerySchema>;
export type RejectCandidateBody = z.infer<typeof rejectCandidateBodySchema>;
export type SendBackCandidateBody = z.infer<typeof sendBackCandidateBodySchema>;
export type RunAiScreeningBody = z.infer<typeof runAiScreeningBodySchema>;
export type CompleteRecruiterReviewBody = z.infer<typeof completeRecruiterReviewBodySchema>;

const documentDtoSchema = z.object({
  id: z.number(),
  kind: z.string(),
  fileName: z.string(),
  originalName: z.string(),
  mimeType: z.string(),
  fileSize: z.number(),
  status: z.string(),
  url: z.string().nullable(),
  createdAt: z.string(),
});

export const candidateResponseSchema = z.object({
  data: z.object({
    id: z.number(),
    organizationId: z.number(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
    phone: z.string().nullable(),
    status: z.string(),
    visibility: z.string(),
    approvalStatus: z.string(),
    source: z.string(),
    headline: z.string().nullable(),
    summary: z.string().nullable(),
    location: z.string().nullable(),
    yearsExperience: z.number().nullable(),
    availableFrom: z.string().nullable(),
    expectedRate: z.number().nullable(),
    currency: z.string().nullable(),
    linkedinUrl: z.string().nullable(),
    primarySkillCommunityId: z.number().nullable(),
    primarySkillCommunityName: z.string().nullable(),
    publishedAt: z.string().nullable(),
    hiddenAt: z.string().nullable(),
    approvedAt: z.string().nullable(),
    approvedById: z.number().nullable(),
    rejectedAt: z.string().nullable(),
    rejectedById: z.number().nullable(),
    rejectionReason: z.string().nullable(),
    resume: documentDtoSchema.nullable(),
    profileImage: documentDtoSchema.nullable(),
    introVideo: documentDtoSchema.nullable(),
    skills: z.array(
      z.object({
        id: z.number(),
        skillCommunityId: z.number(),
        skillCommunityName: z.string(),
        proficiencyLevel: z.string(),
        yearsExperience: z.number().nullable(),
        isPrimary: z.boolean(),
      }),
    ),
    createdAt: z.string(),
    updatedAt: z.string(),
  }).passthrough(),
});

export const resumeExtractionDraftResponseSchema = z.object({
  data: z.object({
    candidate: z.record(z.string(), z.unknown()),
    extraction: z
      .object({
        jobId: z.string(),
        confidence: z.number(),
        extractedAt: z.string(),
        warnings: z.array(z.string()),
        candidate: z.record(z.string(), z.unknown()),
        primaryRole: z.string().nullable().optional(),
        seniority: z.string().nullable().optional(),
        community: z.string().nullable().optional(),
        skills: z.array(z.record(z.string(), z.unknown())),
        experience: z.array(z.record(z.string(), z.unknown())),
        education: z.array(z.record(z.string(), z.unknown())),
        aiSummary: z.string().nullable().optional(),
        strengths: z.string().nullable().optional(),
        weaknesses: z.string().nullable().optional(),
        riskFlags: z.string().nullable().optional(),
        bestalScore: z.number().nullable().optional(),
        recommendedClientRate: z.number().nullable().optional(),
        recommendedCandidateRate: z.number().nullable().optional(),
        rawSections: z.record(z.string(), z.unknown()).nullable().optional(),
      })
      .passthrough(),
  }),
});

export const candidateListItemSchema = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  status: z.string(),
  visibility: z.string(),
  approvalStatus: z.string(),
  headline: z.string().nullable(),
  location: z.string().nullable(),
  yearsExperience: z.number().nullable(),
  primarySkillCommunityName: z.string().nullable(),
  primaryRole: z.string().nullable(),
  bestalScore: z.number().nullable(),
  clientBillRate: z.number().nullable(),
  currency: z.string().nullable(),
  availabilityStatus: z.string().nullable(),
  timezoneOverlap: z.string().nullable(),
  hasResume: z.boolean(),
  hasProfileImage: z.boolean(),
  hasIntroVideo: z.boolean(),
  profileStatus: z.string().nullable(),
  evaluationStatus: z.string().nullable(),
  bgvStatus: z.string().nullable(),
  submittedForApprovalAt: z.string().nullable(),
  hasAiSummary: z.boolean(),
  hasSkills: z.boolean(),
  hasAvailability: z.boolean(),
  hasCommercials: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const candidateListResponseSchema = z.object({
  data: z.array(candidateListItemSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export const messageResponseSchema = z.object({
  data: z.object({
    message: z.string(),
  }),
});

export const SORTABLE_FIELDS = [
  'createdAt',
  'updatedAt',
  'firstName',
  'lastName',
  'email',
  'status',
  'visibility',
  'approvalStatus',
  'yearsExperience',
] as const;

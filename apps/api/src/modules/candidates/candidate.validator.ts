import { z } from 'zod';
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

const candidateVisibilityEnum = z.enum(['DRAFT', 'PUBLISHED', 'HIDDEN']);

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

export const candidateSkillBodySchema = z.object({
  skillCommunityId: z.coerce.number().int().positive(),
  skillName: z.string().max(150).optional(),
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
  availabilityStatus: z.string().max(50).optional(),
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
  profileStatus: z.string().max(50).optional(),
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
});

export const rejectCandidateBodySchema = z.object({
  reason: z.string().min(3).max(500),
});

export const prepareAssetUploadBodySchema = z.object({
  originalName: z.string().min(1).max(255),
  mimeType: z.string().min(1).max(255),
  size: z.coerce.number().int().positive(),
});

export const completeAssetUploadBodySchema = prepareAssetUploadBodySchema.extend({
  key: z.string().min(1).max(1024),
});

export type PrepareAssetUploadBody = z.infer<typeof prepareAssetUploadBodySchema>;
export type CompleteAssetUploadBody = z.infer<typeof completeAssetUploadBodySchema>;

export const candidateIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CreateCandidateBody = z.infer<typeof createCandidateBodySchema>;
export type UpdateCandidateBody = z.infer<typeof updateCandidateBodySchema>;
export type ListCandidatesQuery = z.infer<typeof listCandidatesQuerySchema>;
export type RejectCandidateBody = z.infer<typeof rejectCandidateBodySchema>;

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
  hasResume: z.boolean(),
  hasProfileImage: z.boolean(),
  hasIntroVideo: z.boolean(),
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

export const assetUploadUrlResponseSchema = z.object({
  data: z.object({
    uploadUrl: z.string().url(),
    key: z.string(),
    bucket: z.string(),
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

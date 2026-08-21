import { z } from 'zod';
import { paginationMetaSchema } from '../../validators/api-responses.validator.js';
import { optionalTextField } from '../../validators/optional-fields.js';

const PERSONAL_EMAIL_DOMAINS = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];

const jobRequestStatusEnum = z.enum([
  'SUBMITTED',
  'CONTACTED',
  'QUALIFIED',
  'CONVERTED',
  'CLOSED',
]);

const experienceRequiredEnum = z.enum(['Junior', 'Mid', 'Senior', 'Lead', 'Principal']);

const numberOfResourcesEnum = z.enum(['1', '2-3', '4-5', '6+']);

function isWorkEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  return Boolean(domain && !PERSONAL_EMAIL_DOMAINS.includes(domain));
}

const requiredSkillsSchema = z
  .array(z.string().trim().min(1).max(100))
  .min(1, 'At least one skill is required')
  .max(30);

export const createPublicJobRequestBodySchema = z
  .object({
    jobTitle: z.string().trim().min(1).max(255),
    jobDescription: z.string().trim().min(10).max(10000),
    requiredSkills: requiredSkillsSchema,
    experienceRequired: experienceRequiredEnum,
    numberOfResources: numberOfResourcesEnum,
    companyName: z.string().trim().min(1).max(255),
    website: z
      .string()
      .trim()
      .min(1)
      .max(500)
      .transform((val) => (/^https?:\/\//i.test(val) ? val : `https://${val}`))
      .pipe(z.string().url()),
    contactName: z.string().trim().min(1).max(150),
    contactEmail: z.string().trim().email().max(255),
    contactPhone: z.string().trim().min(7).max(30),
    websiteConfirm: z.string().max(0).optional(),
  })
  .superRefine((data, ctx) => {
    if (!isWorkEmail(data.contactEmail)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please use a work email address',
        path: ['contactEmail'],
      });
    }
  });

export const updateJobRequestBodySchema = z.object({
  status: jobRequestStatusEnum.optional(),
  assignedToId: z.coerce.number().int().positive().nullable().optional(),
  internalNotes: optionalTextField().nullable().optional(),
});

export const listJobRequestsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort: z
    .string()
    .regex(
      /^(-?(createdAt|updatedAt|status|companyName|jobTitle))(,-?(createdAt|updatedAt|status|companyName|jobTitle))*$/,
      'Invalid sort format',
    )
    .optional(),
  search: z.string().max(200).optional(),
  status: jobRequestStatusEnum.optional(),
  dateFrom: z.string().date().optional(),
  dateTo: z.string().date().optional(),
});

export const jobRequestIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CreatePublicJobRequestBody = z.infer<typeof createPublicJobRequestBodySchema>;
export type UpdateJobRequestBody = z.infer<typeof updateJobRequestBodySchema>;
export type ListJobRequestsQuery = z.infer<typeof listJobRequestsQuerySchema>;

export const publicJobRequestSubmitResponseSchema = z.object({
  data: z.object({
    id: z.number(),
    referenceCode: z.string().optional(),
    message: z.string(),
  }),
});

const clientEnquiryJobSchema = z.object({
  jobTitle: z.string().trim().min(1).max(255),
  jobDescription: z.string().trim().min(10).max(10000),
  requiredSkills: z.string().trim().min(1).max(5000),
  experienceRequired: z.enum(['0-2', '2-5', '5-8', '8+']),
  numberOfResources: z.enum(['1', '2', '3', '4', '5+']),
});

export const createClientEnquiryBodySchema = z
  .object({
    companyName: z.string().trim().min(1).max(255),
    companyDomain: z.string().trim().min(1).max(255).optional(),
    location: z.string().trim().min(1).max(255),
    timezone: z.string().trim().min(1).max(50),
    companyWebsite: z
      .string()
      .trim()
      .max(500)
      .optional()
      .transform((val) => {
        const trimmed = (val ?? '').trim();
        if (!trimmed) return '';
        return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
      })
      .pipe(z.union([z.literal(''), z.string().url()])),
    contactPersonName: z.string().trim().min(1).max(150),
    email: z.string().trim().email().max(255),
    phone: z.string().trim().min(7).max(30),
    jobs: z.array(clientEnquiryJobSchema).min(1).max(10),
    additionalRequirements: z.string().trim().min(1).max(10000),
    websiteConfirm: z.string().max(0).optional(),
  })
  .superRefine((data, ctx) => {
    if (!isWorkEmail(data.email)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please use a work email address',
        path: ['email'],
      });
    }
  });

export type CreateClientEnquiryBody = z.infer<typeof createClientEnquiryBodySchema>;

export const clientEnquirySubmitResponseSchema = z.object({
  data: z.object({
    id: z.number(),
    referenceCode: z.string(),
    message: z.string(),
  }),
});

const clientEnquiryJobDtoSchema = z.object({
  jobTitle: z.string(),
  jobDescription: z.string(),
  requiredSkills: z.array(z.string()),
  experienceRequired: z.string(),
  numberOfResources: z.string(),
});

const clientEnquiryAttachmentDtoSchema = z.object({
  fileName: z.string(),
  fileSize: z.number(),
  mimeType: z.string(),
  storageKey: z.string(),
  bucket: z.string(),
  downloadUrl: z.string().nullable().optional(),
});

const jobRequestDtoSchema = z.object({
  id: z.number(),
  organizationId: z.number(),
  referenceCode: z.string(),
  jobTitle: z.string(),
  jobDescription: z.string(),
  requiredSkills: z.array(z.string()),
  experienceRequired: z.string(),
  numberOfResources: z.string(),
  companyName: z.string(),
  companyDomain: z.string().nullable(),
  location: z.string().nullable(),
  timezone: z.string().nullable(),
  website: z.string(),
  contactName: z.string(),
  contactEmail: z.string(),
  contactPhone: z.string(),
  additionalRequirements: z.string().nullable(),
  jobs: z.array(clientEnquiryJobDtoSchema).nullable(),
  attachments: z.array(clientEnquiryAttachmentDtoSchema).nullable(),
  status: z.string(),
  source: z.string(),
  assignedToId: z.number().nullable(),
  assignedToName: z.string().nullable(),
  internalNotes: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const jobRequestResponseSchema = z.object({
  data: jobRequestDtoSchema,
});

export const jobRequestListItemSchema = z.object({
  id: z.number(),
  referenceCode: z.string(),
  jobTitle: z.string(),
  companyName: z.string(),
  contactName: z.string(),
  contactEmail: z.string(),
  contactPhone: z.string(),
  experienceRequired: z.string(),
  numberOfResources: z.string(),
  rolesCount: z.number(),
  status: z.string(),
  assignedToId: z.number().nullable(),
  assignedToName: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const jobRequestListResponseSchema = z.object({
  data: z.array(jobRequestListItemSchema),
  meta: paginationMetaSchema,
});

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

const jobRequestDtoSchema = z.object({
  id: z.number(),
  organizationId: z.number(),
  jobTitle: z.string(),
  jobDescription: z.string(),
  requiredSkills: z.array(z.string()),
  experienceRequired: z.string(),
  numberOfResources: z.string(),
  companyName: z.string(),
  website: z.string(),
  contactName: z.string(),
  contactEmail: z.string(),
  contactPhone: z.string(),
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
  jobTitle: z.string(),
  companyName: z.string(),
  contactName: z.string(),
  contactEmail: z.string(),
  contactPhone: z.string(),
  experienceRequired: z.string(),
  numberOfResources: z.string(),
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

export const publicJobRequestSubmitResponseSchema = z.object({
  data: z.object({
    id: z.number(),
    message: z.string(),
  }),
});

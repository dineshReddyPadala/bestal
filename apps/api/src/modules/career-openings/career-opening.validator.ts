import { z } from 'zod';
import { paginationMetaSchema } from '../../validators/api-responses.validator.js';

const careerOpeningStatusEnum = z.enum(['DRAFT', 'PUBLISHED', 'CLOSED']);

const stringListSchema = z
  .array(z.string().trim().min(1).max(500))
  .min(1)
  .max(30)
  .transform((items) => items.map((item) => item.trim()).filter(Boolean));

export const createCareerOpeningBodySchema = z.object({
  title: z.string().trim().min(1).max(255),
  skillCommunity: z.string().trim().min(1).max(120),
  location: z.string().trim().min(1).max(255),
  remote: z.boolean().default(false),
  jobLevel: z.string().trim().min(1).max(80),
  experience: z.string().trim().min(1).max(80),
  aboutRole: z.string().trim().min(10).max(8000),
  responsibilities: stringListSchema,
  requirements: stringListSchema,
  status: careerOpeningStatusEnum.default('DRAFT'),
});

export const updateCareerOpeningBodySchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  skillCommunity: z.string().trim().min(1).max(120).optional(),
  location: z.string().trim().min(1).max(255).optional(),
  remote: z.boolean().optional(),
  jobLevel: z.string().trim().min(1).max(80).optional(),
  experience: z.string().trim().min(1).max(80).optional(),
  aboutRole: z.string().trim().min(10).max(8000).optional(),
  responsibilities: stringListSchema.optional(),
  requirements: stringListSchema.optional(),
  status: careerOpeningStatusEnum.optional(),
});

export const listCareerOpeningsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort: z
    .string()
    .regex(
      /^(-?(createdAt|updatedAt|title|status|publishedAt|jobLevel))(,-?(createdAt|updatedAt|title|status|publishedAt|jobLevel))*$/,
      'Invalid sort format',
    )
    .optional(),
  search: z.string().max(200).optional(),
  status: careerOpeningStatusEnum.optional(),
});

export const careerOpeningIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CreateCareerOpeningBody = z.infer<typeof createCareerOpeningBodySchema>;
export type UpdateCareerOpeningBody = z.infer<typeof updateCareerOpeningBodySchema>;
export type ListCareerOpeningsQuery = z.infer<typeof listCareerOpeningsQuerySchema>;

const careerOpeningDtoSchema = z.object({
  id: z.number(),
  organizationId: z.number(),
  title: z.string(),
  slug: z.string(),
  skillCommunity: z.string(),
  location: z.string(),
  remote: z.boolean(),
  jobLevel: z.string(),
  experience: z.string(),
  aboutRole: z.string(),
  responsibilities: z.array(z.string()),
  requirements: z.array(z.string()),
  status: careerOpeningStatusEnum,
  publishedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const careerOpeningResponseSchema = z.object({
  data: careerOpeningDtoSchema,
});

export const careerOpeningListResponseSchema = z.object({
  data: z.array(
    z.object({
      id: z.number(),
      title: z.string(),
      slug: z.string(),
      skillCommunity: z.string(),
      location: z.string(),
      remote: z.boolean(),
      jobLevel: z.string(),
      status: careerOpeningStatusEnum,
      publishedAt: z.string().nullable(),
      updatedAt: z.string(),
    }),
  ),
  meta: paginationMetaSchema,
});

export const careerOpeningPublicListResponseSchema = z.object({
  data: z.array(
    z.object({
      id: z.number(),
      title: z.string(),
      slug: z.string(),
      skillCommunity: z.string(),
      location: z.string(),
      remote: z.boolean(),
      jobLevel: z.string(),
      experience: z.string(),
      aboutRole: z.string(),
      responsibilities: z.array(z.string()),
      requirements: z.array(z.string()),
      publishedAt: z.string().nullable(),
    }),
  ),
});

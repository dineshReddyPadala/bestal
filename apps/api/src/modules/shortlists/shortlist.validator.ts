import { z } from 'zod';
import { paginationMetaSchema } from '../../validators/api-responses.validator.js';

const shortlistStatusEnum = z.enum(['DRAFT', 'ACTIVE', 'CLOSED', 'ARCHIVED']);

export const createShortlistBodySchema = z.object({
  clientId: z.coerce.number().int().positive(),
  title: z.string().min(1).max(255),
  description: z.string().max(5000).optional(),
  roleTitle: z.string().max(255).optional(),
  dueDate: z.string().date().optional(),
});

export const listShortlistsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort: z
    .string()
    .regex(
      /^(-?(createdAt|updatedAt|status|dueDate|title))(,-?(createdAt|updatedAt|status|dueDate|title))*$/,
      'Invalid sort format',
    )
    .optional(),
  clientId: z.coerce.number().int().positive().optional(),
  status: shortlistStatusEnum.optional(),
});

export const shortlistIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const shortlistCandidateParamsSchema = z.object({
  shortlistId: z.coerce.number().int().positive(),
  candidateId: z.coerce.number().int().positive(),
});

export const addShortlistCandidateBodySchema = z.object({
  candidateId: z.coerce.number().int().positive(),
  rank: z.coerce.number().int().min(0).optional(),
  status: z.string().max(50).optional(),
  notes: z.string().max(5000).optional(),
  clientNotes: z.string().max(5000).optional(),
});

export const updateShortlistCandidateBodySchema = z.object({
  rank: z.coerce.number().int().min(0).optional(),
  status: z.string().max(50).nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
  clientNotes: z.string().max(5000).nullable().optional(),
  isApproved: z.boolean().nullable().optional(),
});

export type CreateShortlistBody = z.infer<typeof createShortlistBodySchema>;
export type ListShortlistsQuery = z.infer<typeof listShortlistsQuerySchema>;
export type AddShortlistCandidateBody = z.infer<
  typeof addShortlistCandidateBodySchema
>;
export type UpdateShortlistCandidateBody = z.infer<
  typeof updateShortlistCandidateBodySchema
>;

const shortlistCandidateDtoSchema = z.object({
  id: z.number(),
  shortlistId: z.number(),
  candidateId: z.number(),
  candidateName: z.string(),
  addedById: z.number(),
  addedByName: z.string(),
  rank: z.number(),
  status: z.string().nullable(),
  notes: z.string().nullable(),
  clientNotes: z.string().nullable(),
  isApproved: z.boolean().nullable(),
  approvedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const shortlistDtoSchema = z.object({
  id: z.number(),
  organizationId: z.number(),
  clientId: z.number(),
  clientName: z.string(),
  createdById: z.number(),
  createdByName: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  status: z.string(),
  roleTitle: z.string().nullable(),
  dueDate: z.string().nullable(),
  closedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const shortlistResponseSchema = z.object({
  data: shortlistDtoSchema.extend({
    candidates: z.array(shortlistCandidateDtoSchema),
  }),
});

export const shortlistListItemSchema = z.object({
  id: z.number(),
  clientId: z.number(),
  clientName: z.string(),
  title: z.string(),
  status: z.string(),
  roleTitle: z.string().nullable(),
  dueDate: z.string().nullable(),
  candidateCount: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const shortlistListResponseSchema = z.object({
  data: z.array(shortlistListItemSchema),
  meta: paginationMetaSchema,
});

export const shortlistCandidateResponseSchema = z.object({
  data: shortlistCandidateDtoSchema,
});

export const shortlistMessageResponseSchema = z.object({
  data: z.object({
    message: z.string(),
  }),
});

import { z } from 'zod';
import { paginationMetaSchema } from '../../validators/api-responses.validator.js';

const clientStatusEnum = z.enum(['PROSPECT', 'ACTIVE', 'INACTIVE', 'SUSPENDED']);

export const createClientBodySchema = z.object({
  name: z.string().min(1).max(255),
  accountManagerId: z.coerce.number().int().positive().optional(),
  status: clientStatusEnum.optional(),
  industry: z.string().max(100).optional(),
  website: z.string().url().max(255).optional(),
  contactEmail: z.string().email().max(255).optional(),
  contactPhone: z.string().max(30).optional(),
  addressLine1: z.string().max(255).optional(),
  addressLine2: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  country: z.string().length(2).optional(),
  notes: z.string().max(5000).optional(),
});

export const updateClientBodySchema = createClientBodySchema.partial();

export const listClientsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort: z
    .string()
    .regex(
      /^(-?(createdAt|updatedAt|name|status|industry))(,-?(createdAt|updatedAt|name|status|industry))*$/,
      'Invalid sort format. Example: -createdAt,name',
    )
    .optional(),
  search: z.string().max(200).optional(),
  status: clientStatusEnum.optional(),
  accountManagerId: z.coerce.number().int().positive().optional(),
});

export const clientIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CreateClientBody = z.infer<typeof createClientBodySchema>;
export type UpdateClientBody = z.infer<typeof updateClientBodySchema>;
export type ListClientsQuery = z.infer<typeof listClientsQuerySchema>;

const clientDtoSchema = z.object({
  id: z.number(),
  organizationId: z.number(),
  accountManagerId: z.number().nullable(),
  accountManagerName: z.string().nullable(),
  name: z.string(),
  slug: z.string(),
  status: z.string(),
  industry: z.string().nullable(),
  website: z.string().nullable(),
  contactEmail: z.string().nullable(),
  contactPhone: z.string().nullable(),
  addressLine1: z.string().nullable(),
  addressLine2: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  postalCode: z.string().nullable(),
  country: z.string().nullable(),
  notes: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const clientResponseSchema = z.object({
  data: clientDtoSchema,
});

export const clientListItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  status: z.string(),
  industry: z.string().nullable(),
  contactEmail: z.string().nullable(),
  accountManagerId: z.number().nullable(),
  accountManagerName: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const clientListResponseSchema = z.object({
  data: z.array(clientListItemSchema),
  meta: paginationMetaSchema,
});

export const clientMessageResponseSchema = z.object({
  data: z.object({
    message: z.string(),
  }),
});

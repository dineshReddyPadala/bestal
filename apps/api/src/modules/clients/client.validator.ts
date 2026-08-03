import { z } from 'zod';
import { paginationMetaSchema } from '../../validators/api-responses.validator.js';
import { optionalTextField } from '../../validators/optional-fields.js';

const clientStatusEnum = z.enum(['PROSPECT', 'ACTIVE', 'INACTIVE', 'SUSPENDED']);

const requiredWebsite = z
  .string()
  .trim()
  .min(1, 'Website is required')
  .max(500);

export const createClientBodySchema = z.object({
  name: z.string().trim().min(1, 'Company name is required').max(255),
  accountManagerId: z.coerce.number().int().positive().optional(),
  status: clientStatusEnum.optional(),
  industry: z.string().trim().min(1, 'Industry is required').max(100),
  companySize: z.string().max(50).optional(),
  website: requiredWebsite,
  headquarters: z.string().max(255).optional(),
  contactName: z.string().trim().min(1, 'Primary contact name is required').max(150),
  contactEmail: z.string().trim().email('Valid primary contact email is required').max(255),
  contactPhone: z.string().trim().min(1, 'Primary contact phone is required').max(30),
  paymentTerms: z.string().max(100).optional(),
  addressLine1: z.string().max(255).optional(),
  addressLine2: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  country: z.string().length(2).optional(),
  notes: optionalTextField(),
});

export const updateClientBodySchema = z.object({
  name: z.string().trim().min(1).max(255).optional(),
  accountManagerId: z.coerce.number().int().positive().nullish(),
  status: clientStatusEnum.optional(),
  industry: z.string().trim().min(1).max(100).optional(),
  companySize: z.string().max(50).nullish(),
  website: requiredWebsite.optional(),
  headquarters: z.string().max(255).nullish(),
  contactName: z.string().trim().min(1).max(150).optional(),
  contactEmail: z.string().trim().email().max(255).optional(),
  contactPhone: z.string().trim().min(1).max(30).optional(),
  paymentTerms: z.string().max(100).nullish(),
  addressLine1: z.string().max(255).nullish(),
  addressLine2: z.string().max(255).nullish(),
  city: z.string().max(100).nullish(),
  state: z.string().max(100).nullish(),
  postalCode: z.string().max(20).nullish(),
  country: z.string().length(2).nullish(),
  notes: optionalTextField(),
});

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
  companySize: z.string().nullable(),
  website: z.string().nullable(),
  headquarters: z.string().nullable(),
  contactName: z.string().nullable(),
  contactEmail: z.string().nullable(),
  contactPhone: z.string().nullable(),
  paymentTerms: z.string().nullable(),
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

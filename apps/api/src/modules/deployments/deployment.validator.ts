import { z } from 'zod';
import { paginationMetaSchema } from '../../validators/api-responses.validator.js';
import { optionalIntField, optionalRateField, optionalTextField } from '../../validators/optional-fields.js';

const deploymentStatusEnum = z.enum([
  'PENDING',
  'ACTIVE',
  'COMPLETED',
  'TERMINATED',
  'ON_HOLD',
]);

const placementTypeEnum = z.enum([
  'CONTRACT',
  'PERMANENT',
  'TEMP_TO_PERM',
  'FREELANCE',
]);

export const createDeploymentBodySchema = z.object({
  candidateId: z.coerce.number().int().positive(),
  clientId: z.coerce.number().int().positive(),
  placementType: placementTypeEnum.optional(),
  roleTitle: z.string().min(1).max(255),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
  billingRate: optionalRateField,
  candidatePayRate: optionalRateField,
  grossMarginPerHour: optionalRateField,
  expectedHoursPerWeek: optionalIntField,
  currency: z.string().length(3).optional(),
  workLocation: z.string().max(255).optional(),
  timezone: z.string().max(50).optional(),
  reportingManagerName: z.string().max(150).optional(),
  reportingManagerEmail: z.string().email().max(255).optional(),
  notes: optionalTextField(),
});

export const updateDeploymentBodySchema = z.object({
  candidateId: z.coerce.number().int().positive().optional(),
  clientId: z.coerce.number().int().positive().optional(),
  status: deploymentStatusEnum.optional(),
  placementType: placementTypeEnum.optional(),
  roleTitle: z.string().min(1).max(255).optional(),
  startDate: z.string().date().nullable().optional(),
  endDate: z.string().date().nullable().optional(),
  billingRate: z.coerce.number().positive().nullable().optional(),
  candidatePayRate: z.coerce.number().positive().nullable().optional(),
  grossMarginPerHour: z.coerce.number().positive().nullable().optional(),
  expectedHoursPerWeek: optionalIntField,
  currency: z.string().length(3).optional(),
  workLocation: z.string().max(255).optional(),
  timezone: z.string().max(50).optional(),
  reportingManagerName: z.string().max(150).optional(),
  reportingManagerEmail: z.string().email().max(255).optional(),
  notes: optionalTextField(),
});

export const terminateDeploymentBodySchema = z.object({
  reason: z.string().max(500).optional(),
});

export const listDeploymentsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort: z
    .string()
    .regex(
      /^(-?(createdAt|updatedAt|status|startDate|endDate|roleTitle))(,-?(createdAt|updatedAt|status|startDate|endDate|roleTitle))*$/,
      'Invalid sort format',
    )
    .optional(),
  candidateId: z.coerce.number().int().positive().optional(),
  clientId: z.coerce.number().int().positive().optional(),
  status: deploymentStatusEnum.optional(),
  placementType: placementTypeEnum.optional(),
});

export const deploymentIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CreateDeploymentBody = z.infer<typeof createDeploymentBodySchema>;
export type UpdateDeploymentBody = z.infer<typeof updateDeploymentBodySchema>;
export type TerminateDeploymentBody = z.infer<typeof terminateDeploymentBodySchema>;
export type ListDeploymentsQuery = z.infer<typeof listDeploymentsQuerySchema>;

const deploymentDtoSchema = z.object({
  id: z.number(),
  organizationId: z.number(),
  candidateId: z.number(),
  candidateName: z.string(),
  clientId: z.number(),
  clientName: z.string(),
  createdById: z.number(),
  createdByName: z.string(),
  status: z.string(),
  placementType: z.string(),
  roleTitle: z.string(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  billingRate: z.number().nullable(),
  currency: z.string().nullable(),
  workLocation: z.string().nullable(),
  notes: z.string().nullable(),
  terminatedAt: z.string().nullable(),
  terminateReason: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const deploymentResponseSchema = z.object({
  data: deploymentDtoSchema,
});

export const deploymentListItemSchema = z.object({
  id: z.number(),
  candidateId: z.number(),
  candidateName: z.string(),
  clientId: z.number(),
  clientName: z.string(),
  status: z.string(),
  placementType: z.string(),
  roleTitle: z.string(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const deploymentListResponseSchema = z.object({
  data: z.array(deploymentListItemSchema),
  meta: paginationMetaSchema,
});

export const deploymentMessageResponseSchema = z.object({
  data: z.object({
    message: z.string(),
  }),
});

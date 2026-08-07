import { z } from 'zod';
import { paginationMetaSchema } from '../../validators/api-responses.validator.js';
import { optionalIntField, optionalTextField } from '../../validators/optional-fields.js';

const trialRequestStatusEnum = z.enum([
  'REQUESTED',
  'APPROVED',
  'REJECTED',
  'IN_PROGRESS',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
]);

export const createTrialBodySchema = z.object({
  candidateId: z.coerce.number().int().positive(),
  clientId: z.coerce.number().int().positive(),
  deploymentId: z.coerce.number().int().positive().optional(),
  roleTitle: z.string().max(255).optional(),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
  durationDays: z.coerce.number().int().positive().optional(),
  trialType: z.string().max(100).optional(),
  maxTrialHours: optionalIntField,
  taskDescription: optionalTextField(),
  successCriteria: optionalTextField(),
  feedback: optionalTextField(),
});

export const updateTrialBodySchema = z.object({
  candidateId: z.coerce.number().int().positive().optional(),
  clientId: z.coerce.number().int().positive().optional(),
  deploymentId: z.coerce.number().int().positive().nullable().optional(),
  status: trialRequestStatusEnum.optional(),
  roleTitle: z.string().max(255).optional(),
  startDate: z.string().date().nullable().optional(),
  endDate: z.string().date().nullable().optional(),
  durationDays: z.coerce.number().int().positive().nullable().optional(),
  trialType: z.string().max(100).optional(),
  maxTrialHours: optionalIntField,
  taskDescription: optionalTextField(),
  successCriteria: optionalTextField(),
  feedback: optionalTextField(),
  outcome: z.string().max(500).optional(),
  clientRating: z.coerce.number().int().min(1).max(5).optional(),
  convertedToPaid: z.boolean().optional(),
});

export const rejectTrialBodySchema = z.object({
  reason: z.string().max(500).optional(),
});

export const trialFeedbackBodySchema = z.object({
  feedback: z.string().min(3).max(5000),
  clientRating: z.coerce.number().int().min(1).max(5),
  decision: z.enum(['CONTINUE', 'DO_NOT_CONTINUE']),
});

export const listTrialsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort: z
    .string()
    .regex(
      /^(-?(createdAt|updatedAt|status|startDate|endDate))(,-?(createdAt|updatedAt|status|startDate|endDate))*$/,
      'Invalid sort format',
    )
    .optional(),
  search: z.string().max(200).optional(),
  candidateId: z.coerce.number().int().positive().optional(),
  clientId: z.coerce.number().int().positive().optional(),
  status: trialRequestStatusEnum.optional(),
});

export const trialIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CreateTrialBody = z.infer<typeof createTrialBodySchema>;
export type UpdateTrialBody = z.infer<typeof updateTrialBodySchema>;
export type RejectTrialBody = z.infer<typeof rejectTrialBodySchema>;
export type TrialFeedbackBody = z.infer<typeof trialFeedbackBodySchema>;
export type ListTrialsQuery = z.infer<typeof listTrialsQuerySchema>;

const trialDtoSchema = z.object({
  id: z.number(),
  organizationId: z.number(),
  candidateId: z.number(),
  candidateName: z.string(),
  clientId: z.number(),
  clientName: z.string(),
  deploymentId: z.number().nullable(),
  requestedById: z.number(),
  requestedByName: z.string(),
  assignedRecruiterId: z.number().nullable().optional(),
  assignedRecruiterName: z.string().nullable().optional(),
  status: z.string(),
  roleTitle: z.string().nullable(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  durationDays: z.number().nullable().optional(),
  trialType: z.string().nullable().optional(),
  maxTrialHours: z.number().nullable().optional(),
  taskDescription: z.string().nullable().optional(),
  successCriteria: z.string().nullable().optional(),
  feedback: z.string().nullable(),
  clientRating: z.number().nullable().optional(),
  convertedToPaid: z.boolean().optional(),
  outcome: z.string().nullable(),
  approvedAt: z.string().nullable(),
  candidateConfirmedAt: z.string().nullable().optional(),
  rejectedAt: z.string().nullable(),
  rejectReason: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const trialResponseSchema = z.object({
  data: trialDtoSchema,
});

export const trialListItemSchema = z.object({
  id: z.number(),
  candidateId: z.number(),
  candidateName: z.string(),
  candidateEmail: z.string().nullable().optional(),
  clientId: z.number(),
  clientName: z.string(),
  clientContactName: z.string().nullable().optional(),
  clientContactEmail: z.string().nullable().optional(),
  clientContactPhone: z.string().nullable().optional(),
  status: z.string(),
  roleTitle: z.string().nullable(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  assignedRecruiterId: z.number().nullable().optional(),
  assignedRecruiterName: z.string().nullable().optional(),
  candidateConfirmedAt: z.string().nullable().optional(),
  feedback: z.string().nullable().optional(),
  clientRating: z.number().nullable().optional(),
  outcome: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const trialListResponseSchema = z.object({
  data: z.array(trialListItemSchema),
  meta: paginationMetaSchema,
});

export const trialMessageResponseSchema = z.object({
  data: z.object({
    message: z.string(),
  }),
});

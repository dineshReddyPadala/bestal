import { z } from 'zod';
import { paginationMetaSchema } from '../../validators/api-responses.validator.js';

const interviewRequestStatusEnum = z.enum([
  'REQUESTED',
  'SCHEDULED',
  'CONFIRMED',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
  'RESCHEDULED',
]);

const interviewTypeEnum = z.enum([
  'PHONE',
  'VIDEO',
  'IN_PERSON',
  'TECHNICAL',
  'PANEL',
  'FINAL',
  'HR',
]);

export const createInterviewBodySchema = z.object({
  candidateId: z.coerce.number().int().positive(),
  clientId: z.coerce.number().int().positive(),
  type: interviewTypeEnum,
  scheduledAt: z.string().datetime().optional(),
  durationMinutes: z.coerce.number().int().positive().optional(),
  timezone: z.string().max(50).optional(),
  location: z.string().max(500).optional(),
  notes: z.string().max(5000).optional(),
  shortlistId: z.coerce.number().int().positive().optional(),
});

export const updateInterviewBodySchema = z.object({
  status: interviewRequestStatusEnum.optional(),
  scheduledAt: z.string().datetime().nullable().optional(),
  durationMinutes: z.coerce.number().int().positive().nullable().optional(),
  timezone: z.string().max(50).nullable().optional(),
  location: z.string().max(500).nullable().optional(),
  meetingLink: z.string().max(500).nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
  feedback: z.string().max(5000).nullable().optional(),
  cancelReason: z.string().max(500).nullable().optional(),
});

export const confirmInterviewBodySchema = z.object({
  scheduledAt: z.string().datetime(),
  durationMinutes: z.coerce.number().int().positive().optional(),
  timezone: z.string().max(50).optional(),
  location: z.string().max(500).optional(),
  meetingLink: z.string().max(500).optional(),
});

export const cancelInterviewBodySchema = z.object({
  cancelReason: z.string().max(500).optional(),
});

export const listInterviewsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort: z
    .string()
    .regex(
      /^(-?(createdAt|updatedAt|status|scheduledAt|type))(,-?(createdAt|updatedAt|status|scheduledAt|type))*$/,
      'Invalid sort format',
    )
    .optional(),
  candidateId: z.coerce.number().int().positive().optional(),
  clientId: z.coerce.number().int().positive().optional(),
  shortlistId: z.coerce.number().int().positive().optional(),
  status: interviewRequestStatusEnum.optional(),
  type: interviewTypeEnum.optional(),
});

export const interviewIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CreateInterviewBody = z.infer<typeof createInterviewBodySchema>;
export type UpdateInterviewBody = z.infer<typeof updateInterviewBodySchema>;
export type ConfirmInterviewBody = z.infer<typeof confirmInterviewBodySchema>;
export type CancelInterviewBody = z.infer<typeof cancelInterviewBodySchema>;
export type ListInterviewsQuery = z.infer<typeof listInterviewsQuerySchema>;

const interviewDtoSchema = z.object({
  id: z.number(),
  organizationId: z.number(),
  candidateId: z.number(),
  candidateName: z.string(),
  clientId: z.number(),
  clientName: z.string(),
  shortlistId: z.number().nullable(),
  requestedById: z.number(),
  requestedByName: z.string(),
  assignedToId: z.number().nullable(),
  assignedToName: z.string().nullable(),
  type: z.string(),
  status: z.string(),
  scheduledAt: z.string().nullable(),
  durationMinutes: z.number().nullable(),
  timezone: z.string().nullable(),
  location: z.string().nullable(),
  meetingLink: z.string().nullable(),
  notes: z.string().nullable(),
  feedback: z.string().nullable(),
  completedAt: z.string().nullable(),
  cancelledAt: z.string().nullable(),
  cancelReason: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const interviewResponseSchema = z.object({
  data: interviewDtoSchema,
});

export const interviewListItemSchema = z.object({
  id: z.number(),
  candidateId: z.number(),
  candidateName: z.string(),
  clientId: z.number(),
  clientName: z.string(),
  type: z.string(),
  status: z.string(),
  scheduledAt: z.string().nullable(),
  durationMinutes: z.number().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const interviewListResponseSchema = z.object({
  data: z.array(interviewListItemSchema),
  meta: paginationMetaSchema,
});

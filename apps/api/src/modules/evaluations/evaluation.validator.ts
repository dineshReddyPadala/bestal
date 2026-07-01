import { z } from 'zod';
import { paginationMetaSchema } from '../../validators/api-responses.validator.js';

const evaluationStatusEnum = z.enum(['DRAFT', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED']);

const evaluationRecommendationEnum = z.enum([
  'STRONG_HIRE',
  'HIRE',
  'NEUTRAL',
  'NO_HIRE',
  'STRONG_NO_HIRE',
]);

export const createEvaluationBodySchema = z.object({
  candidateId: z.coerce.number().int().positive(),
  clientId: z.coerce.number().int().positive().optional(),
  evaluatorId: z.coerce.number().int().positive().optional(),
  status: evaluationStatusEnum.optional(),
  summary: z.string().max(5000).optional(),
  strengths: z.string().max(5000).optional(),
  weaknesses: z.string().max(5000).optional(),
});

export const updateEvaluationBodySchema = z.object({
  clientId: z.coerce.number().int().positive().nullable().optional(),
  evaluatorId: z.coerce.number().int().positive().optional(),
  status: evaluationStatusEnum.optional(),
  recommendation: evaluationRecommendationEnum.optional(),
  overallScore: z.coerce.number().min(0).max(100).optional(),
  technicalScore: z.coerce.number().min(0).max(100).optional(),
  softSkillScore: z.coerce.number().min(0).max(100).optional(),
  summary: z.string().max(5000).optional(),
  strengths: z.string().max(5000).optional(),
  weaknesses: z.string().max(5000).optional(),
});

export const completeEvaluationBodySchema = z.object({
  recommendation: evaluationRecommendationEnum,
  overallScore: z.coerce.number().min(0).max(100).optional(),
  technicalScore: z.coerce.number().min(0).max(100).optional(),
  softSkillScore: z.coerce.number().min(0).max(100).optional(),
  summary: z.string().max(5000).optional(),
});

export const listEvaluationsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort: z
    .string()
    .regex(
      /^(-?(createdAt|updatedAt|status|evaluatedAt|overallScore))(,-?(createdAt|updatedAt|status|evaluatedAt|overallScore))*$/,
      'Invalid sort format',
    )
    .optional(),
  candidateId: z.coerce.number().int().positive().optional(),
  clientId: z.coerce.number().int().positive().optional(),
  status: evaluationStatusEnum.optional(),
  evaluatorId: z.coerce.number().int().positive().optional(),
});

export const evaluationIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CreateEvaluationBody = z.infer<typeof createEvaluationBodySchema>;
export type UpdateEvaluationBody = z.infer<typeof updateEvaluationBodySchema>;
export type CompleteEvaluationBody = z.infer<typeof completeEvaluationBodySchema>;
export type ListEvaluationsQuery = z.infer<typeof listEvaluationsQuerySchema>;

const evaluationDtoSchema = z.object({
  id: z.number(),
  organizationId: z.number(),
  candidateId: z.number(),
  candidateName: z.string(),
  clientId: z.number().nullable(),
  clientName: z.string().nullable(),
  evaluatorId: z.number(),
  evaluatorName: z.string(),
  status: z.string(),
  recommendation: z.string().nullable(),
  overallScore: z.number().nullable(),
  technicalScore: z.number().nullable(),
  softSkillScore: z.number().nullable(),
  summary: z.string().nullable(),
  strengths: z.string().nullable(),
  weaknesses: z.string().nullable(),
  evaluatedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const evaluationResponseSchema = z.object({
  data: evaluationDtoSchema,
});

export const evaluationListItemSchema = z.object({
  id: z.number(),
  candidateId: z.number(),
  candidateName: z.string(),
  clientId: z.number().nullable(),
  clientName: z.string().nullable(),
  evaluatorId: z.number(),
  evaluatorName: z.string(),
  status: z.string(),
  recommendation: z.string().nullable(),
  overallScore: z.number().nullable(),
  evaluatedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const evaluationListResponseSchema = z.object({
  data: z.array(evaluationListItemSchema),
  meta: paginationMetaSchema,
});

export const evaluationMessageResponseSchema = z.object({
  data: z.object({
    message: z.string(),
  }),
});

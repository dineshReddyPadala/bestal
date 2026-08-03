import {
  EVALUATION_RECOMMENDATIONS,
  EVALUATION_TYPES,
} from '@bestal/shared-utils';
import { z } from 'zod';
import { paginationMetaSchema } from '../../validators/api-responses.validator.js';
import { optionalTextField, optionalUrlField } from '../../validators/optional-fields.js';

const evaluationTypeEnum = z.enum(EVALUATION_TYPES);
const recommendationEnum = z.enum(EVALUATION_RECOMMENDATIONS);

const scoreField = z.coerce.number().int().min(0).max(100).optional();
const nullableScoreField = z.coerce.number().int().min(0).max(100).nullable().optional();

export const createEvaluationBodySchema = z.object({
  candidateId: z.coerce.number().int().positive(),
  evaluatorName: z.string().min(1).max(150),
  evaluatorCompany: z.string().max(255).optional(),
  evaluationType: evaluationTypeEnum.optional(),
  evaluationDate: z.string().date().optional(),
  technicalScore: scoreField,
  communicationScore: scoreField,
  problemSolvingScore: scoreField,
  architectureScore: scoreField,
  clientReadinessScore: scoreField,
  recommendation: recommendationEnum.optional(),
  evaluatorComments: optionalTextField(),
  aiEvaluationSummary: optionalTextField(),
  recordingUrl: optionalUrlField,
  evaluationFileUrl: optionalUrlField,
});

export const updateEvaluationBodySchema = z.object({
  evaluatorName: z.string().min(1).max(150).optional(),
  evaluatorCompany: z.string().max(255).nullable().optional(),
  evaluationType: evaluationTypeEnum.nullable().optional(),
  evaluationDate: z.string().date().nullable().optional(),
  technicalScore: nullableScoreField,
  communicationScore: nullableScoreField,
  problemSolvingScore: nullableScoreField,
  architectureScore: nullableScoreField,
  clientReadinessScore: nullableScoreField,
  recommendation: recommendationEnum.nullable().optional(),
  evaluatorComments: optionalTextField(),
  aiEvaluationSummary: optionalTextField(),
  recordingUrl: optionalUrlField,
  evaluationFileUrl: optionalUrlField,
});

export const listEvaluationsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort: z
    .string()
    .regex(
      /^(-?(createdAt|updatedAt|evaluationDate|technicalScore))(,-?(createdAt|updatedAt|evaluationDate|technicalScore))*$/,
      'Invalid sort format',
    )
    .optional(),
  search: z.string().max(200).optional(),
  candidateId: z.coerce.number().int().positive().optional(),
  evaluationType: evaluationTypeEnum.optional(),
});

export const evaluationIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CreateEvaluationBody = z.infer<typeof createEvaluationBodySchema>;
export type UpdateEvaluationBody = z.infer<typeof updateEvaluationBodySchema>;
export type ListEvaluationsQuery = z.infer<typeof listEvaluationsQuerySchema>;

const evaluationDtoSchema = z.object({
  id: z.number(),
  organizationId: z.number(),
  candidateId: z.number(),
  candidateName: z.string(),
  evaluatorName: z.string(),
  evaluatorCompany: z.string().nullable(),
  evaluationType: z.string().nullable(),
  evaluationDate: z.string().nullable(),
  technicalScore: z.number().nullable(),
  communicationScore: z.number().nullable(),
  problemSolvingScore: z.number().nullable(),
  architectureScore: z.number().nullable(),
  clientReadinessScore: z.number().nullable(),
  recommendation: z.string().nullable(),
  evaluatorComments: z.string().nullable(),
  aiEvaluationSummary: z.string().nullable(),
  recordingUrl: z.string().nullable(),
  evaluationFileUrl: z.string().nullable(),
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
  evaluatorName: z.string(),
  evaluatorCompany: z.string().nullable(),
  evaluationType: z.string().nullable(),
  evaluationDate: z.string().nullable(),
  recommendation: z.string().nullable(),
  technicalScore: z.number().nullable(),
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

export const evaluationExtractionResponseSchema = z.object({
  data: z.object({
    liveAi: z.boolean(),
    extraction: z
      .object({
        jobId: z.string(),
        confidence: z.number(),
        extractedAt: z.string(),
        extractedText: z.string().optional(),
        evaluatorName: z.string().optional(),
        evaluatorCompany: z.string().optional(),
        evaluationType: z.string().optional(),
        evaluationDate: z.string().optional(),
        technicalScore: z.number().optional(),
        communicationScore: z.number().optional(),
        problemSolvingScore: z.number().optional(),
        architectureScore: z.number().optional(),
        clientReadinessScore: z.number().optional(),
        recommendation: z.string().optional(),
        evaluatorComments: z.string().optional(),
        aiEvaluationSummary: z.string(),
        recordingUrl: z.string().nullable().optional(),
        evaluationFileUrl: z.string().nullable().optional(),
        warnings: z.array(z.string()),
      })
      .passthrough(),
  }),
});

import { z } from 'zod';

/** Payload stored on AutomationJob.inputReference for EVALUATION_ANALYSIS. */
export const evaluationAnalysisInputSchema = z.object({
  candidateId: z.number().int().positive(),
  documentId: z.number().int().positive(),
  evaluationId: z.number().int().positive(),
  fileName: z.string().min(1).max(255).optional(),
  mimeType: z.string().min(1).max(127).optional(),
});

const scoreSchema = z.coerce.number().int().min(0).max(100).optional();

/**
 * Validated AI result from n8n. Persistence goes through application validation.
 * All IDs on the job/callback remain numeric — this schema is result fields only.
 */
export const evaluationAnalysisOutputSchema = z
  .object({
    confidence: z.coerce.number().min(0).max(1).optional(),
    evaluatorName: z.string().trim().max(150).optional(),
    evaluatorCompany: z.string().trim().max(255).optional(),
    evaluationType: z.string().trim().max(100).optional(),
    evaluationDate: z.string().trim().max(32).optional(),
    technicalScore: scoreSchema,
    communicationScore: scoreSchema,
    problemSolvingScore: scoreSchema,
    architectureScore: scoreSchema,
    clientReadinessScore: scoreSchema,
    recommendation: z.string().trim().max(100).optional(),
    evaluationSummary: z.string().trim().max(20000).optional(),
    evaluatorComments: z.string().trim().max(20000).optional(),
    aiEvaluationSummary: z.string().trim().max(20000).optional(),
    extractedText: z.string().trim().max(100000).optional(),
    warnings: z.array(z.string()).optional(),
  })
  .superRefine((value, ctx) => {
    const hasSummary = Boolean(value.aiEvaluationSummary?.trim());
    const hasScore =
      value.technicalScore != null ||
      value.communicationScore != null ||
      value.problemSolvingScore != null ||
      value.architectureScore != null ||
      value.clientReadinessScore != null;
    if (!hasSummary && !hasScore) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'AI output must include aiEvaluationSummary or at least one score',
      });
    }
  });

export type EvaluationAnalysisInput = z.infer<typeof evaluationAnalysisInputSchema>;
export type EvaluationAnalysisOutput = z.infer<typeof evaluationAnalysisOutputSchema>;

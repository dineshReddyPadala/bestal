import { z } from 'zod';

/** Payload stored on AutomationJob.inputReference for BGV_ANALYSIS. */
export const bgvAnalysisInputSchema = z.object({
  candidateId: z.number().int().positive(),
  documentId: z.number().int().positive(),
  backgroundCheckId: z.number().int().positive(),
  fileName: z.string().min(1).max(255).optional(),
  mimeType: z.string().min(1).max(127).optional(),
});

/** Per-check result values from BGV vendors / AI (not workflow disposition). */
export const bgvCheckItemStatusSchema = z
  .string()
  .trim()
  .transform((value) => value.toUpperCase().replace(/\s+/g, '_'))
  .pipe(
    z.enum([
      'CLEAR',
      'CONSIDER',
      'PENDING',
      'IN_PROGRESS',
      'FAILED',
      'NOT_STARTED',
      'N/A',
      'NA',
    ]),
  )
  .optional();

/**
 * Validated AI result from n8n. Never includes raw report text.
 * Persistence goes through application validation.
 */
export const bgvAnalysisOutputSchema = z
  .object({
    confidence: z.coerce.number().min(0).max(1).optional(),
    overallStatus: z.string().trim().max(50).optional(),
    status: z.string().trim().max(50).optional(),
    vendorName: z.string().trim().max(100).optional(),
    idCheckStatus: bgvCheckItemStatusSchema,
    addressCheckStatus: bgvCheckItemStatusSchema,
    employmentCheckStatus: bgvCheckItemStatusSchema,
    educationCheckStatus: bgvCheckItemStatusSchema,
    criminalCheckStatus: bgvCheckItemStatusSchema,
    referenceCheckStatus: bgvCheckItemStatusSchema,
    aiBgvSummary: z.string().trim().max(20000).optional(),
    concernNotes: z.string().trim().max(20000).optional(),
    checkType: z.string().trim().max(100).optional(),
    warnings: z.array(z.string()).optional(),
  })
  .superRefine((value, ctx) => {
    const hasSummary = Boolean(value.aiBgvSummary?.trim());
    const hasCheck =
      value.idCheckStatus != null ||
      value.addressCheckStatus != null ||
      value.employmentCheckStatus != null ||
      value.educationCheckStatus != null ||
      value.criminalCheckStatus != null ||
      value.referenceCheckStatus != null;
    if (!hasSummary && !hasCheck) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'AI output must include aiBgvSummary or at least one check status',
      });
    }
  });

export type BgvAnalysisInput = z.infer<typeof bgvAnalysisInputSchema>;
export type BgvAnalysisOutput = z.infer<typeof bgvAnalysisOutputSchema>;

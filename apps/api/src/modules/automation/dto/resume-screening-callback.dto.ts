import { z } from 'zod';
import { AUTOMATION_JOB_STATUSES } from '../automation.constants.js';
import { resumeScreeningOutputSchema } from './resume-screening.dto.js';

/**
 * Internal n8n → Fastify callback body for Resume AI Screening.
 * All IDs are numeric (never UUIDs).
 */
export const resumeScreeningCallbackBodySchema = z.object({
  jobId: z.coerce.number().int().positive(),
  candidateId: z.coerce.number().int().positive().optional().nullable(),
  status: z.enum([
    AUTOMATION_JOB_STATUSES.PROCESSING,
    AUTOMATION_JOB_STATUSES.COMPLETED,
    AUTOMATION_JOB_STATUSES.FAILED,
    AUTOMATION_JOB_STATUSES.RETRYING,
    AUTOMATION_JOB_STATUSES.CANCELLED,
  ]),
  result: z.record(z.unknown()).optional().default({}),
  n8nExecutionId: z.string().max(100).optional().nullable(),
  errorCode: z.string().max(80).optional().nullable(),
  errorMessage: z.string().max(4000).optional().nullable(),
});

export type ResumeScreeningCallbackBody = z.infer<
  typeof resumeScreeningCallbackBodySchema
>;

/** Re-export for callers that need to validate AI result structure. */
export { resumeScreeningOutputSchema };

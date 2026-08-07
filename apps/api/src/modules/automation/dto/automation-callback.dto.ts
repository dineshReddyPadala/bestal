import { z } from 'zod';
import {
  AUTOMATION_JOB_STATUSES,
  AUTOMATION_JOB_TYPES,
} from '../automation.constants.js';

/**
 * Secure callback body from n8n → Fastify.
 * All entity identifiers are numeric (never UUIDs).
 */
export const automationCallbackBodySchema = z.object({
  jobId: z.coerce.number().int().positive(),
  jobType: z.enum([
    AUTOMATION_JOB_TYPES.RESUME_SCREENING,
    AUTOMATION_JOB_TYPES.EVALUATION_ANALYSIS,
    AUTOMATION_JOB_TYPES.BGV_ANALYSIS,
  ]),
  status: z.enum([
    AUTOMATION_JOB_STATUSES.PROCESSING,
    AUTOMATION_JOB_STATUSES.COMPLETED,
    AUTOMATION_JOB_STATUSES.FAILED,
    AUTOMATION_JOB_STATUSES.RETRYING,
    AUTOMATION_JOB_STATUSES.CANCELLED,
  ]),
  n8nExecutionId: z.string().max(100).optional().nullable(),
  workflowName: z.string().max(150).optional().nullable(),
  workflowVersion: z.string().max(50).optional().nullable(),
  candidateId: z.coerce.number().int().positive().optional().nullable(),
  documentId: z.coerce.number().int().positive().optional().nullable(),
  output: z.record(z.unknown()).optional().nullable(),
  errorCode: z.string().max(80).optional().nullable(),
  errorMessage: z.string().max(4000).optional().nullable(),
});

export type AutomationCallbackBody = z.infer<typeof automationCallbackBodySchema>;

export const automationJobIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const listAutomationJobsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(200).optional().default(20),
  candidateId: z.coerce.number().int().positive().optional(),
  documentId: z.coerce.number().int().positive().optional(),
  jobType: z
    .enum([
      AUTOMATION_JOB_TYPES.RESUME_SCREENING,
      AUTOMATION_JOB_TYPES.EVALUATION_ANALYSIS,
      AUTOMATION_JOB_TYPES.BGV_ANALYSIS,
    ])
    .optional(),
  status: z
    .enum([
      AUTOMATION_JOB_STATUSES.PENDING,
      AUTOMATION_JOB_STATUSES.PROCESSING,
      AUTOMATION_JOB_STATUSES.COMPLETED,
      AUTOMATION_JOB_STATUSES.FAILED,
      AUTOMATION_JOB_STATUSES.RETRYING,
      AUTOMATION_JOB_STATUSES.CANCELLED,
    ])
    .optional(),
});

export type ListAutomationJobsQuery = z.infer<typeof listAutomationJobsQuerySchema>;

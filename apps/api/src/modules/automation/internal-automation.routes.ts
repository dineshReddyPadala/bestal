import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { errorResponses } from '../../validators/api-responses.validator.js';
import { AutomationController } from './automation.controller.js';
import {
  AUTOMATION_JOB_STATUSES,
  AUTOMATION_JOB_TYPES,
} from './automation.constants.js';
import { AutomationService } from './automation.service.js';
import { bgvAnalysisCallbackBodySchema } from './dto/bgv-analysis-callback.dto.js';
import { evaluationAnalysisCallbackBodySchema } from './dto/evaluation-analysis-callback.dto.js';
import { resumeScreeningCallbackBodySchema } from './dto/resume-screening-callback.dto.js';
import { requireAutomationCallbackBearer } from './internal-automation.auth.js';

const automationJobDtoSchema = z.object({
  id: z.number().int().positive(),
  candidateId: z.number().int().positive().nullable(),
  documentId: z.number().int().positive().nullable(),
  jobType: z.enum([
    AUTOMATION_JOB_TYPES.RESUME_SCREENING,
    AUTOMATION_JOB_TYPES.EVALUATION_ANALYSIS,
    AUTOMATION_JOB_TYPES.BGV_ANALYSIS,
  ]),
  status: z.enum([
    AUTOMATION_JOB_STATUSES.PENDING,
    AUTOMATION_JOB_STATUSES.PROCESSING,
    AUTOMATION_JOB_STATUSES.COMPLETED,
    AUTOMATION_JOB_STATUSES.FAILED,
    AUTOMATION_JOB_STATUSES.RETRYING,
    AUTOMATION_JOB_STATUSES.CANCELLED,
  ]),
  workflowName: z.string().nullable(),
  workflowVersion: z.string().nullable(),
  n8nExecutionId: z.string().nullable(),
  inputReference: z.record(z.unknown()).nullable(),
  outputReference: z.record(z.unknown()).nullable(),
  attempts: z.number().int().nonnegative(),
  maxAttempts: z.number().int().positive(),
  errorCode: z.string().nullable(),
  errorMessage: z.string().nullable(),
  requestedBy: z.number().int().positive(),
  startedAt: z.string().nullable(),
  completedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const automationCallbackResponseSchema = z.object({
  data: automationJobDtoSchema,
  alreadyProcessed: z.boolean(),
});

/**
 * Internal-only automation callbacks for n8n.
 * Not registered under the user JWT API surface; auth is service Bearer secret.
 */
export async function internalAutomationRoutes(
  fastify: FastifyInstance,
): Promise<void> {
  const automationService = new AutomationService(fastify);
  const automationController = new AutomationController(automationService);
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.post(
    '/callbacks/resume-screening',
    {
      preHandler: [requireAutomationCallbackBearer(automationService)],
      schema: {
        hide: true,
        tags: ['Internal Automation'],
        summary: 'Internal n8n callback for Resume AI Screening (service auth only)',
        body: resumeScreeningCallbackBodySchema,
        response: {
          200: automationCallbackResponseSchema,
          401: errorResponses[401],
          404: errorResponses[404],
          422: errorResponses[422],
        },
      },
    },
    automationController.resumeScreeningCallback,
  );

  app.post(
    '/callbacks/evaluation-analysis',
    {
      preHandler: [requireAutomationCallbackBearer(automationService)],
      schema: {
        hide: true,
        tags: ['Internal Automation'],
        summary:
          'Internal n8n callback for Evaluation AI Analysis (service auth only)',
        body: evaluationAnalysisCallbackBodySchema,
        response: {
          200: automationCallbackResponseSchema,
          401: errorResponses[401],
          404: errorResponses[404],
          422: errorResponses[422],
        },
      },
    },
    automationController.evaluationAnalysisCallback,
  );

  app.post(
    '/callbacks/bgv-analysis',
    {
      preHandler: [requireAutomationCallbackBearer(automationService)],
      schema: {
        hide: true,
        tags: ['Internal Automation'],
        summary: 'Internal n8n callback for BGV AI Analysis (service auth only)',
        body: bgvAnalysisCallbackBodySchema,
        response: {
          200: automationCallbackResponseSchema,
          401: errorResponses[401],
          404: errorResponses[404],
          422: errorResponses[422],
        },
      },
    },
    automationController.bgvAnalysisCallback,
  );
}

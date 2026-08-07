import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { authenticate } from '../../middleware/authenticate.middleware.js';
import { requirePermission } from '../../middleware/permission.middleware.js';
import { AuthenticationError } from '../../utils/index.js';
import {
  errorResponses,
  paginationMetaSchema,
} from '../../validators/api-responses.validator.js';
import { PERMISSIONS } from '../auth/auth.permissions.js';
import { AutomationController } from './automation.controller.js';
import {
  AUTOMATION_CALLBACK_SECRET_HEADER,
  AUTOMATION_JOB_STATUSES,
  AUTOMATION_JOB_TYPES,
} from './automation.constants.js';
import { AutomationService } from './automation.service.js';
import {
  automationCallbackBodySchema,
  automationJobIdParamSchema,
  listAutomationJobsQuerySchema,
} from './dto/automation-callback.dto.js';

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

const automationJobResponseSchema = z.object({
  data: automationJobDtoSchema,
});

const automationJobListResponseSchema = z.object({
  data: z.array(automationJobDtoSchema),
  meta: paginationMetaSchema,
});

export async function automationRoutes(fastify: FastifyInstance): Promise<void> {
  const automationService = new AutomationService(fastify);
  const automationController = new AutomationController(automationService);
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  const requireCallbackAuth = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    if (automationService.isCallbackSecretConfigured()) {
      const header = request.headers[AUTOMATION_CALLBACK_SECRET_HEADER];
      const provided = Array.isArray(header) ? header[0] : header;
      if (!automationService.verifyCallbackSecret(provided)) {
        throw new AuthenticationError('Invalid automation callback secret');
      }
      return;
    }

    // Local fallback when AUTOMATION_CALLBACK_SECRET is unset.
    await authenticate(request, reply);
    await requirePermission(PERMISSIONS.ADMIN_PLATFORM)(request, reply);
  };

  app.get(
    '/jobs',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.CANDIDATES_READ)],
      schema: {
        tags: ['Automation'],
        summary: 'List automation jobs for the current organization',
        security: [{ bearerAuth: [] }],
        querystring: listAutomationJobsQuerySchema,
        response: {
          200: automationJobListResponseSchema,
          401: errorResponses[401],
          422: errorResponses[422],
        },
      },
    },
    automationController.list,
  );

  app.get(
    '/jobs/:id',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.CANDIDATES_READ)],
      schema: {
        tags: ['Automation'],
        summary: 'Get automation job by numeric id',
        security: [{ bearerAuth: [] }],
        params: automationJobIdParamSchema,
        response: {
          200: automationJobResponseSchema,
          401: errorResponses[401],
          404: errorResponses[404],
          422: errorResponses[422],
        },
      },
    },
    automationController.getById,
  );

  app.post(
    '/callbacks',
    {
      preHandler: [requireCallbackAuth],
      schema: {
        tags: ['Automation'],
        summary:
          'Secure n8n callback (X-Automation-Callback-Secret when configured)',
        body: automationCallbackBodySchema,
        response: {
          200: automationJobResponseSchema,
          401: errorResponses[401],
          404: errorResponses[404],
          422: errorResponses[422],
        },
      },
    },
    automationController.callback,
  );
}

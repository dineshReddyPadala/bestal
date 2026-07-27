import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { authenticate } from '../../middleware/authenticate.middleware.js';
import { requirePermission } from '../../middleware/permission.middleware.js';
import { errorResponses } from '../../validators/api-responses.validator.js';
import { PERMISSIONS } from '../auth/auth.permissions.js';
import { TrialController } from './trial.controller.js';
import { TrialService } from './trial.service.js';
import {
  createTrialBodySchema,
  listTrialsQuerySchema,
  rejectTrialBodySchema,
  trialFeedbackBodySchema,
  trialIdParamSchema,
  trialListResponseSchema,
  trialResponseSchema,
  updateTrialBodySchema,
} from './trial.validator.js';

export async function trialRoutes(fastify: FastifyInstance): Promise<void> {
  const trialService = new TrialService(fastify);
  const trialController = new TrialController(trialService);
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.post(
    '/',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.TRIALS_WRITE)],
      schema: {
        tags: ['Trials'],
        summary: 'Create a new trial request',
        security: [{ bearerAuth: [] }],
        body: createTrialBodySchema,
        response: {
          201: trialResponseSchema,
          401: errorResponses[401],
          422: errorResponses[422],
        },
      },
    },
    trialController.create,
  );

  app.get(
    '/',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.TRIALS_READ)],
      schema: {
        tags: ['Trials'],
        summary: 'List trial requests with pagination and filtering',
        security: [{ bearerAuth: [] }],
        querystring: listTrialsQuerySchema,
        response: {
          200: trialListResponseSchema,
          401: errorResponses[401],
          422: errorResponses[422],
        },
      },
    },
    trialController.list,
  );

  app.get(
    '/:id',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.TRIALS_READ)],
      schema: {
        tags: ['Trials'],
        summary: 'Get trial request details by ID',
        security: [{ bearerAuth: [] }],
        params: trialIdParamSchema,
        response: {
          200: trialResponseSchema,
          401: errorResponses[401],
          404: errorResponses[404],
          422: errorResponses[422],
        },
      },
    },
    trialController.getById,
  );

  app.patch(
    '/:id',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.TRIALS_WRITE)],
      schema: {
        tags: ['Trials'],
        summary: 'Update trial request',
        security: [{ bearerAuth: [] }],
        params: trialIdParamSchema,
        body: updateTrialBodySchema,
        response: {
          200: trialResponseSchema,
          401: errorResponses[401],
          404: errorResponses[404],
          422: errorResponses[422],
        },
      },
    },
    trialController.update,
  );

  app.post(
    '/:id/approve',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.TRIALS_WRITE)],
      schema: {
        tags: ['Trials'],
        summary: 'Approve trial request',
        security: [{ bearerAuth: [] }],
        params: trialIdParamSchema,
        response: {
          200: trialResponseSchema,
          401: errorResponses[401],
          404: errorResponses[404],
          422: errorResponses[422],
        },
      },
    },
    trialController.approve,
  );

  app.post(
    '/:id/reject',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.TRIALS_WRITE)],
      schema: {
        tags: ['Trials'],
        summary: 'Reject trial request',
        security: [{ bearerAuth: [] }],
        params: trialIdParamSchema,
        body: rejectTrialBodySchema,
        response: {
          200: trialResponseSchema,
          401: errorResponses[401],
          404: errorResponses[404],
          422: errorResponses[422],
        },
      },
    },
    trialController.reject,
  );

  app.post(
    '/:id/confirm-candidate',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.TRIALS_WRITE)],
      schema: {
        tags: ['Trials'],
        summary: 'Mark candidate confirmed for trial',
        security: [{ bearerAuth: [] }],
        params: trialIdParamSchema,
        response: {
          200: trialResponseSchema,
          401: errorResponses[401],
          404: errorResponses[404],
          422: errorResponses[422],
        },
      },
    },
    trialController.confirmCandidate,
  );

  app.post(
    '/:id/feedback',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.TRIALS_WRITE)],
      schema: {
        tags: ['Trials'],
        summary: 'Submit client feedback after trial completion',
        security: [{ bearerAuth: [] }],
        params: trialIdParamSchema,
        body: trialFeedbackBodySchema,
        response: {
          200: trialResponseSchema,
          401: errorResponses[401],
          404: errorResponses[404],
          422: errorResponses[422],
        },
      },
    },
    trialController.submitFeedback,
  );
}

import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { authenticate } from '../../middleware/authenticate.middleware.js';
import { requirePermission } from '../../middleware/permission.middleware.js';
import { errorResponses } from '../../validators/api-responses.validator.js';
import { PERMISSIONS } from '../auth/auth.permissions.js';
import { InterviewController } from './interview.controller.js';
import { InterviewService } from './interview.service.js';
import {
  cancelInterviewBodySchema,
  confirmInterviewBodySchema,
  createInterviewBodySchema,
  interviewIdParamSchema,
  interviewListResponseSchema,
  interviewResponseSchema,
  listInterviewsQuerySchema,
  updateInterviewBodySchema,
} from './interview.validator.js';

export async function interviewRoutes(fastify: FastifyInstance): Promise<void> {
  const interviewService = new InterviewService(fastify);
  const interviewController = new InterviewController(interviewService);
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.post(
    '/',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.INTERVIEWS_WRITE)],
      schema: {
        tags: ['Interviews'],
        summary: 'Create a new interview request',
        security: [{ bearerAuth: [] }],
        body: createInterviewBodySchema,
        response: {
          201: interviewResponseSchema,
          401: errorResponses[401],
          422: errorResponses[422],
        },
      },
    },
    interviewController.create,
  );

  app.get(
    '/',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.INTERVIEWS_READ)],
      schema: {
        tags: ['Interviews'],
        summary: 'List interview requests with pagination and filtering',
        security: [{ bearerAuth: [] }],
        querystring: listInterviewsQuerySchema,
        response: {
          200: interviewListResponseSchema,
          401: errorResponses[401],
          422: errorResponses[422],
        },
      },
    },
    interviewController.list,
  );

  app.get(
    '/:id',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.INTERVIEWS_READ)],
      schema: {
        tags: ['Interviews'],
        summary: 'Get interview request details by ID',
        security: [{ bearerAuth: [] }],
        params: interviewIdParamSchema,
        response: {
          200: interviewResponseSchema,
          401: errorResponses[401],
          404: errorResponses[404],
          422: errorResponses[422],
        },
      },
    },
    interviewController.getById,
  );

  app.patch(
    '/:id',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.INTERVIEWS_WRITE)],
      schema: {
        tags: ['Interviews'],
        summary: 'Update interview request',
        security: [{ bearerAuth: [] }],
        params: interviewIdParamSchema,
        body: updateInterviewBodySchema,
        response: {
          200: interviewResponseSchema,
          401: errorResponses[401],
          404: errorResponses[404],
          422: errorResponses[422],
        },
      },
    },
    interviewController.update,
  );

  app.post(
    '/:id/confirm',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.INTERVIEWS_WRITE)],
      schema: {
        tags: ['Interviews'],
        summary: 'Confirm interview schedule',
        security: [{ bearerAuth: [] }],
        params: interviewIdParamSchema,
        body: confirmInterviewBodySchema,
        response: {
          200: interviewResponseSchema,
          401: errorResponses[401],
          404: errorResponses[404],
          422: errorResponses[422],
        },
      },
    },
    interviewController.confirm,
  );

  app.post(
    '/:id/cancel',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.INTERVIEWS_WRITE)],
      schema: {
        tags: ['Interviews'],
        summary: 'Cancel interview request',
        security: [{ bearerAuth: [] }],
        params: interviewIdParamSchema,
        body: cancelInterviewBodySchema,
        response: {
          200: interviewResponseSchema,
          401: errorResponses[401],
          404: errorResponses[404],
          422: errorResponses[422],
        },
      },
    },
    interviewController.cancel,
  );
}

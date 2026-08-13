import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { authenticate } from '../../middleware/authenticate.middleware.js';
import { requirePermission } from '../../middleware/permission.middleware.js';
import { errorResponses } from '../../validators/api-responses.validator.js';
import { PERMISSIONS } from '../auth/auth.permissions.js';
import { JobRequestController } from './job-request.controller.js';
import { JobRequestService } from './job-request.service.js';
import {
  createPublicJobRequestBodySchema,
  jobRequestIdParamSchema,
  jobRequestListResponseSchema,
  jobRequestResponseSchema,
  listJobRequestsQuerySchema,
  publicJobRequestSubmitResponseSchema,
  updateJobRequestBodySchema,
} from './job-request.validator.js';

export async function jobRequestRoutes(fastify: FastifyInstance): Promise<void> {
  const jobRequestService = new JobRequestService(fastify);
  const jobRequestController = new JobRequestController(jobRequestService);
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.get(
    '/',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.JOB_REQUESTS_READ)],
      schema: {
        tags: ['Job Requests'],
        summary: 'List job requests with pagination and filtering',
        security: [{ bearerAuth: [] }],
        querystring: listJobRequestsQuerySchema,
        response: {
          200: jobRequestListResponseSchema,
          401: errorResponses[401],
          422: errorResponses[422],
        },
      },
    },
    jobRequestController.list,
  );

  app.get(
    '/:id',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.JOB_REQUESTS_READ)],
      schema: {
        tags: ['Job Requests'],
        summary: 'Get job request details by ID',
        security: [{ bearerAuth: [] }],
        params: jobRequestIdParamSchema,
        response: {
          200: jobRequestResponseSchema,
          401: errorResponses[401],
          404: errorResponses[404],
          422: errorResponses[422],
        },
      },
    },
    jobRequestController.getById,
  );

  app.patch(
    '/:id',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.JOB_REQUESTS_WRITE)],
      schema: {
        tags: ['Job Requests'],
        summary: 'Update job request status, assignee, or internal notes',
        security: [{ bearerAuth: [] }],
        params: jobRequestIdParamSchema,
        body: updateJobRequestBodySchema,
        response: {
          200: jobRequestResponseSchema,
          401: errorResponses[401],
          404: errorResponses[404],
          422: errorResponses[422],
        },
      },
    },
    jobRequestController.update,
  );
}

export async function jobRequestPublicRoutes(fastify: FastifyInstance): Promise<void> {
  const jobRequestService = new JobRequestService(fastify);
  const jobRequestController = new JobRequestController(jobRequestService);
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.post(
    '/',
    {
      schema: {
        tags: ['Public'],
        summary: 'Submit a job request from the marketing site',
        body: createPublicJobRequestBodySchema,
        response: {
          201: publicJobRequestSubmitResponseSchema,
          422: errorResponses[422],
        },
      },
    },
    jobRequestController.submitPublic,
  );
}

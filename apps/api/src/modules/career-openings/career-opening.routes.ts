import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { authenticate } from '../../middleware/authenticate.middleware.js';
import { requirePermission } from '../../middleware/permission.middleware.js';
import { errorResponses, messageResponseSchema } from '../../validators/api-responses.validator.js';
import { PERMISSIONS } from '../auth/auth.permissions.js';
import { CareerOpeningController } from './career-opening.controller.js';
import { CareerOpeningService } from './career-opening.service.js';
import {
  careerOpeningIdParamSchema,
  careerOpeningListResponseSchema,
  careerOpeningPublicListResponseSchema,
  careerOpeningResponseSchema,
  createCareerOpeningBodySchema,
  listCareerOpeningsQuerySchema,
  updateCareerOpeningBodySchema,
} from './career-opening.validator.js';

export async function careerOpeningRoutes(fastify: FastifyInstance): Promise<void> {
  const service = new CareerOpeningService(fastify);
  const controller = new CareerOpeningController(service);
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.get(
    '/',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.JOB_REQUESTS_READ)],
      schema: {
        tags: ['Career Openings'],
        summary: 'List career openings for the current organization',
        security: [{ bearerAuth: [] }],
        querystring: listCareerOpeningsQuerySchema,
        response: {
          200: careerOpeningListResponseSchema,
          401: errorResponses[401],
          422: errorResponses[422],
        },
      },
    },
    controller.list,
  );

  app.get(
    '/:id',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.JOB_REQUESTS_READ)],
      schema: {
        tags: ['Career Openings'],
        summary: 'Get career opening details',
        security: [{ bearerAuth: [] }],
        params: careerOpeningIdParamSchema,
        response: {
          200: careerOpeningResponseSchema,
          401: errorResponses[401],
          404: errorResponses[404],
          422: errorResponses[422],
        },
      },
    },
    controller.getById,
  );

  app.post(
    '/',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.JOB_REQUESTS_WRITE)],
      schema: {
        tags: ['Career Openings'],
        summary: 'Create a career opening',
        security: [{ bearerAuth: [] }],
        body: createCareerOpeningBodySchema,
        response: {
          201: careerOpeningResponseSchema,
          401: errorResponses[401],
          422: errorResponses[422],
        },
      },
    },
    controller.create,
  );

  app.patch(
    '/:id',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.JOB_REQUESTS_WRITE)],
      schema: {
        tags: ['Career Openings'],
        summary: 'Update a career opening',
        security: [{ bearerAuth: [] }],
        params: careerOpeningIdParamSchema,
        body: updateCareerOpeningBodySchema,
        response: {
          200: careerOpeningResponseSchema,
          401: errorResponses[401],
          404: errorResponses[404],
          422: errorResponses[422],
        },
      },
    },
    controller.update,
  );

  app.delete(
    '/:id',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.JOB_REQUESTS_WRITE)],
      schema: {
        tags: ['Career Openings'],
        summary: 'Delete a career opening',
        security: [{ bearerAuth: [] }],
        params: careerOpeningIdParamSchema,
        response: {
          200: messageResponseSchema,
          401: errorResponses[401],
          404: errorResponses[404],
          422: errorResponses[422],
        },
      },
    },
    controller.remove,
  );
}

export async function careerOpeningPublicRoutes(fastify: FastifyInstance): Promise<void> {
  const service = new CareerOpeningService(fastify);
  const controller = new CareerOpeningController(service);
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.get(
    '/',
    {
      schema: {
        tags: ['Public'],
        summary: 'List published career openings',
        response: {
          200: careerOpeningPublicListResponseSchema,
        },
      },
    },
    controller.listPublished,
  );
}

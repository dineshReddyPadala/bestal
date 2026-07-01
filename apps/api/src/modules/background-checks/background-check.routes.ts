import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { authenticate } from '../../middleware/authenticate.middleware.js';
import { requirePermission } from '../../middleware/permission.middleware.js';
import { errorResponses } from '../../validators/api-responses.validator.js';
import { PERMISSIONS } from '../auth/auth.permissions.js';
import { BackgroundCheckController } from './background-check.controller.js';
import { BackgroundCheckService } from './background-check.service.js';
import {
  backgroundCheckIdParamSchema,
  backgroundCheckListResponseSchema,
  backgroundCheckMessageResponseSchema,
  backgroundCheckResponseSchema,
  createBackgroundCheckBodySchema,
  listBackgroundChecksQuerySchema,
  updateBackgroundCheckBodySchema,
} from './background-check.validator.js';

export async function backgroundCheckRoutes(
  fastify: FastifyInstance,
): Promise<void> {
  const backgroundCheckService = new BackgroundCheckService(fastify);
  const backgroundCheckController = new BackgroundCheckController(
    backgroundCheckService,
  );
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.post(
    '/',
    {
      preHandler: [
        authenticate,
        requirePermission(PERMISSIONS.BACKGROUND_CHECKS_WRITE),
      ],
      schema: {
        tags: ['Background Checks'],
        summary: 'Create a new background check',
        security: [{ bearerAuth: [] }],
        body: createBackgroundCheckBodySchema,
        response: {
          201: backgroundCheckResponseSchema,
          401: errorResponses[401],
          422: errorResponses[422],
        },
      },
    },
    backgroundCheckController.create,
  );

  app.get(
    '/',
    {
      preHandler: [
        authenticate,
        requirePermission(PERMISSIONS.BACKGROUND_CHECKS_READ),
      ],
      schema: {
        tags: ['Background Checks'],
        summary: 'List background checks with pagination and filtering',
        security: [{ bearerAuth: [] }],
        querystring: listBackgroundChecksQuerySchema,
        response: {
          200: backgroundCheckListResponseSchema,
          401: errorResponses[401],
          422: errorResponses[422],
        },
      },
    },
    backgroundCheckController.list,
  );

  app.get(
    '/:id',
    {
      preHandler: [
        authenticate,
        requirePermission(PERMISSIONS.BACKGROUND_CHECKS_READ),
      ],
      schema: {
        tags: ['Background Checks'],
        summary: 'Get background check details by ID',
        security: [{ bearerAuth: [] }],
        params: backgroundCheckIdParamSchema,
        response: {
          200: backgroundCheckResponseSchema,
          401: errorResponses[401],
          404: errorResponses[404],
          422: errorResponses[422],
        },
      },
    },
    backgroundCheckController.getById,
  );

  app.patch(
    '/:id',
    {
      preHandler: [
        authenticate,
        requirePermission(PERMISSIONS.BACKGROUND_CHECKS_WRITE),
      ],
      schema: {
        tags: ['Background Checks'],
        summary: 'Update background check',
        security: [{ bearerAuth: [] }],
        params: backgroundCheckIdParamSchema,
        body: updateBackgroundCheckBodySchema,
        response: {
          200: backgroundCheckResponseSchema,
          401: errorResponses[401],
          404: errorResponses[404],
          422: errorResponses[422],
        },
      },
    },
    backgroundCheckController.update,
  );

  app.delete(
    '/:id',
    {
      preHandler: [
        authenticate,
        requirePermission(PERMISSIONS.BACKGROUND_CHECKS_WRITE),
      ],
      schema: {
        tags: ['Background Checks'],
        summary: 'Soft delete background check',
        security: [{ bearerAuth: [] }],
        params: backgroundCheckIdParamSchema,
        response: {
          200: backgroundCheckMessageResponseSchema,
          401: errorResponses[401],
          404: errorResponses[404],
          422: errorResponses[422],
        },
      },
    },
    backgroundCheckController.remove,
  );
}

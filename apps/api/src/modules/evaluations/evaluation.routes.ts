import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { authenticate } from '../../middleware/authenticate.middleware.js';
import { requirePermission } from '../../middleware/permission.middleware.js';
import { errorResponses } from '../../validators/api-responses.validator.js';
import { PERMISSIONS } from '../auth/auth.permissions.js';
import { EvaluationController } from './evaluation.controller.js';
import { EvaluationService } from './evaluation.service.js';
import {
  createEvaluationBodySchema,
  evaluationIdParamSchema,
  evaluationListResponseSchema,
  evaluationMessageResponseSchema,
  evaluationResponseSchema,
  listEvaluationsQuerySchema,
  updateEvaluationBodySchema,
} from './evaluation.validator.js';

export async function evaluationRoutes(fastify: FastifyInstance): Promise<void> {
  const evaluationService = new EvaluationService(fastify);
  const evaluationController = new EvaluationController(evaluationService);
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.post(
    '/',
    {
      preHandler: [
        authenticate,
        requirePermission(PERMISSIONS.EVALUATIONS_WRITE),
      ],
      schema: {
        tags: ['Evaluations'],
        summary: 'Create a new evaluation',
        security: [{ bearerAuth: [] }],
        body: createEvaluationBodySchema,
        response: {
          201: evaluationResponseSchema,
          401: errorResponses[401],
          422: errorResponses[422],
        },
      },
    },
    evaluationController.create,
  );

  app.get(
    '/',
    {
      preHandler: [
        authenticate,
        requirePermission(PERMISSIONS.EVALUATIONS_READ),
      ],
      schema: {
        tags: ['Evaluations'],
        summary: 'List evaluations with pagination and filtering',
        security: [{ bearerAuth: [] }],
        querystring: listEvaluationsQuerySchema,
        response: {
          200: evaluationListResponseSchema,
          401: errorResponses[401],
          422: errorResponses[422],
        },
      },
    },
    evaluationController.list,
  );

  app.get(
    '/:id',
    {
      preHandler: [
        authenticate,
        requirePermission(PERMISSIONS.EVALUATIONS_READ),
      ],
      schema: {
        tags: ['Evaluations'],
        summary: 'Get evaluation details by ID',
        security: [{ bearerAuth: [] }],
        params: evaluationIdParamSchema,
        response: {
          200: evaluationResponseSchema,
          401: errorResponses[401],
          404: errorResponses[404],
          422: errorResponses[422],
        },
      },
    },
    evaluationController.getById,
  );

  app.patch(
    '/:id',
    {
      preHandler: [
        authenticate,
        requirePermission(PERMISSIONS.EVALUATIONS_WRITE),
      ],
      schema: {
        tags: ['Evaluations'],
        summary: 'Update evaluation',
        security: [{ bearerAuth: [] }],
        params: evaluationIdParamSchema,
        body: updateEvaluationBodySchema,
        response: {
          200: evaluationResponseSchema,
          401: errorResponses[401],
          404: errorResponses[404],
          422: errorResponses[422],
        },
      },
    },
    evaluationController.update,
  );

  app.delete(
    '/:id',
    {
      preHandler: [
        authenticate,
        requirePermission(PERMISSIONS.EVALUATIONS_WRITE),
      ],
      schema: {
        tags: ['Evaluations'],
        summary: 'Soft delete evaluation',
        security: [{ bearerAuth: [] }],
        params: evaluationIdParamSchema,
        response: {
          200: evaluationMessageResponseSchema,
          401: errorResponses[401],
          404: errorResponses[404],
          422: errorResponses[422],
        },
      },
    },
    evaluationController.remove,
  );
}

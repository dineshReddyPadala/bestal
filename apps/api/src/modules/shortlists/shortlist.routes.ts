import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { authenticate } from '../../middleware/authenticate.middleware.js';
import { requirePermission } from '../../middleware/permission.middleware.js';
import { errorResponses } from '../../validators/api-responses.validator.js';
import { PERMISSIONS } from '../auth/auth.permissions.js';
import { ShortlistController } from './shortlist.controller.js';
import { ShortlistService } from './shortlist.service.js';
import {
  addShortlistCandidateBodySchema,
  createShortlistBodySchema,
  listShortlistsQuerySchema,
  shortlistCandidateParamsSchema,
  shortlistCandidateResponseSchema,
  shortlistIdParamSchema,
  shortlistListResponseSchema,
  shortlistMessageResponseSchema,
  shortlistResponseSchema,
  updateShortlistCandidateBodySchema,
} from './shortlist.validator.js';

export async function shortlistRoutes(fastify: FastifyInstance): Promise<void> {
  const shortlistService = new ShortlistService(fastify);
  const shortlistController = new ShortlistController(shortlistService);
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.post(
    '/',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.SHORTLISTS_WRITE)],
      schema: {
        tags: ['Shortlists'],
        summary: 'Create a new shortlist',
        security: [{ bearerAuth: [] }],
        body: createShortlistBodySchema,
        response: {
          201: shortlistResponseSchema,
          401: errorResponses[401],
          422: errorResponses[422],
        },
      },
    },
    shortlistController.create,
  );

  app.get(
    '/',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.SHORTLISTS_READ)],
      schema: {
        tags: ['Shortlists'],
        summary: 'List shortlists with pagination and filtering',
        security: [{ bearerAuth: [] }],
        querystring: listShortlistsQuerySchema,
        response: {
          200: shortlistListResponseSchema,
          401: errorResponses[401],
          422: errorResponses[422],
        },
      },
    },
    shortlistController.list,
  );

  app.get(
    '/:id',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.SHORTLISTS_READ)],
      schema: {
        tags: ['Shortlists'],
        summary: 'Get shortlist with candidates by ID',
        security: [{ bearerAuth: [] }],
        params: shortlistIdParamSchema,
        response: {
          200: shortlistResponseSchema,
          401: errorResponses[401],
          404: errorResponses[404],
          422: errorResponses[422],
        },
      },
    },
    shortlistController.getById,
  );

  app.post(
    '/:id/candidates',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.SHORTLISTS_WRITE)],
      schema: {
        tags: ['Shortlists'],
        summary: 'Add candidate to shortlist',
        security: [{ bearerAuth: [] }],
        params: shortlistIdParamSchema,
        body: addShortlistCandidateBodySchema,
        response: {
          201: shortlistCandidateResponseSchema,
          401: errorResponses[401],
          404: errorResponses[404],
          422: errorResponses[422],
        },
      },
    },
    shortlistController.addCandidate,
  );

  app.delete(
    '/:shortlistId/candidates/:candidateId',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.SHORTLISTS_WRITE)],
      schema: {
        tags: ['Shortlists'],
        summary: 'Remove candidate from shortlist',
        security: [{ bearerAuth: [] }],
        params: shortlistCandidateParamsSchema,
        response: {
          200: shortlistMessageResponseSchema,
          401: errorResponses[401],
          404: errorResponses[404],
          422: errorResponses[422],
        },
      },
    },
    shortlistController.removeCandidate,
  );

  app.patch(
    '/:shortlistId/candidates/:candidateId',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.SHORTLISTS_WRITE)],
      schema: {
        tags: ['Shortlists'],
        summary: 'Update shortlist candidate rank, notes, or approval',
        security: [{ bearerAuth: [] }],
        params: shortlistCandidateParamsSchema,
        body: updateShortlistCandidateBodySchema,
        response: {
          200: shortlistCandidateResponseSchema,
          401: errorResponses[401],
          404: errorResponses[404],
          422: errorResponses[422],
        },
      },
    },
    shortlistController.updateCandidate,
  );
}

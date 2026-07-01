import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { authenticate } from '../../middleware/authenticate.middleware.js';
import { requirePermission } from '../../middleware/permission.middleware.js';
import { errorResponses } from '../../validators/api-responses.validator.js';
import { PERMISSIONS } from '../auth/auth.permissions.js';
import { ClientController } from './client.controller.js';
import { ClientService } from './client.service.js';
import {
  clientIdParamSchema,
  clientListResponseSchema,
  clientMessageResponseSchema,
  clientResponseSchema,
  createClientBodySchema,
  listClientsQuerySchema,
  updateClientBodySchema,
} from './client.validator.js';

export async function clientRoutes(fastify: FastifyInstance): Promise<void> {
  const clientService = new ClientService(fastify);
  const clientController = new ClientController(clientService);
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.post(
    '/',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.CLIENTS_WRITE)],
      schema: {
        tags: ['Clients'],
        summary: 'Create a new client',
        security: [{ bearerAuth: [] }],
        body: createClientBodySchema,
        response: {
          201: clientResponseSchema,
          401: errorResponses[401],
          422: errorResponses[422],
        },
      },
    },
    clientController.create,
  );

  app.get(
    '/',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.CLIENTS_READ)],
      schema: {
        tags: ['Clients'],
        summary: 'List clients with pagination, filtering, and search',
        security: [{ bearerAuth: [] }],
        querystring: listClientsQuerySchema,
        response: {
          200: clientListResponseSchema,
          401: errorResponses[401],
          422: errorResponses[422],
        },
      },
    },
    clientController.list,
  );

  app.get(
    '/:id',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.CLIENTS_READ)],
      schema: {
        tags: ['Clients'],
        summary: 'Get client details by ID',
        security: [{ bearerAuth: [] }],
        params: clientIdParamSchema,
        response: {
          200: clientResponseSchema,
          401: errorResponses[401],
          404: errorResponses[404],
          422: errorResponses[422],
        },
      },
    },
    clientController.getById,
  );

  app.patch(
    '/:id',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.CLIENTS_WRITE)],
      schema: {
        tags: ['Clients'],
        summary: 'Update client',
        security: [{ bearerAuth: [] }],
        params: clientIdParamSchema,
        body: updateClientBodySchema,
        response: {
          200: clientResponseSchema,
          401: errorResponses[401],
          404: errorResponses[404],
          422: errorResponses[422],
        },
      },
    },
    clientController.update,
  );

  app.delete(
    '/:id',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.CLIENTS_DELETE)],
      schema: {
        tags: ['Clients'],
        summary: 'Soft delete client',
        security: [{ bearerAuth: [] }],
        params: clientIdParamSchema,
        response: {
          200: clientMessageResponseSchema,
          401: errorResponses[401],
          404: errorResponses[404],
          422: errorResponses[422],
        },
      },
    },
    clientController.remove,
  );
}

import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { authenticate } from '../../middleware/authenticate.middleware.js';
import { requirePermission } from '../../middleware/permission.middleware.js';
import { errorResponses } from '../../validators/api-responses.validator.js';
import { PERMISSIONS } from '../auth/auth.permissions.js';
import { ContactMessageController } from './contact-message.controller.js';
import { ContactMessageService } from './contact-message.service.js';
import {
  contactMessageIdParamSchema,
  contactMessageListResponseSchema,
  contactMessageResponseSchema,
  createPublicContactMessageBodySchema,
  listContactMessagesQuerySchema,
  publicContactMessageSubmitResponseSchema,
  updateContactMessageBodySchema,
} from './contact-message.validator.js';

export async function contactMessageRoutes(fastify: FastifyInstance): Promise<void> {
  const service = new ContactMessageService(fastify);
  const controller = new ContactMessageController(service);
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.get(
    '/',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.JOB_REQUESTS_READ)],
      schema: {
        tags: ['Contact Messages'],
        summary: 'List contact form submissions',
        security: [{ bearerAuth: [] }],
        querystring: listContactMessagesQuerySchema,
        response: {
          200: contactMessageListResponseSchema,
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
        tags: ['Contact Messages'],
        summary: 'Get contact message details',
        security: [{ bearerAuth: [] }],
        params: contactMessageIdParamSchema,
        response: {
          200: contactMessageResponseSchema,
          401: errorResponses[401],
          404: errorResponses[404],
          422: errorResponses[422],
        },
      },
    },
    controller.getById,
  );

  app.patch(
    '/:id',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.JOB_REQUESTS_WRITE)],
      schema: {
        tags: ['Contact Messages'],
        summary: 'Update contact message status or notes',
        security: [{ bearerAuth: [] }],
        params: contactMessageIdParamSchema,
        body: updateContactMessageBodySchema,
        response: {
          200: contactMessageResponseSchema,
          401: errorResponses[401],
          404: errorResponses[404],
          422: errorResponses[422],
        },
      },
    },
    controller.update,
  );
}

export async function contactMessagePublicRoutes(fastify: FastifyInstance): Promise<void> {
  const service = new ContactMessageService(fastify);
  const controller = new ContactMessageController(service);
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.post(
    '/',
    {
      schema: {
        tags: ['Public'],
        summary: 'Submit the marketing contact form',
        body: createPublicContactMessageBodySchema,
        response: {
          201: publicContactMessageSubmitResponseSchema,
          422: errorResponses[422],
        },
      },
    },
    controller.submitPublic,
  );
}

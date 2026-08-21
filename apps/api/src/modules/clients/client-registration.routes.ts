import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { errorResponses } from '../../validators/api-responses.validator.js';
import { ClientRegistrationController } from './client-registration.controller.js';
import { ClientRegistrationService } from './client-registration.service.js';
import {
  publicClientRegistrationBodySchema,
  publicClientRegistrationResponseSchema,
} from './client-registration.validator.js';

export async function clientRegistrationPublicRoutes(
  fastify: FastifyInstance,
): Promise<void> {
  const service = new ClientRegistrationService(fastify);
  const controller = new ClientRegistrationController(service);
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.post(
    '/register',
    {
      schema: {
        tags: ['Public'],
        summary: 'Self-register a client company and primary contact (pending activation)',
        body: publicClientRegistrationBodySchema,
        response: {
          201: publicClientRegistrationResponseSchema,
          409: errorResponses[409],
          422: errorResponses[422],
        },
      },
    },
    controller.register,
  );
}

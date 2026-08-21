import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { errorResponses } from '../../validators/api-responses.validator.js';
import { ClientRegistrationController } from './client-registration.controller.js';
import { ClientRegistrationService } from './client-registration.service.js';
import {
  clientSignupRequestOtpBodySchema,
  clientSignupRequestOtpResponseSchema,
  clientSignupVerifyBodySchema,
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
    '/signup/request-otp',
    {
      schema: {
        tags: ['Public'],
        summary: 'Send email OTP for client self-registration',
        body: clientSignupRequestOtpBodySchema,
        response: {
          200: clientSignupRequestOtpResponseSchema,
          409: errorResponses[409],
          422: errorResponses[422],
        },
      },
    },
    controller.requestOtp,
  );

  app.post(
    '/signup/verify-and-create',
    {
      schema: {
        tags: ['Public'],
        summary: 'Verify OTP and create client account (pending activation)',
        body: clientSignupVerifyBodySchema,
        response: {
          201: publicClientRegistrationResponseSchema,
          400: errorResponses[400],
          409: errorResponses[409],
          422: errorResponses[422],
        },
      },
    },
    controller.verifyAndCreate,
  );

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

import type { FastifyReply, FastifyRequest } from 'fastify';
import type { PublicClientRegistrationBody } from './client-registration.validator.js';
import type { ClientRegistrationService } from './client-registration.service.js';

export class ClientRegistrationController {
  constructor(private readonly service: ClientRegistrationService) {}

  register = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as PublicClientRegistrationBody;
    const result = await this.service.register(body);
    return reply.status(201).send({ data: result });
  };
}

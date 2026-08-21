import type { FastifyReply, FastifyRequest } from 'fastify';
import type {
  ClientSignupRequestOtpBody,
  ClientSignupVerifyBody,
  PublicClientRegistrationBody,
} from './client-registration.validator.js';
import type { ClientRegistrationService } from './client-registration.service.js';

export class ClientRegistrationController {
  constructor(private readonly service: ClientRegistrationService) {}

  requestOtp = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as ClientSignupRequestOtpBody;
    const result = await this.service.requestOtp(body);
    return reply.status(200).send({ data: result });
  };

  verifyAndCreate = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as ClientSignupVerifyBody;
    const result = await this.service.verifyAndCreate(body);
    return reply.status(201).send({ data: result });
  };

  register = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as PublicClientRegistrationBody;
    const result = await this.service.register(body);
    return reply.status(201).send({ data: result });
  };
}

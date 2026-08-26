import type { FastifyReply, FastifyRequest } from 'fastify';
import { ContactMessageService } from './contact-message.service.js';
import type {
  CreatePublicContactMessageBody,
  ListContactMessagesQuery,
  UpdateContactMessageBody,
} from './contact-message.validator.js';

export class ContactMessageController {
  constructor(private readonly service: ContactMessageService) {}

  submitPublic = async (request: FastifyRequest, reply: FastifyReply) => {
    const data = await this.service.submitPublic(
      request.body as CreatePublicContactMessageBody,
    );
    return reply.status(201).send({ data });
  };

  list = async (request: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.list(
      request.authUser!,
      request.query as ListContactMessagesQuery,
    );
    return reply.status(200).send(result);
  };

  getById = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.service.getById(request.authUser!, id);
    return reply.status(200).send({ data });
  };

  update = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.service.update(
      request.authUser!,
      id,
      request.body as UpdateContactMessageBody,
    );
    return reply.status(200).send({ data });
  };
}

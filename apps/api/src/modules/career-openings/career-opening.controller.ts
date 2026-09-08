import type { FastifyReply, FastifyRequest } from 'fastify';
import { CareerOpeningService } from './career-opening.service.js';
import type {
  CreateCareerOpeningBody,
  ListCareerOpeningsQuery,
  UpdateCareerOpeningBody,
} from './career-opening.validator.js';

export class CareerOpeningController {
  constructor(private readonly service: CareerOpeningService) {}

  listPublished = async (_request: FastifyRequest, reply: FastifyReply) => {
    const data = await this.service.listPublished();
    return reply.status(200).send({ data });
  };

  list = async (request: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.list(
      request.authUser!,
      request.query as ListCareerOpeningsQuery,
    );
    return reply.status(200).send(result);
  };

  getById = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.service.getById(request.authUser!, id);
    return reply.status(200).send({ data });
  };

  create = async (request: FastifyRequest, reply: FastifyReply) => {
    const data = await this.service.create(
      request.authUser!,
      request.body as CreateCareerOpeningBody,
    );
    return reply.status(201).send({ data });
  };

  update = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.service.update(
      request.authUser!,
      id,
      request.body as UpdateCareerOpeningBody,
    );
    return reply.status(200).send({ data });
  };

  remove = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    await this.service.remove(request.authUser!, id);
    return reply.status(200).send({ data: { message: 'Career opening deleted' } });
  };
}

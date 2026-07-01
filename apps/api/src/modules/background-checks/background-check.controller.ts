import type { FastifyReply, FastifyRequest } from 'fastify';
import { BackgroundCheckService } from './background-check.service.js';
import type {
  CreateBackgroundCheckBody,
  ListBackgroundChecksQuery,
  UpdateBackgroundCheckBody,
} from './background-check.validator.js';

export class BackgroundCheckController {
  constructor(private readonly backgroundCheckService: BackgroundCheckService) {}

  create = async (request: FastifyRequest, reply: FastifyReply) => {
    const data = await this.backgroundCheckService.create(
      request.authUser!,
      request.body as CreateBackgroundCheckBody,
    );
    return reply.status(201).send({ data });
  };

  list = async (request: FastifyRequest, reply: FastifyReply) => {
    const result = await this.backgroundCheckService.list(
      request.authUser!,
      request.query as ListBackgroundChecksQuery,
    );
    return reply.status(200).send(result);
  };

  getById = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.backgroundCheckService.getById(request.authUser!, id);
    return reply.status(200).send({ data });
  };

  update = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.backgroundCheckService.update(
      request.authUser!,
      id,
      request.body as UpdateBackgroundCheckBody,
    );
    return reply.status(200).send({ data });
  };

  remove = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    await this.backgroundCheckService.delete(request.authUser!, id);
    return reply.status(200).send({
      data: { message: 'Background check deleted successfully' },
    });
  };
}

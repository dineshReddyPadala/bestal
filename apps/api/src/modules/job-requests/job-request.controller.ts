import type { FastifyReply, FastifyRequest } from 'fastify';
import { JobRequestService } from './job-request.service.js';
import type {
  CreatePublicJobRequestBody,
  ListJobRequestsQuery,
  UpdateJobRequestBody,
} from './job-request.validator.js';

export class JobRequestController {
  constructor(private readonly jobRequestService: JobRequestService) {}

  submitPublic = async (request: FastifyRequest, reply: FastifyReply) => {
    const data = await this.jobRequestService.submitPublic(
      request.body as CreatePublicJobRequestBody,
    );
    return reply.status(201).send({ data });
  };

  list = async (request: FastifyRequest, reply: FastifyReply) => {
    const result = await this.jobRequestService.list(
      request.authUser!,
      request.query as ListJobRequestsQuery,
    );
    return reply.status(200).send(result);
  };

  getById = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.jobRequestService.getById(request.authUser!, id);
    return reply.status(200).send({ data });
  };

  update = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.jobRequestService.update(
      request.authUser!,
      id,
      request.body as UpdateJobRequestBody,
    );
    return reply.status(200).send({ data });
  };
}

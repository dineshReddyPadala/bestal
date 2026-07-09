import type { FastifyReply, FastifyRequest } from 'fastify';
import { InterviewService } from './interview.service.js';
import type {
  CancelInterviewBody,
  ConfirmInterviewBody,
  CreateInterviewBody,
  ListInterviewsQuery,
  UpdateInterviewBody,
} from './interview.validator.js';

export class InterviewController {
  constructor(private readonly interviewService: InterviewService) {}

  create = async (request: FastifyRequest, reply: FastifyReply) => {
    const data = await this.interviewService.create(
      request.authUser!,
      request.body as CreateInterviewBody,
    );
    return reply.status(201).send({ data });
  };

  list = async (request: FastifyRequest, reply: FastifyReply) => {
    const result = await this.interviewService.list(
      request.authUser!,
      request.query as ListInterviewsQuery,
    );
    return reply.status(200).send(result);
  };

  getById = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.interviewService.getById(request.authUser!, id);
    return reply.status(200).send({ data });
  };

  update = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.interviewService.update(
      request.authUser!,
      id,
      request.body as UpdateInterviewBody,
    );
    return reply.status(200).send({ data });
  };

  confirm = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.interviewService.confirm(
      request.authUser!,
      id,
      request.body as ConfirmInterviewBody,
    );
    return reply.status(200).send({ data });
  };

  cancel = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.interviewService.cancel(
      request.authUser!,
      id,
      request.body as CancelInterviewBody,
    );
    return reply.status(200).send({ data });
  };
}

import type { FastifyReply, FastifyRequest } from 'fastify';
import { TrialService } from './trial.service.js';
import type {
  CreateTrialBody,
  ListTrialsQuery,
  RejectTrialBody,
  UpdateTrialBody,
} from './trial.validator.js';

export class TrialController {
  constructor(private readonly trialService: TrialService) {}

  create = async (request: FastifyRequest, reply: FastifyReply) => {
    const data = await this.trialService.create(
      request.authUser!,
      request.body as CreateTrialBody,
    );
    return reply.status(201).send({ data });
  };

  list = async (request: FastifyRequest, reply: FastifyReply) => {
    const result = await this.trialService.list(
      request.authUser!,
      request.query as ListTrialsQuery,
    );
    return reply.status(200).send(result);
  };

  getById = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.trialService.getById(request.authUser!, id);
    return reply.status(200).send({ data });
  };

  update = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.trialService.update(
      request.authUser!,
      id,
      request.body as UpdateTrialBody,
    );
    return reply.status(200).send({ data });
  };

  approve = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.trialService.approve(request.authUser!, id);
    return reply.status(200).send({ data });
  };

  reject = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.trialService.reject(
      request.authUser!,
      id,
      request.body as RejectTrialBody,
    );
    return reply.status(200).send({ data });
  };
}

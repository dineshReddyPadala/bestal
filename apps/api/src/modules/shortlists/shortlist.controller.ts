import type { FastifyReply, FastifyRequest } from 'fastify';
import { ShortlistService } from './shortlist.service.js';
import type {
  AddShortlistCandidateBody,
  CreateShortlistBody,
  ListShortlistsQuery,
  UpdateShortlistCandidateBody,
} from './shortlist.validator.js';

export class ShortlistController {
  constructor(private readonly shortlistService: ShortlistService) {}

  create = async (request: FastifyRequest, reply: FastifyReply) => {
    const data = await this.shortlistService.create(
      request.authUser!,
      request.body as CreateShortlistBody,
    );
    return reply.status(201).send({ data });
  };

  list = async (request: FastifyRequest, reply: FastifyReply) => {
    const result = await this.shortlistService.list(
      request.authUser!,
      request.query as ListShortlistsQuery,
    );
    return reply.status(200).send(result);
  };

  getById = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.shortlistService.getById(request.authUser!, id);
    return reply.status(200).send({ data });
  };

  addCandidate = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.shortlistService.addCandidate(
      request.authUser!,
      id,
      request.body as AddShortlistCandidateBody,
    );
    return reply.status(201).send({ data });
  };

  removeCandidate = async (request: FastifyRequest, reply: FastifyReply) => {
    const { shortlistId, candidateId } = request.params as {
      shortlistId: number;
      candidateId: number;
    };
    await this.shortlistService.removeCandidate(
      request.authUser!,
      shortlistId,
      candidateId,
    );
    return reply.status(200).send({
      data: { message: 'Candidate removed from shortlist' },
    });
  };

  updateCandidate = async (request: FastifyRequest, reply: FastifyReply) => {
    const { shortlistId, candidateId } = request.params as {
      shortlistId: number;
      candidateId: number;
    };
    const data = await this.shortlistService.updateCandidate(
      request.authUser!,
      shortlistId,
      candidateId,
      request.body as UpdateShortlistCandidateBody,
    );
    return reply.status(200).send({ data });
  };
}

import type { FastifyInstance } from 'fastify';
import type { AuthenticatedUser } from '../../types/index.js';
import {
  BadRequestError,
  NotFoundError,
  requireOrganization,
} from '../../utils/index.js';
import { buildPaginationMeta } from '../../validators/common.validator.js';
import {
  mapEvaluationToDto,
  mapEvaluationToListItem,
} from './evaluation.mapper.js';
import { EvaluationRepository } from './evaluation.repository.js';
import type {
  CompleteEvaluationInput,
  CreateEvaluationInput,
  EvaluationDto,
  EvaluationListItemDto,
  UpdateEvaluationInput,
} from './evaluation.types.js';
import type { ListEvaluationsQuery } from './evaluation.validator.js';

export class EvaluationService {
  private readonly evaluationRepository: EvaluationRepository;

  constructor(
    fastify: FastifyInstance,
    evaluationRepository?: EvaluationRepository,
  ) {
    this.evaluationRepository =
      evaluationRepository ?? new EvaluationRepository(fastify.prisma);
  }

  async create(
    authUser: AuthenticatedUser,
    input: CreateEvaluationInput,
  ): Promise<EvaluationDto> {
    const organizationId = requireOrganization(authUser);

    await this.validateCandidate(organizationId, input.candidateId);

    if (input.clientId) {
      await this.validateClient(organizationId, input.clientId);
    }

    const evaluatorId = input.evaluatorId ?? authUser.id;
    await this.validateEvaluator(evaluatorId);

    const evaluation = await this.evaluationRepository.create(
      organizationId,
      evaluatorId,
      input,
    );
    return mapEvaluationToDto(evaluation);
  }

  async update(
    authUser: AuthenticatedUser,
    id: number,
    input: UpdateEvaluationInput,
  ): Promise<EvaluationDto> {
    const organizationId = requireOrganization(authUser);
    await this.getEvaluationOrThrow(organizationId, id);

    if (input.clientId) {
      await this.validateClient(organizationId, input.clientId);
    }

    if (input.evaluatorId) {
      await this.validateEvaluator(input.evaluatorId);
    }

    const evaluation = await this.evaluationRepository.update(
      organizationId,
      id,
      input,
    );
    return mapEvaluationToDto(evaluation);
  }

  async complete(
    authUser: AuthenticatedUser,
    id: number,
    input: CompleteEvaluationInput,
  ): Promise<EvaluationDto> {
    const organizationId = requireOrganization(authUser);
    await this.getEvaluationOrThrow(organizationId, id);

    const evaluation = await this.evaluationRepository.complete(
      organizationId,
      id,
      input,
    );
    return mapEvaluationToDto(evaluation);
  }

  async delete(authUser: AuthenticatedUser, id: number): Promise<void> {
    const organizationId = requireOrganization(authUser);
    await this.getEvaluationOrThrow(organizationId, id);
    await this.evaluationRepository.softDelete(organizationId, id);
  }

  async list(
    authUser: AuthenticatedUser,
    query: ListEvaluationsQuery,
  ): Promise<{
    data: EvaluationListItemDto[];
    meta: ReturnType<typeof buildPaginationMeta>;
  }> {
    const organizationId = requireOrganization(authUser);

    const { items, total } = await this.evaluationRepository.findMany({
      organizationId,
      page: query.page,
      limit: query.limit,
      sort: query.sort,
      candidateId: query.candidateId,
      clientId: query.clientId,
      status: query.status,
      evaluatorId: query.evaluatorId,
    });

    return {
      data: items.map(mapEvaluationToListItem),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async getById(authUser: AuthenticatedUser, id: number): Promise<EvaluationDto> {
    const organizationId = requireOrganization(authUser);
    const evaluation = await this.getEvaluationOrThrow(organizationId, id);
    return mapEvaluationToDto(evaluation);
  }

  private async getEvaluationOrThrow(organizationId: number, id: number) {
    const evaluation = await this.evaluationRepository.findById(organizationId, id);
    if (!evaluation) {
      throw new NotFoundError('Evaluation not found');
    }
    return evaluation;
  }

  private async validateCandidate(
    organizationId: number,
    candidateId: number,
  ): Promise<void> {
    const exists = await this.evaluationRepository.candidateExists(
      organizationId,
      candidateId,
    );
    if (!exists) {
      throw new BadRequestError('Candidate not found');
    }
  }

  private async validateClient(
    organizationId: number,
    clientId: number,
  ): Promise<void> {
    const exists = await this.evaluationRepository.clientExists(
      organizationId,
      clientId,
    );
    if (!exists) {
      throw new BadRequestError('Client not found');
    }
  }

  private async validateEvaluator(evaluatorId: number): Promise<void> {
    const exists = await this.evaluationRepository.evaluatorExists(evaluatorId);
    if (!exists) {
      throw new BadRequestError('Evaluator not found');
    }
  }
}

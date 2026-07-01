import type { FastifyInstance } from 'fastify';
import type { AuthenticatedUser } from '../../types/index.js';
import {
  BadRequestError,
  NotFoundError,
  requireOrganization,
} from '../../utils/index.js';
import { buildPaginationMeta } from '../../validators/common.validator.js';
import { mapTrialToDto, mapTrialToListItem } from './trial.mapper.js';
import { TrialRepository } from './trial.repository.js';
import type {
  CreateTrialInput,
  RejectTrialInput,
  TrialDto,
  TrialListItemDto,
  UpdateTrialInput,
} from './trial.types.js';
import type { ListTrialsQuery } from './trial.validator.js';

export class TrialService {
  private readonly trialRepository: TrialRepository;

  constructor(fastify: FastifyInstance, trialRepository?: TrialRepository) {
    this.trialRepository =
      trialRepository ?? new TrialRepository(fastify.prisma);
  }

  async create(
    authUser: AuthenticatedUser,
    input: CreateTrialInput,
  ): Promise<TrialDto> {
    const organizationId = requireOrganization(authUser);

    await this.validateCandidate(organizationId, input.candidateId);
    await this.validateClient(organizationId, input.clientId);

    if (input.deploymentId) {
      await this.validateDeployment(organizationId, input.deploymentId);
    }

    const trial = await this.trialRepository.create(
      organizationId,
      authUser.id,
      input,
    );
    return mapTrialToDto(trial);
  }

  async update(
    authUser: AuthenticatedUser,
    id: number,
    input: UpdateTrialInput,
  ): Promise<TrialDto> {
    const organizationId = requireOrganization(authUser);
    await this.getTrialOrThrow(organizationId, id);

    if (input.candidateId) {
      await this.validateCandidate(organizationId, input.candidateId);
    }

    if (input.clientId) {
      await this.validateClient(organizationId, input.clientId);
    }

    if (input.deploymentId) {
      await this.validateDeployment(organizationId, input.deploymentId);
    }

    const trial = await this.trialRepository.update(organizationId, id, input);
    return mapTrialToDto(trial);
  }

  async approve(authUser: AuthenticatedUser, id: number): Promise<TrialDto> {
    const organizationId = requireOrganization(authUser);
    await this.getTrialOrThrow(organizationId, id);

    const trial = await this.trialRepository.approve(organizationId, id);
    return mapTrialToDto(trial);
  }

  async reject(
    authUser: AuthenticatedUser,
    id: number,
    input: RejectTrialInput,
  ): Promise<TrialDto> {
    const organizationId = requireOrganization(authUser);
    await this.getTrialOrThrow(organizationId, id);

    const trial = await this.trialRepository.reject(organizationId, id, input);
    return mapTrialToDto(trial);
  }

  async list(
    authUser: AuthenticatedUser,
    query: ListTrialsQuery,
  ): Promise<{
    data: TrialListItemDto[];
    meta: ReturnType<typeof buildPaginationMeta>;
  }> {
    const organizationId = requireOrganization(authUser);

    const { items, total } = await this.trialRepository.findMany({
      organizationId,
      page: query.page,
      limit: query.limit,
      sort: query.sort,
      candidateId: query.candidateId,
      clientId: query.clientId,
      status: query.status,
    });

    return {
      data: items.map(mapTrialToListItem),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async getById(authUser: AuthenticatedUser, id: number): Promise<TrialDto> {
    const organizationId = requireOrganization(authUser);
    const trial = await this.getTrialOrThrow(organizationId, id);
    return mapTrialToDto(trial);
  }

  private async getTrialOrThrow(organizationId: number, id: number) {
    const trial = await this.trialRepository.findById(organizationId, id);
    if (!trial) {
      throw new NotFoundError('Trial request not found');
    }
    return trial;
  }

  private async validateCandidate(
    organizationId: number,
    candidateId: number,
  ): Promise<void> {
    const exists = await this.trialRepository.candidateExists(
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
    const exists = await this.trialRepository.clientExists(organizationId, clientId);
    if (!exists) {
      throw new BadRequestError('Client not found');
    }
  }

  private async validateDeployment(
    organizationId: number,
    deploymentId: number,
  ): Promise<void> {
    const exists = await this.trialRepository.deploymentExists(
      organizationId,
      deploymentId,
    );
    if (!exists) {
      throw new BadRequestError('Deployment not found');
    }
  }
}

import type { FastifyInstance } from 'fastify';
import type { AuthenticatedUser } from '../../types/index.js';
import {
  BadRequestError,
  NotFoundError,
  requireOrganization,
} from '../../utils/index.js';
import { buildPaginationMeta } from '../../validators/common.validator.js';
import {
  mapDeploymentToDto,
  mapDeploymentToListItem,
} from './deployment.mapper.js';
import { DeploymentRepository } from './deployment.repository.js';
import type {
  CreateDeploymentInput,
  DeploymentDto,
  DeploymentListItemDto,
  TerminateDeploymentInput,
  UpdateDeploymentInput,
} from './deployment.types.js';
import type { ListDeploymentsQuery } from './deployment.validator.js';

export class DeploymentService {
  private readonly deploymentRepository: DeploymentRepository;

  constructor(
    fastify: FastifyInstance,
    deploymentRepository?: DeploymentRepository,
  ) {
    this.deploymentRepository =
      deploymentRepository ?? new DeploymentRepository(fastify.prisma);
  }

  async create(
    authUser: AuthenticatedUser,
    input: CreateDeploymentInput,
  ): Promise<DeploymentDto> {
    const organizationId = requireOrganization(authUser);

    await this.validateCandidate(organizationId, input.candidateId);
    await this.validateClient(organizationId, input.clientId);

    const deployment = await this.deploymentRepository.create(
      organizationId,
      authUser.id,
      input,
    );
    return mapDeploymentToDto(deployment);
  }

  async update(
    authUser: AuthenticatedUser,
    id: number,
    input: UpdateDeploymentInput,
  ): Promise<DeploymentDto> {
    const organizationId = requireOrganization(authUser);
    await this.getDeploymentOrThrow(organizationId, id);

    if (input.candidateId) {
      await this.validateCandidate(organizationId, input.candidateId);
    }

    if (input.clientId) {
      await this.validateClient(organizationId, input.clientId);
    }

    const deployment = await this.deploymentRepository.update(
      organizationId,
      id,
      input,
    );
    return mapDeploymentToDto(deployment);
  }

  async activate(authUser: AuthenticatedUser, id: number): Promise<DeploymentDto> {
    const organizationId = requireOrganization(authUser);
    await this.getDeploymentOrThrow(organizationId, id);

    const deployment = await this.deploymentRepository.activate(organizationId, id);
    return mapDeploymentToDto(deployment);
  }

  async terminate(
    authUser: AuthenticatedUser,
    id: number,
    input: TerminateDeploymentInput,
  ): Promise<DeploymentDto> {
    const organizationId = requireOrganization(authUser);
    await this.getDeploymentOrThrow(organizationId, id);

    const deployment = await this.deploymentRepository.terminate(
      organizationId,
      id,
      input,
    );
    return mapDeploymentToDto(deployment);
  }

  async delete(authUser: AuthenticatedUser, id: number): Promise<void> {
    const organizationId = requireOrganization(authUser);
    await this.getDeploymentOrThrow(organizationId, id);
    await this.deploymentRepository.softDelete(organizationId, id);
  }

  async list(
    authUser: AuthenticatedUser,
    query: ListDeploymentsQuery,
  ): Promise<{
    data: DeploymentListItemDto[];
    meta: ReturnType<typeof buildPaginationMeta>;
  }> {
    const organizationId = requireOrganization(authUser);

    const { items, total } = await this.deploymentRepository.findMany({
      organizationId,
      page: query.page,
      limit: query.limit,
      sort: query.sort,
      candidateId: query.candidateId,
      clientId: query.clientId,
      status: query.status,
      placementType: query.placementType,
    });

    return {
      data: items.map(mapDeploymentToListItem),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async getById(authUser: AuthenticatedUser, id: number): Promise<DeploymentDto> {
    const organizationId = requireOrganization(authUser);
    const deployment = await this.getDeploymentOrThrow(organizationId, id);
    return mapDeploymentToDto(deployment);
  }

  private async getDeploymentOrThrow(organizationId: number, id: number) {
    const deployment = await this.deploymentRepository.findById(
      organizationId,
      id,
    );
    if (!deployment) {
      throw new NotFoundError('Deployment not found');
    }
    return deployment;
  }

  private async validateCandidate(
    organizationId: number,
    candidateId: number,
  ): Promise<void> {
    const exists = await this.deploymentRepository.candidateExists(
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
    const exists = await this.deploymentRepository.clientExists(
      organizationId,
      clientId,
    );
    if (!exists) {
      throw new BadRequestError('Client not found');
    }
  }
}

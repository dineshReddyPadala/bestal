import type { FastifyInstance } from 'fastify';
import {
  notifyDeploymentRequested,
  notifyDeploymentStatusChanged,
} from '../../services/notification-events.js';
import { LifecycleSchedulerService } from '../../services/lifecycle-scheduler.service.js';
import type { AuthenticatedUser } from '../../types/index.js';
import {
  BadRequestError,
  NotFoundError,
  requireOrganization,
} from '../../utils/index.js';
import { buildPaginationMeta } from '../../validators/common.validator.js';
import {
  clearExtensionRequest,
  mapDeploymentToDto,
  mapDeploymentToListItem,
  withExtensionRequest,
} from './deployment.mapper.js';
import { DeploymentRepository } from './deployment.repository.js';
import type {
  ApproveDeploymentInput,
  CreateDeploymentInput,
  DeploymentDto,
  DeploymentListItemDto,
  RequestDeploymentInput,
  TerminateDeploymentInput,
  UpdateDeploymentInput,
} from './deployment.types.js';
import type { ListDeploymentsQuery } from './deployment.validator.js';

export class DeploymentService {
  private readonly deploymentRepository: DeploymentRepository;
  private readonly lifecycle: LifecycleSchedulerService;

  constructor(
    private readonly fastify: FastifyInstance,
    deploymentRepository?: DeploymentRepository,
  ) {
    this.deploymentRepository =
      deploymentRepository ?? new DeploymentRepository(fastify.prisma);
    this.lifecycle = new LifecycleSchedulerService(fastify);
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
    const dto = mapDeploymentToDto(deployment);

    if (dto.status === 'ACTIVE') {
      await this.lifecycle.hideCandidateForActiveDeployment(
        organizationId,
        dto.candidateId,
      );
      void notifyDeploymentStatusChanged(this.fastify.prisma, this.fastify.config, {
        organizationId,
        deploymentId: dto.id,
        status: 'ACTIVE',
        candidateName: dto.candidateName,
        roleTitle: dto.roleTitle,
        createdById: dto.createdById,
        requestedById: dto.requestedById,
        clientId: dto.clientId,
      });
    }

    return dto;
  }

  async request(
    authUser: AuthenticatedUser,
    input: RequestDeploymentInput,
  ): Promise<DeploymentDto> {
    const organizationId = requireOrganization(authUser);
    if (authUser.role !== 'CLIENT') {
      throw new BadRequestError('Only clients can submit deployment requests');
    }

    const clientId = await this.resolveScopedClientId(authUser, organizationId);
    await this.validateCandidate(organizationId, input.candidateId);
    await this.validateClient(organizationId, clientId);

    const deployment = await this.deploymentRepository.create(
      organizationId,
      authUser.id,
      {
        ...input,
        clientId,
        requestedById: authUser.id,
        status: 'PENDING',
        activateNow: false,
      },
    );
    const dto = mapDeploymentToDto(deployment);

    void notifyDeploymentRequested(this.fastify.prisma, this.fastify.config, {
      organizationId,
      deploymentId: dto.id,
      candidateName: dto.candidateName,
      clientName: dto.clientName,
      roleTitle: dto.roleTitle,
    });

    return dto;
  }

  async approve(
    authUser: AuthenticatedUser,
    id: number,
    input: ApproveDeploymentInput,
  ): Promise<DeploymentDto> {
    const organizationId = requireOrganization(authUser);
    const existing = await this.getDeploymentOrThrow(organizationId, id);
    if (existing.status !== 'PENDING') {
      throw new BadRequestError('Only pending deployments can be approved');
    }
    if (input.billingRate == null || input.billingRate <= 0) {
      throw new BadRequestError('Billing rate is required to approve a deployment');
    }

    const startDate =
      input.startDate ??
      (existing.startDate
        ? existing.startDate.toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10));

    const deployment = await this.deploymentRepository.update(organizationId, id, {
      ...input,
      status: 'ACTIVE',
      startDate,
    });
    const dto = mapDeploymentToDto(deployment);

    await this.lifecycle.hideCandidateForActiveDeployment(
      organizationId,
      dto.candidateId,
    );

    void notifyDeploymentStatusChanged(this.fastify.prisma, this.fastify.config, {
      organizationId,
      deploymentId: dto.id,
      status: 'ACTIVE',
      candidateName: dto.candidateName,
      roleTitle: dto.roleTitle,
      createdById: dto.createdById,
      requestedById: dto.requestedById,
      clientId: dto.clientId,
    });

    return dto;
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
    const dto = mapDeploymentToDto(deployment);

    if (input.status === 'ACTIVE') {
      await this.lifecycle.hideCandidateForActiveDeployment(
        organizationId,
        dto.candidateId,
      );
    }
    if (input.status === 'COMPLETED' || input.status === 'TERMINATED') {
      await this.lifecycle.restoreCandidateIfNotDeployed(
        organizationId,
        dto.candidateId,
      );
    }

    return dto;
  }

  async activate(authUser: AuthenticatedUser, id: number): Promise<DeploymentDto> {
    const organizationId = requireOrganization(authUser);
    const existing = await this.getDeploymentOrThrow(organizationId, id);
    if (existing.billingRate == null) {
      throw new BadRequestError(
        'Billing rate is required before activating. Use approve with commercial details.',
      );
    }

    const deployment = await this.deploymentRepository.activate(organizationId, id);
    const dto = mapDeploymentToDto(deployment);

    await this.lifecycle.hideCandidateForActiveDeployment(
      organizationId,
      dto.candidateId,
    );

    void notifyDeploymentStatusChanged(this.fastify.prisma, this.fastify.config, {
      organizationId,
      deploymentId: dto.id,
      status: 'ACTIVE',
      candidateName: dto.candidateName,
      roleTitle: dto.roleTitle,
      createdById: dto.createdById,
      requestedById: dto.requestedById,
      clientId: dto.clientId,
    });

    return dto;
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
    const dto = mapDeploymentToDto(deployment);

    await this.lifecycle.restoreCandidateIfNotDeployed(
      organizationId,
      dto.candidateId,
    );

    void notifyDeploymentStatusChanged(this.fastify.prisma, this.fastify.config, {
      organizationId,
      deploymentId: dto.id,
      status: 'TERMINATED',
      candidateName: dto.candidateName,
      roleTitle: dto.roleTitle,
      createdById: dto.createdById,
      requestedById: dto.requestedById,
      clientId: dto.clientId,
    });

    return dto;
  }

  async pause(authUser: AuthenticatedUser, id: number): Promise<DeploymentDto> {
    const organizationId = requireOrganization(authUser);
    await this.getDeploymentOrThrow(organizationId, id);
    const deployment = await this.deploymentRepository.update(organizationId, id, {
      status: 'ON_HOLD',
    });
    return mapDeploymentToDto(deployment);
  }

  async resume(authUser: AuthenticatedUser, id: number): Promise<DeploymentDto> {
    const organizationId = requireOrganization(authUser);
    await this.getDeploymentOrThrow(organizationId, id);
    const deployment = await this.deploymentRepository.update(organizationId, id, {
      status: 'ACTIVE',
    });
    const dto = mapDeploymentToDto(deployment);
    await this.lifecycle.hideCandidateForActiveDeployment(
      organizationId,
      dto.candidateId,
    );
    return dto;
  }

  async complete(authUser: AuthenticatedUser, id: number): Promise<DeploymentDto> {
    const organizationId = requireOrganization(authUser);
    await this.getDeploymentOrThrow(organizationId, id);
    const deployment = await this.deploymentRepository.update(organizationId, id, {
      status: 'COMPLETED',
      endDate: new Date().toISOString().slice(0, 10),
    });
    const dto = mapDeploymentToDto(deployment);
    await this.lifecycle.restoreCandidateIfNotDeployed(
      organizationId,
      dto.candidateId,
    );

    void notifyDeploymentStatusChanged(this.fastify.prisma, this.fastify.config, {
      organizationId,
      deploymentId: dto.id,
      status: 'COMPLETED',
      candidateName: dto.candidateName,
      roleTitle: dto.roleTitle,
      createdById: dto.createdById,
      requestedById: dto.requestedById,
      clientId: dto.clientId,
    });

    return dto;
  }

  async extend(
    authUser: AuthenticatedUser,
    id: number,
    endDate: string,
  ): Promise<DeploymentDto> {
    const organizationId = requireOrganization(authUser);
    const existing = await this.getDeploymentOrThrow(organizationId, id);
    const deployment = await this.deploymentRepository.update(organizationId, id, {
      endDate,
      notes: clearExtensionRequest(existing.notes) ?? undefined,
    });
    return mapDeploymentToDto(deployment);
  }

  async requestExtension(
    authUser: AuthenticatedUser,
    id: number,
    input: { endDate: string; reason?: string },
  ): Promise<DeploymentDto> {
    const organizationId = requireOrganization(authUser);
    if (authUser.role !== 'CLIENT') {
      throw new BadRequestError('Only clients can request deployment extensions');
    }

    const clientId = await this.resolveScopedClientId(authUser, organizationId);
    const existing = await this.getDeploymentOrThrow(organizationId, id);
    if (Number(existing.clientId) !== clientId) {
      throw new NotFoundError('Deployment not found');
    }
    if (existing.status !== 'ACTIVE' && existing.status !== 'ON_HOLD') {
      throw new BadRequestError('Only active or on-hold deployments can be extended');
    }

    const deployment = await this.deploymentRepository.update(organizationId, id, {
      notes: withExtensionRequest(existing.notes, input.endDate, input.reason ?? ''),
    });
    const dto = mapDeploymentToDto(deployment);

    void notifyDeploymentRequested(this.fastify.prisma, this.fastify.config, {
      organizationId,
      deploymentId: dto.id,
      candidateName: dto.candidateName,
      clientName: dto.clientName,
      roleTitle: `extension to ${input.endDate} — ${dto.roleTitle}`,
    });

    return dto;
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
    const scopedClientId =
      authUser.role === 'CLIENT'
        ? await this.resolveScopedClientId(authUser, organizationId)
        : null;

    const { items, total } = await this.deploymentRepository.findMany({
      organizationId,
      page: query.page,
      limit: query.limit,
      sort: query.sort,
      search: query.search,
      candidateId: query.candidateId,
      clientId: scopedClientId ?? query.clientId,
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
    if (authUser.role === 'CLIENT') {
      const clientId = await this.resolveScopedClientId(authUser, organizationId);
      if (Number(deployment.clientId) !== clientId) {
        throw new NotFoundError('Deployment not found');
      }
    }
    return mapDeploymentToDto(deployment);
  }

  private async resolveScopedClientId(
    authUser: AuthenticatedUser,
    organizationId: number,
  ): Promise<number> {
    const membership = await this.fastify.prisma.membership.findFirst({
      where: {
        userId: BigInt(authUser.id),
        organizationId: BigInt(organizationId),
        isActive: true,
      },
      select: { clientId: true },
    });

    if (membership?.clientId != null) {
      return Number(membership.clientId);
    }

    const byEmail = await this.fastify.prisma.client.findFirst({
      where: {
        organizationId: BigInt(organizationId),
        contactEmail: { equals: authUser.email, mode: 'insensitive' },
        deletedAt: null,
      },
      select: { id: true },
    });
    if (!byEmail) {
      throw new BadRequestError('Client account is not linked to this user');
    }
    return Number(byEmail.id);
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

import type { FastifyInstance } from 'fastify';
import type { TrialRequestStatus } from '@prisma/client';
import {
  notifyTrialRequested,
  notifyTrialStatusChanged,
} from '../../services/notification-events.js';
import { readTrialsSettings } from '../../services/system-settings.reader.js';
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
  TrialFeedbackInput,
  UpdateTrialInput,
} from './trial.types.js';
import type { ListTrialsQuery } from './trial.validator.js';

export class TrialService {
  private readonly trialRepository: TrialRepository;
  private readonly fastify: FastifyInstance;

  constructor(fastify: FastifyInstance, trialRepository?: TrialRepository) {
    this.fastify = fastify;
    this.trialRepository =
      trialRepository ?? new TrialRepository(fastify.prisma);
  }

  async create(
    authUser: AuthenticatedUser,
    input: CreateTrialInput,
  ): Promise<TrialDto> {
    const organizationId = requireOrganization(authUser);
    const scopedClientId = await this.resolveScopedClientId(authUser, organizationId);
    const clientId = scopedClientId ?? input.clientId;
    if (scopedClientId != null && input.clientId !== scopedClientId) {
      throw new BadRequestError('Clients can only create trials for their own account');
    }

    await this.validateCandidate(organizationId, input.candidateId);
    await this.validateClient(organizationId, clientId);

    if (input.deploymentId) {
      await this.validateDeployment(organizationId, input.deploymentId);
    }

    const existingTrial = await this.trialRepository.findBlockingTrial(
      organizationId,
      input.candidateId,
      clientId,
    );
    if (existingTrial) {
      throw new BadRequestError(
        'A trial was already requested or completed for this candidate. You cannot request another trial.',
      );
    }

    const trialsSettings = await readTrialsSettings(this.fastify.prisma);
    const maxTrialHours =
      input.maxTrialHours ?? trialsSettings.freeTrialHours;

    const trial = await this.trialRepository.create(
      organizationId,
      authUser.id,
      { ...input, clientId, maxTrialHours },
    );
    const dto = mapTrialToDto(trial);
    void notifyTrialRequested(this.fastify.prisma, this.fastify.config, {
      organizationId,
      trialId: dto.id,
      candidateName: dto.candidateName,
      clientName: dto.clientName,
      requestedById: authUser.id,
    });
    return dto;
  }

  async update(
    authUser: AuthenticatedUser,
    id: number,
    input: UpdateTrialInput,
  ): Promise<TrialDto> {
    const organizationId = requireOrganization(authUser);
    const existing = await this.getTrialOrThrow(organizationId, id);

    if (input.candidateId) {
      await this.validateCandidate(organizationId, input.candidateId);
    }

    if (input.clientId) {
      await this.validateClient(organizationId, input.clientId);
    }

    if (input.deploymentId) {
      await this.validateDeployment(organizationId, input.deploymentId);
    }

    if (input.status && input.status !== existing.status) {
      this.validateTransition(existing.status, input.status);
    }

    const patch: UpdateTrialInput = { ...input };
    if (
      input.status === 'IN_PROGRESS' &&
      input.status !== existing.status &&
      !existing.startedAt
    ) {
      patch.startedAt = new Date();
    }

    if (
      (input.feedback !== undefined || input.clientRating !== undefined) &&
      (input.status ?? existing.status) !== 'COMPLETED'
    ) {
      throw new BadRequestError('Client feedback can only be added to a completed trial');
    }

    const trial = await this.trialRepository.update(organizationId, id, patch);
    return mapTrialToDto(trial);
  }

  async approve(authUser: AuthenticatedUser, id: number): Promise<TrialDto> {
    const organizationId = requireOrganization(authUser);
    const existing = await this.getTrialOrThrow(organizationId, id);
    this.validateTransition(existing.status, 'APPROVED');

    if (existing.maxTrialHours == null) {
      const trialsSettings = await readTrialsSettings(this.fastify.prisma);
      await this.trialRepository.update(organizationId, id, {
        maxTrialHours: trialsSettings.freeTrialHours,
      });
    }

    const trial = await this.trialRepository.approve(organizationId, id);
    const dto = mapTrialToDto(trial);
    void notifyTrialStatusChanged(this.fastify.prisma, this.fastify.config, {
      organizationId,
      trialId: dto.id,
      status: 'APPROVED',
      candidateName: dto.candidateName,
      requestedById: dto.requestedById,
      assignedRecruiterId: dto.assignedRecruiterId,
      actedById: authUser.id,
      maxTrialHours: dto.maxTrialHours,
    });
    return dto;
  }

  async reject(
    authUser: AuthenticatedUser,
    id: number,
    input: RejectTrialInput,
  ): Promise<TrialDto> {
    const organizationId = requireOrganization(authUser);
    const existing = await this.getTrialOrThrow(organizationId, id);
    this.validateTransition(existing.status, 'REJECTED');

    const trial = await this.trialRepository.reject(organizationId, id, input);
    const dto = mapTrialToDto(trial);
    void notifyTrialStatusChanged(this.fastify.prisma, this.fastify.config, {
      organizationId,
      trialId: dto.id,
      status: 'REJECTED',
      candidateName: dto.candidateName,
      requestedById: dto.requestedById,
      assignedRecruiterId: dto.assignedRecruiterId,
      actedById: authUser.id,
    });
    return dto;
  }

  async submitFeedback(
    authUser: AuthenticatedUser,
    id: number,
    input: TrialFeedbackInput,
  ): Promise<TrialDto> {
    const organizationId = requireOrganization(authUser);
    const existing = await this.getTrialOrThrow(organizationId, id);
    if (existing.status !== 'COMPLETED') {
      this.validateTransition(existing.status, 'COMPLETED');
    }
    const trial = await this.trialRepository.submitFeedback(
      organizationId,
      id,
      input,
    );
    const dto = mapTrialToDto(trial);
    void notifyTrialStatusChanged(this.fastify.prisma, this.fastify.config, {
      organizationId,
      trialId: dto.id,
      status: 'COMPLETED',
      candidateName: dto.candidateName,
      requestedById: dto.requestedById,
      assignedRecruiterId: dto.assignedRecruiterId,
      actedById: authUser.id,
    });
    return dto;
  }

  async list(
    authUser: AuthenticatedUser,
    query: ListTrialsQuery,
  ): Promise<{
    data: TrialListItemDto[];
    meta: ReturnType<typeof buildPaginationMeta>;
  }> {
    const organizationId = requireOrganization(authUser);
    const scopedClientId = await this.resolveScopedClientId(authUser, organizationId);

    const { items, total } = await this.trialRepository.findMany({
      organizationId,
      page: query.page,
      limit: query.limit,
      sort: query.sort,
      search: query.search,
      candidateId: query.candidateId,
      clientId: scopedClientId ?? query.clientId,
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
    const scopedClientId = await this.resolveScopedClientId(authUser, organizationId);
    if (scopedClientId != null && Number(trial.clientId) !== scopedClientId) {
      throw new NotFoundError('Trial request not found');
    }
    return mapTrialToDto(trial);
  }

  private async resolveScopedClientId(
    authUser: AuthenticatedUser,
    organizationId: number,
  ): Promise<number | null> {
    if (authUser.role !== 'CLIENT') return null;

    const membership = await this.trialRepository.findClientIdForUser(
      organizationId,
      authUser.id,
      authUser.email,
    );
    if (membership == null) {
      throw new BadRequestError('Client account is not linked to this user');
    }
    return membership;
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

  private validateTransition(
    current: TrialRequestStatus,
    next: TrialRequestStatus,
  ): void {
    const transitions: Record<TrialRequestStatus, TrialRequestStatus[]> = {
      REQUESTED: ['APPROVED', 'IN_PROGRESS', 'REJECTED', 'CANCELLED'],
      APPROVED: ['IN_PROGRESS', 'REJECTED', 'CANCELLED'],
      REJECTED: [],
      IN_PROGRESS: ['COMPLETED', 'FAILED', 'CANCELLED'],
      COMPLETED: [],
      FAILED: [],
      CANCELLED: [],
    };
    if (!transitions[current].includes(next)) {
      throw new BadRequestError(`Cannot transition trial from ${current} to ${next}`);
    }
  }
}

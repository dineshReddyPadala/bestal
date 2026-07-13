import type { FastifyInstance } from 'fastify';
import type { PrismaClient } from '@prisma/client';
import type { AuthenticatedUser } from '../../types/index.js';
import {
  BadRequestError,
  NotFoundError,
  requireOrganization,
} from '../../utils/index.js';
import { buildPaginationMeta } from '../../validators/common.validator.js';
import { assertCanCreateBackgroundCheck } from '../candidates/candidate-pipeline.js';
import {
  mapBackgroundCheckToDto,
  mapBackgroundCheckToListItem,
} from './background-check.mapper.js';
import { BackgroundCheckRepository } from './background-check.repository.js';
import type {
  BackgroundCheckDto,
  BackgroundCheckListItemDto,
  CreateBackgroundCheckInput,
  UpdateBackgroundCheckInput,
} from './background-check.types.js';
import type { ListBackgroundChecksQuery } from './background-check.validator.js';

function deriveCandidateBgvProfileStatus(status: string | undefined): 'BGV_PENDING' | 'BGV_COMPLETE' {
  if (status === 'CLEAR') return 'BGV_COMPLETE';
  return 'BGV_PENDING';
}

export class BackgroundCheckService {
  private readonly backgroundCheckRepository: BackgroundCheckRepository;
  private readonly prisma: PrismaClient;

  constructor(
    fastify: FastifyInstance,
    backgroundCheckRepository?: BackgroundCheckRepository,
  ) {
    this.backgroundCheckRepository =
      backgroundCheckRepository ?? new BackgroundCheckRepository(fastify.prisma);
    this.prisma = fastify.prisma;
  }

  async create(
    authUser: AuthenticatedUser,
    input: CreateBackgroundCheckInput,
  ): Promise<BackgroundCheckDto> {
    const organizationId = requireOrganization(authUser);

    await this.validateCandidate(organizationId, input.candidateId);

    const record = await this.backgroundCheckRepository.create(
      organizationId,
      authUser.id,
      input,
    );

    await this.prisma.candidate.update({
      where: {
        id: BigInt(input.candidateId),
        organizationId: BigInt(organizationId),
      },
      data: {
        bgvStatus: input.status ?? 'PENDING',
        profileStatus: deriveCandidateBgvProfileStatus(input.status),
      },
    });

    return mapBackgroundCheckToDto(record);
  }

  async update(
    authUser: AuthenticatedUser,
    id: number,
    input: UpdateBackgroundCheckInput,
  ): Promise<BackgroundCheckDto> {
    const organizationId = requireOrganization(authUser);
    const existing = await this.getBackgroundCheckOrThrow(organizationId, id);

    const record = await this.backgroundCheckRepository.update(
      organizationId,
      id,
      input,
    );

    if (input.status) {
      await this.prisma.candidate.update({
        where: {
          id: existing.candidateId,
          organizationId: BigInt(organizationId),
        },
        data: {
          bgvStatus: input.status,
          profileStatus: deriveCandidateBgvProfileStatus(input.status),
        },
      });
    }

    return mapBackgroundCheckToDto(record);
  }

  async delete(authUser: AuthenticatedUser, id: number): Promise<void> {
    const organizationId = requireOrganization(authUser);
    await this.getBackgroundCheckOrThrow(organizationId, id);
    await this.backgroundCheckRepository.softDelete(organizationId, id);
  }

  async list(
    authUser: AuthenticatedUser,
    query: ListBackgroundChecksQuery,
  ): Promise<{
    data: BackgroundCheckListItemDto[];
    meta: ReturnType<typeof buildPaginationMeta>;
  }> {
    const organizationId = requireOrganization(authUser);

    const { items, total } = await this.backgroundCheckRepository.findMany({
      organizationId,
      page: query.page,
      limit: query.limit,
      sort: query.sort,
      candidateId: query.candidateId,
      status: query.status,
      type: query.type,
    });

    return {
      data: items.map(mapBackgroundCheckToListItem),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async getById(
    authUser: AuthenticatedUser,
    id: number,
  ): Promise<BackgroundCheckDto> {
    const organizationId = requireOrganization(authUser);
    const record = await this.getBackgroundCheckOrThrow(organizationId, id);
    return mapBackgroundCheckToDto(record);
  }

  private async getBackgroundCheckOrThrow(organizationId: number, id: number) {
    const record = await this.backgroundCheckRepository.findById(
      organizationId,
      id,
    );
    if (!record) {
      throw new NotFoundError('Background check not found');
    }
    return record;
  }

  private async validateCandidate(
    organizationId: number,
    candidateId: number,
  ): Promise<void> {
    const candidate = await this.prisma.candidate.findFirst({
      where: {
        id: BigInt(candidateId),
        organizationId: BigInt(organizationId),
        deletedAt: null,
      },
      select: {
        profileStatus: true,
        approvalStatus: true,
        visibility: true,
        resumeDocumentId: true,
        evaluationStatus: true,
        bgvStatus: true,
        clientBillRate: true,
        availabilityStatus: true,
        availableFrom: true,
        submittedForApprovalAt: true,
      },
    });

    if (!candidate) {
      throw new BadRequestError('Candidate not found');
    }

    assertCanCreateBackgroundCheck(candidate);
  }
}

import type { FastifyInstance } from 'fastify';
import { notifyJobRequestSubmitted } from '../../services/notification-events.js';
import type { AuthenticatedUser } from '../../types/index.js';
import {
  BadRequestError,
  NotFoundError,
  bigintToNumber,
  requireOrganization,
} from '../../utils/index.js';
import { buildPaginationMeta } from '../../validators/common.validator.js';
import {
  mapJobRequestToDto,
  mapJobRequestToListItem,
} from './job-request.mapper.js';
import { JobRequestRepository } from './job-request.repository.js';
import type {
  JobRequestDto,
  JobRequestListItemDto,
  UpdateJobRequestInput,
} from './job-request.types.js';
import type {
  CreatePublicJobRequestBody,
  ListJobRequestsQuery,
  UpdateJobRequestBody,
} from './job-request.validator.js';

const DEFAULT_INTAKE_ORG_SLUG = 'amnet-digital';

export class JobRequestService {
  private readonly jobRequestRepository: JobRequestRepository;
  private readonly fastify: FastifyInstance;

  constructor(fastify: FastifyInstance, jobRequestRepository?: JobRequestRepository) {
    this.fastify = fastify;
    this.jobRequestRepository =
      jobRequestRepository ?? new JobRequestRepository(fastify.prisma);
  }

  async submitPublic(input: CreatePublicJobRequestBody): Promise<{ id: number; message: string }> {
    if (input.websiteConfirm) {
      return {
        id: 0,
        message: 'Request received — our team will follow up within [FACT: SLA].',
      };
    }

    const organizationId = await this.resolvePublicIntakeOrganizationId();
    const { websiteConfirm: _honeypot, ...payload } = input;

    const record = await this.jobRequestRepository.createPublic(organizationId, payload);
    const dto = mapJobRequestToDto(record);

    void notifyJobRequestSubmitted(this.fastify.prisma, this.fastify.config, {
      organizationId,
      jobRequestId: dto.id,
      companyName: dto.companyName,
      jobTitle: dto.jobTitle,
    });

    return {
      id: dto.id,
      message: 'Request received — our team will follow up within [FACT: SLA].',
    };
  }

  async list(
    authUser: AuthenticatedUser,
    query: ListJobRequestsQuery,
  ): Promise<{
    data: JobRequestListItemDto[];
    meta: ReturnType<typeof buildPaginationMeta>;
  }> {
    const organizationId = requireOrganization(authUser);
    const { items, total } = await this.jobRequestRepository.findMany({
      organizationId,
      page: query.page,
      limit: query.limit,
      sort: query.sort,
      search: query.search,
      status: query.status,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
    });

    return {
      data: items.map(mapJobRequestToListItem),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async getById(authUser: AuthenticatedUser, id: number): Promise<JobRequestDto> {
    const organizationId = requireOrganization(authUser);
    const record = await this.getJobRequestOrThrow(organizationId, id);
    return mapJobRequestToDto(record);
  }

  async update(
    authUser: AuthenticatedUser,
    id: number,
    input: UpdateJobRequestBody,
  ): Promise<JobRequestDto> {
    const organizationId = requireOrganization(authUser);
    await this.getJobRequestOrThrow(organizationId, id);

    if (input.assignedToId != null) {
      const exists = await this.jobRequestRepository.assigneeExists(
        organizationId,
        input.assignedToId,
      );
      if (!exists) {
        throw new BadRequestError('Assigned user must be an active admin or sales member');
      }
    }

    const updateInput: UpdateJobRequestInput = {
      ...(input.status !== undefined && { status: input.status }),
      ...(input.assignedToId !== undefined && { assignedToId: input.assignedToId }),
      ...(input.internalNotes !== undefined && { internalNotes: input.internalNotes }),
    };

    const record = await this.jobRequestRepository.update(organizationId, id, updateInput);
    return mapJobRequestToDto(record);
  }

  private async getJobRequestOrThrow(organizationId: number, id: number) {
    const record = await this.jobRequestRepository.findById(organizationId, id);
    if (!record) {
      throw new NotFoundError('Job request not found');
    }
    return record;
  }

  private async resolvePublicIntakeOrganizationId(): Promise<number> {
    const org =
      (await this.fastify.prisma.organization.findFirst({
        where: { slug: DEFAULT_INTAKE_ORG_SLUG, isActive: true, deletedAt: null },
        select: { id: true },
      })) ??
      (await this.fastify.prisma.organization.findFirst({
        where: { isActive: true, deletedAt: null },
        orderBy: { id: 'asc' },
        select: { id: true },
      }));

    if (!org) {
      throw new BadRequestError('Public job intake is not configured');
    }

    return bigintToNumber(org.id);
  }
}

import type { FastifyInstance } from 'fastify';
import type { AuthenticatedUser } from '../../types/index.js';
import {
  BadRequestError,
  NotFoundError,
  requireOrganization,
} from '../../utils/index.js';
import { buildPaginationMeta } from '../../validators/common.validator.js';
import { mapInterviewToDto, mapInterviewToListItem } from './interview.mapper.js';
import { InterviewRepository } from './interview.repository.js';
import type {
  CancelInterviewInput,
  ConfirmInterviewInput,
  CreateInterviewInput,
  InterviewDto,
  InterviewListItemDto,
  UpdateInterviewInput,
} from './interview.types.js';
import type { ListInterviewsQuery } from './interview.validator.js';

export class InterviewService {
  private readonly interviewRepository: InterviewRepository;

  constructor(
    fastify: FastifyInstance,
    interviewRepository?: InterviewRepository,
  ) {
    this.interviewRepository =
      interviewRepository ?? new InterviewRepository(fastify.prisma);
  }

  async create(
    authUser: AuthenticatedUser,
    input: CreateInterviewInput,
  ): Promise<InterviewDto> {
    const organizationId = requireOrganization(authUser);

    await this.validateCandidate(organizationId, input.candidateId);
    await this.validateClient(organizationId, input.clientId);

    if (input.shortlistId) {
      await this.validateShortlist(organizationId, input.shortlistId);
    }

    const interview = await this.interviewRepository.create(
      organizationId,
      authUser.id,
      input,
    );
    return mapInterviewToDto(interview);
  }

  async update(
    authUser: AuthenticatedUser,
    id: number,
    input: UpdateInterviewInput,
  ): Promise<InterviewDto> {
    const organizationId = requireOrganization(authUser);
    await this.getInterviewOrThrow(organizationId, id);

    const interview = await this.interviewRepository.update(
      organizationId,
      id,
      input,
    );
    return mapInterviewToDto(interview);
  }

  async confirm(
    authUser: AuthenticatedUser,
    id: number,
    input: ConfirmInterviewInput,
  ): Promise<InterviewDto> {
    const organizationId = requireOrganization(authUser);
    await this.getInterviewOrThrow(organizationId, id);

    const interview = await this.interviewRepository.confirm(
      organizationId,
      id,
      input,
    );
    return mapInterviewToDto(interview);
  }

  async cancel(
    authUser: AuthenticatedUser,
    id: number,
    input: CancelInterviewInput,
  ): Promise<InterviewDto> {
    const organizationId = requireOrganization(authUser);
    await this.getInterviewOrThrow(organizationId, id);

    const interview = await this.interviewRepository.cancel(
      organizationId,
      id,
      input,
    );
    return mapInterviewToDto(interview);
  }

  async list(
    authUser: AuthenticatedUser,
    query: ListInterviewsQuery,
  ): Promise<{
    data: InterviewListItemDto[];
    meta: ReturnType<typeof buildPaginationMeta>;
  }> {
    const organizationId = requireOrganization(authUser);

    const { items, total } = await this.interviewRepository.findMany({
      organizationId,
      page: query.page,
      limit: query.limit,
      sort: query.sort,
      candidateId: query.candidateId,
      clientId: query.clientId,
      shortlistId: query.shortlistId,
      status: query.status,
      type: query.type,
    });

    return {
      data: items.map(mapInterviewToListItem),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async getById(authUser: AuthenticatedUser, id: number): Promise<InterviewDto> {
    const organizationId = requireOrganization(authUser);
    const interview = await this.getInterviewOrThrow(organizationId, id);
    return mapInterviewToDto(interview);
  }

  private async getInterviewOrThrow(organizationId: number, id: number) {
    const interview = await this.interviewRepository.findById(organizationId, id);
    if (!interview) {
      throw new NotFoundError('Interview request not found');
    }
    return interview;
  }

  private async validateCandidate(
    organizationId: number,
    candidateId: number,
  ): Promise<void> {
    const exists = await this.interviewRepository.candidateExists(
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
    const exists = await this.interviewRepository.clientExists(
      organizationId,
      clientId,
    );
    if (!exists) {
      throw new BadRequestError('Client not found');
    }
  }

  private async validateShortlist(
    organizationId: number,
    shortlistId: number,
  ): Promise<void> {
    const exists = await this.interviewRepository.shortlistExists(
      organizationId,
      shortlistId,
    );
    if (!exists) {
      throw new BadRequestError('Shortlist not found');
    }
  }
}

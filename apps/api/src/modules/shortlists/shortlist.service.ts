import type { FastifyInstance } from 'fastify';
import type { AuthenticatedUser } from '../../types/index.js';
import {
  BadRequestError,
  NotFoundError,
  requireOrganization,
} from '../../utils/index.js';
import { buildPaginationMeta } from '../../validators/common.validator.js';
import {
  mapShortlistCandidateToDto,
  mapShortlistToListItem,
  mapShortlistWithCandidatesToDto,
} from './shortlist.mapper.js';
import { ShortlistRepository } from './shortlist.repository.js';
import type {
  AddShortlistCandidateInput,
  CreateShortlistInput,
  ShortlistCandidateDto,
  ShortlistListItemDto,
  ShortlistWithCandidatesDto,
  UpdateShortlistCandidateInput,
} from './shortlist.types.js';
import type { ListShortlistsQuery } from './shortlist.validator.js';

export class ShortlistService {
  private readonly shortlistRepository: ShortlistRepository;

  constructor(
    fastify: FastifyInstance,
    shortlistRepository?: ShortlistRepository,
  ) {
    this.shortlistRepository =
      shortlistRepository ?? new ShortlistRepository(fastify.prisma);
  }

  async create(
    authUser: AuthenticatedUser,
    input: CreateShortlistInput,
  ): Promise<ShortlistWithCandidatesDto> {
    const organizationId = requireOrganization(authUser);
    const scopedClientId = await this.resolveScopedClientId(authUser, organizationId);
    const clientId = scopedClientId ?? input.clientId;
    if (scopedClientId != null && input.clientId !== scopedClientId) {
      throw new BadRequestError('Clients can only create shortlists for their own account');
    }
    await this.validateClient(organizationId, clientId);

    const shortlist = await this.shortlistRepository.create(
      organizationId,
      authUser.id,
      { ...input, clientId },
    );
    return mapShortlistWithCandidatesToDto(shortlist);
  }

  async list(
    authUser: AuthenticatedUser,
    query: ListShortlistsQuery,
  ): Promise<{
    data: ShortlistListItemDto[];
    meta: ReturnType<typeof buildPaginationMeta>;
  }> {
    const organizationId = requireOrganization(authUser);
    const scopedClientId = await this.resolveScopedClientId(authUser, organizationId);

    const { items, total } = await this.shortlistRepository.findMany({
      organizationId,
      page: query.page,
      limit: query.limit,
      sort: query.sort,
      clientId: scopedClientId ?? query.clientId,
      status: query.status,
    });

    return {
      data: items.map(mapShortlistToListItem),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async getById(
    authUser: AuthenticatedUser,
    id: number,
  ): Promise<ShortlistWithCandidatesDto> {
    const organizationId = requireOrganization(authUser);
    const shortlist = await this.getShortlistOrThrow(organizationId, id);
    await this.assertClientOwnsShortlist(authUser, organizationId, shortlist.clientId);
    return mapShortlistWithCandidatesToDto(shortlist);
  }

  async addCandidate(
    authUser: AuthenticatedUser,
    shortlistId: number,
    input: AddShortlistCandidateInput,
  ): Promise<ShortlistCandidateDto> {
    const organizationId = requireOrganization(authUser);
    const shortlist = await this.getShortlistOrThrow(organizationId, shortlistId);
    await this.assertClientOwnsShortlist(authUser, organizationId, shortlist.clientId);
    await this.validateCandidate(organizationId, input.candidateId);

    const existing = await this.shortlistRepository.findCandidateEntryIncludingDeleted(
      shortlistId,
      input.candidateId,
    );

    if (existing && !existing.deletedAt) {
      throw new BadRequestError('Candidate is already on this shortlist');
    }

    const entry = existing
      ? await this.shortlistRepository.restoreCandidate(
          Number(existing.id),
          authUser.id,
          input,
        )
      : await this.shortlistRepository.addCandidate(
          shortlistId,
          authUser.id,
          input,
        );

    return mapShortlistCandidateToDto(entry);
  }

  async removeCandidate(
    authUser: AuthenticatedUser,
    shortlistId: number,
    candidateId: number,
  ): Promise<void> {
    const organizationId = requireOrganization(authUser);
    const shortlist = await this.getShortlistOrThrow(organizationId, shortlistId);
    await this.assertClientOwnsShortlist(authUser, organizationId, shortlist.clientId);

    const entry = await this.shortlistRepository.findCandidateEntry(
      shortlistId,
      candidateId,
    );
    if (!entry) {
      throw new NotFoundError('Shortlist candidate not found');
    }

    await this.shortlistRepository.removeCandidate(shortlistId, candidateId);
  }

  async updateCandidate(
    authUser: AuthenticatedUser,
    shortlistId: number,
    candidateId: number,
    input: UpdateShortlistCandidateInput,
  ): Promise<ShortlistCandidateDto> {
    const organizationId = requireOrganization(authUser);
    const shortlist = await this.getShortlistOrThrow(organizationId, shortlistId);
    await this.assertClientOwnsShortlist(authUser, organizationId, shortlist.clientId);

    const entry = await this.shortlistRepository.findCandidateEntry(
      shortlistId,
      candidateId,
    );
    if (!entry) {
      throw new NotFoundError('Shortlist candidate not found');
    }

    const updated = await this.shortlistRepository.updateCandidate(
      shortlistId,
      candidateId,
      input,
    );
    return mapShortlistCandidateToDto(updated);
  }

  private async getShortlistOrThrow(organizationId: number, id: number) {
    const shortlist = await this.shortlistRepository.findById(organizationId, id);
    if (!shortlist) {
      throw new NotFoundError('Shortlist not found');
    }
    return shortlist;
  }

  private async resolveScopedClientId(
    authUser: AuthenticatedUser,
    organizationId: number,
  ): Promise<number | null> {
    if (authUser.role !== 'CLIENT') return null;
    const clientId = await this.shortlistRepository.findClientIdForUser(
      organizationId,
      authUser.id,
      authUser.email,
    );
    if (clientId == null) {
      throw new BadRequestError('Client account is not linked to this user');
    }
    return clientId;
  }

  private async assertClientOwnsShortlist(
    authUser: AuthenticatedUser,
    organizationId: number,
    shortlistClientId: bigint,
  ): Promise<void> {
    const scopedClientId = await this.resolveScopedClientId(authUser, organizationId);
    if (scopedClientId != null && scopedClientId !== Number(shortlistClientId)) {
      throw new NotFoundError('Shortlist not found');
    }
  }

  private async validateClient(
    organizationId: number,
    clientId: number,
  ): Promise<void> {
    const exists = await this.shortlistRepository.clientExists(
      organizationId,
      clientId,
    );
    if (!exists) {
      throw new BadRequestError('Client not found');
    }
  }

  private async validateCandidate(
    organizationId: number,
    candidateId: number,
  ): Promise<void> {
    const exists = await this.shortlistRepository.candidateExists(
      organizationId,
      candidateId,
    );
    if (!exists) {
      throw new BadRequestError('Candidate not found');
    }
  }
}

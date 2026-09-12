import type { CareerOpeningStatus } from '@prisma/client';
import type { FastifyInstance } from 'fastify';
import type { AuthenticatedUser } from '../../types/index.js';
import { NotFoundError, bigintToNumber, requireOrganization, slugify } from '../../utils/index.js';
import { buildPaginationMeta } from '../../validators/common.validator.js';
import {
  mapCareerOpeningToDto,
  mapCareerOpeningToListItem,
  mapCareerOpeningToPublicDto,
} from './career-opening.mapper.js';
import { CareerOpeningRepository } from './career-opening.repository.js';
import type {
  CareerOpeningDto,
  CareerOpeningListItemDto,
  CareerOpeningPublicDto,
  UpdateCareerOpeningInput,
} from './career-opening.types.js';
import type {
  CreateCareerOpeningBody,
  ListCareerOpeningsQuery,
  UpdateCareerOpeningBody,
} from './career-opening.validator.js';

const DEFAULT_INTAKE_ORG_SLUG = 'bestal';

export class CareerOpeningService {
  private readonly repository: CareerOpeningRepository;
  private readonly fastify: FastifyInstance;

  constructor(fastify: FastifyInstance, repository?: CareerOpeningRepository) {
    this.fastify = fastify;
    this.repository = repository ?? new CareerOpeningRepository(fastify.prisma);
  }

  async listPublished(): Promise<CareerOpeningPublicDto[]> {
    const organizationId = await this.resolvePublicOrganizationId();
    if (!organizationId) return [];
    const items = await this.repository.findPublished(organizationId);
    return items.map(mapCareerOpeningToPublicDto);
  }

  async list(
    authUser: AuthenticatedUser,
    query: ListCareerOpeningsQuery,
  ): Promise<{
    data: CareerOpeningListItemDto[];
    meta: ReturnType<typeof buildPaginationMeta>;
  }> {
    const organizationId = requireOrganization(authUser);
    const { items, total } = await this.repository.findMany({
      organizationId,
      page: query.page,
      limit: query.limit,
      sort: query.sort,
      search: query.search,
      status: query.status,
    });

    return {
      data: items.map(mapCareerOpeningToListItem),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async getById(authUser: AuthenticatedUser, id: number): Promise<CareerOpeningDto> {
    const organizationId = requireOrganization(authUser);
    const record = await this.getOrThrow(organizationId, id);
    return mapCareerOpeningToDto(record);
  }

  async create(authUser: AuthenticatedUser, input: CreateCareerOpeningBody): Promise<CareerOpeningDto> {
    const organizationId = requireOrganization(authUser);
    const slug = await this.generateUniqueSlug(input.title);
    const status = input.status;
    const record = await this.repository.create(organizationId, {
      ...input,
      slug,
      status,
      publishedAt: status === 'PUBLISHED' ? new Date() : null,
    });
    return mapCareerOpeningToDto(record);
  }

  async update(
    authUser: AuthenticatedUser,
    id: number,
    input: UpdateCareerOpeningBody,
  ): Promise<CareerOpeningDto> {
    const organizationId = requireOrganization(authUser);
    const existing = await this.getOrThrow(organizationId, id);
    const nextStatus = input.status ?? existing.status;
    const updateInput: UpdateCareerOpeningInput = {
      ...input,
      publishedAt: this.resolvePublishedAt(existing.publishedAt, existing.status, nextStatus),
    };
    const record = await this.repository.update(organizationId, id, updateInput);
    return mapCareerOpeningToDto(record);
  }

  async remove(authUser: AuthenticatedUser, id: number): Promise<void> {
    const organizationId = requireOrganization(authUser);
    await this.getOrThrow(organizationId, id);
    await this.repository.softDelete(organizationId, id);
  }

  private resolvePublishedAt(
    current: Date | null,
    previousStatus: CareerOpeningStatus,
    nextStatus: CareerOpeningStatus,
  ): Date | null | undefined {
    if (nextStatus === 'PUBLISHED' && previousStatus !== 'PUBLISHED') {
      return current ?? new Date();
    }
    return undefined;
  }

  private async generateUniqueSlug(title: string): Promise<string> {
    const base = slugify(title) || 'opening';
    let slug = base;
    let suffix = 0;
    while (await this.repository.findBySlug(slug)) {
      suffix += 1;
      slug = `${base}-${suffix}`;
    }
    return slug;
  }

  private async getOrThrow(organizationId: number, id: number) {
    const record = await this.repository.findById(organizationId, id);
    if (!record) {
      throw new NotFoundError('Career opening not found');
    }
    return record;
  }

  private async resolvePublicOrganizationId(): Promise<number | null> {
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

    return org ? bigintToNumber(org.id) : null;
  }
}

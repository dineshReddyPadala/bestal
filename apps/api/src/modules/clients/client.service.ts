import type { FastifyInstance } from 'fastify';
import type { AuthenticatedUser } from '../../types/index.js';
import {
  BadRequestError,
  NotFoundError,
  requireOrganization,
  slugify,
} from '../../utils/index.js';
import { buildPaginationMeta } from '../../validators/common.validator.js';
import { mapClientToDto, mapClientToListItem } from './client.mapper.js';
import { ClientRepository } from './client.repository.js';
import type {
  ClientDto,
  ClientListItemDto,
  CreateClientInput,
  UpdateClientInput,
} from './client.types.js';
import type { ListClientsQuery } from './client.validator.js';

export class ClientService {
  private readonly clientRepository: ClientRepository;

  constructor(fastify: FastifyInstance, clientRepository?: ClientRepository) {
    this.clientRepository =
      clientRepository ?? new ClientRepository(fastify.prisma);
  }

  async create(
    authUser: AuthenticatedUser,
    input: CreateClientInput,
  ): Promise<ClientDto> {
    const organizationId = requireOrganization(authUser);

    if (input.accountManagerId) {
      await this.validateAccountManager(input.accountManagerId);
    }

    const slug = await this.generateUniqueSlug(organizationId, input.name);
    const client = await this.clientRepository.create(organizationId, slug, input);
    return mapClientToDto(client);
  }

  async update(
    authUser: AuthenticatedUser,
    id: number,
    input: UpdateClientInput,
  ): Promise<ClientDto> {
    const organizationId = requireOrganization(authUser);
    const existing = await this.getClientOrThrow(organizationId, id);

    if (input.accountManagerId) {
      await this.validateAccountManager(input.accountManagerId);
    }

    let slug: string | undefined;
    if (input.name && input.name !== existing.name) {
      slug = await this.generateUniqueSlug(organizationId, input.name, id);
    }

    const client = await this.clientRepository.update(organizationId, id, {
      ...input,
      slug,
    });
    return mapClientToDto(client);
  }

  async delete(authUser: AuthenticatedUser, id: number): Promise<void> {
    const organizationId = requireOrganization(authUser);
    await this.getClientOrThrow(organizationId, id);
    await this.clientRepository.softDelete(organizationId, id);
  }

  async list(
    authUser: AuthenticatedUser,
    query: ListClientsQuery,
  ): Promise<{
    data: ClientListItemDto[];
    meta: ReturnType<typeof buildPaginationMeta>;
  }> {
    const organizationId = requireOrganization(authUser);

    const { items, total } = await this.clientRepository.findMany({
      organizationId,
      page: query.page,
      limit: query.limit,
      sort: query.sort,
      search: query.search,
      status: query.status,
      accountManagerId: query.accountManagerId,
    });

    return {
      data: items.map(mapClientToListItem),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async getById(authUser: AuthenticatedUser, id: number): Promise<ClientDto> {
    const organizationId = requireOrganization(authUser);
    const client = await this.getClientOrThrow(organizationId, id);
    return mapClientToDto(client);
  }

  private async getClientOrThrow(organizationId: number, id: number) {
    const client = await this.clientRepository.findById(organizationId, id);
    if (!client) {
      throw new NotFoundError('Client not found');
    }
    return client;
  }

  private async validateAccountManager(accountManagerId: number): Promise<void> {
    const exists = await this.clientRepository.accountManagerExists(
      accountManagerId,
    );
    if (!exists) {
      throw new BadRequestError('Account manager not found');
    }
  }

  private async generateUniqueSlug(
    organizationId: number,
    name: string,
    excludeId?: number,
  ): Promise<string> {
    const baseSlug = slugify(name);
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await this.clientRepository.findBySlug(organizationId, slug);
      if (!existing || (excludeId && Number(existing.id) === excludeId)) {
        return slug;
      }
      slug = `${baseSlug}-${counter}`;
      counter += 1;
    }
  }
}

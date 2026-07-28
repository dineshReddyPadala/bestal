import type { Client, Prisma, PrismaClient } from '@prisma/client';
import { BaseRepository } from '../../repositories/base.repository.js';
import type {
  ClientListFilters,
  CreateClientInput,
  UpdateClientInput,
} from './client.types.js';
import { parseSortParam } from './client.mapper.js';

const clientInclude = {
  accountManager: {
    select: { id: true, firstName: true, lastName: true },
  },
} satisfies Prisma.ClientInclude;

export type ClientRecord = Prisma.ClientGetPayload<{
  include: typeof clientInclude;
}>;

export class ClientRepository extends BaseRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  create(
    organizationId: number,
    slug: string,
    data: CreateClientInput,
  ): Promise<ClientRecord> {
    return this.prisma.client.create({
      data: {
        organizationId: BigInt(organizationId),
        slug,
        name: data.name,
        accountManagerId: data.accountManagerId
          ? BigInt(data.accountManagerId)
          : undefined,
        status: data.status,
        industry: data.industry,
        companySize: data.companySize,
        website: data.website,
        headquarters: data.headquarters,
        contactName: data.contactName,
        contactEmail: data.contactEmail?.toLowerCase() ?? data.contactEmail,
        contactPhone: data.contactPhone,
        paymentTerms: data.paymentTerms,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
        notes: data.notes,
      },
      include: clientInclude,
    });
  }

  findById(organizationId: number, id: number): Promise<ClientRecord | null> {
    return this.prisma.client.findFirst({
      where: {
        id: BigInt(id),
        organizationId: BigInt(organizationId),
        deletedAt: null,
      },
      include: clientInclude,
    });
  }

  findBySlug(organizationId: number, slug: string): Promise<Client | null> {
    return this.prisma.client.findFirst({
      where: {
        organizationId: BigInt(organizationId),
        slug,
        deletedAt: null,
      },
    });
  }

  update(
    organizationId: number,
    id: number,
    data: UpdateClientInput & { slug?: string },
  ): Promise<ClientRecord> {
    return this.prisma.client.update({
      where: {
        id: BigInt(id),
        organizationId: BigInt(organizationId),
      },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.accountManagerId !== undefined && {
          accountManagerId: data.accountManagerId
            ? BigInt(data.accountManagerId)
            : null,
        }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.industry !== undefined && { industry: data.industry }),
        ...(data.companySize !== undefined && { companySize: data.companySize }),
        ...(data.website !== undefined && { website: data.website }),
        ...(data.headquarters !== undefined && { headquarters: data.headquarters }),
        ...(data.contactName !== undefined && { contactName: data.contactName }),
        ...(data.contactEmail !== undefined && {
          contactEmail:
            data.contactEmail == null ? null : data.contactEmail.toLowerCase(),
        }),
        ...(data.contactPhone !== undefined && { contactPhone: data.contactPhone }),
        ...(data.paymentTerms !== undefined && { paymentTerms: data.paymentTerms }),
        ...(data.addressLine1 !== undefined && { addressLine1: data.addressLine1 }),
        ...(data.addressLine2 !== undefined && { addressLine2: data.addressLine2 }),
        ...(data.city !== undefined && { city: data.city }),
        ...(data.state !== undefined && { state: data.state }),
        ...(data.postalCode !== undefined && { postalCode: data.postalCode }),
        ...(data.country !== undefined && { country: data.country }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
      include: clientInclude,
    });
  }

  softDelete(organizationId: number, id: number): Promise<Client> {
    return this.prisma.client.update({
      where: {
        id: BigInt(id),
        organizationId: BigInt(organizationId),
      },
      data: { deletedAt: new Date() },
    });
  }

  async findMany(filters: ClientListFilters): Promise<{
    items: ClientRecord[];
    total: number;
  }> {
    const where = this.buildWhereClause(filters);

    const [items, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        include: clientInclude,
        orderBy: parseSortParam(filters.sort),
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      this.prisma.client.count({ where }),
    ]);

    return { items, total };
  }

  accountManagerExists(accountManagerId: number): Promise<boolean> {
    return this.prisma.user
      .findFirst({
        where: {
          id: BigInt(accountManagerId),
          deletedAt: null,
          isActive: true,
        },
        select: { id: true },
      })
      .then(Boolean);
  }

  linkUnlinkedClientMemberships(
    organizationId: number,
    clientId: number,
    contactEmail: string,
  ): Promise<{ count: number }> {
    return this.prisma.membership.updateMany({
      where: {
        organizationId: BigInt(organizationId),
        role: 'CLIENT',
        clientId: null,
        user: {
          email: contactEmail.toLowerCase(),
          deletedAt: null,
        },
      },
      data: { clientId: BigInt(clientId) },
    });
  }

  private buildWhereClause(filters: ClientListFilters): Prisma.ClientWhereInput {
    const where: Prisma.ClientWhereInput = {
      organizationId: BigInt(filters.organizationId),
      deletedAt: null,
    };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.accountManagerId) {
      where.accountManagerId = BigInt(filters.accountManagerId);
    }

    if (filters.search) {
      const term = filters.search.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { slug: { contains: term, mode: 'insensitive' } },
        { industry: { contains: term, mode: 'insensitive' } },
        { contactEmail: { contains: term, mode: 'insensitive' } },
        { city: { contains: term, mode: 'insensitive' } },
      ];
    }

    return where;
  }
}

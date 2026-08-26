import type { Prisma, PrismaClient } from '@prisma/client';
import { BaseRepository } from '../../repositories/base.repository.js';
import type {
  ContactMessageListFilters,
  CreateContactMessageInput,
  UpdateContactMessageInput,
} from './contact-message.types.js';
import { parseSortParam } from './contact-message.mapper.js';

export type ContactMessageRecord = Prisma.ContactMessageGetPayload<Record<string, never>>;

export class ContactMessageRepository extends BaseRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  create(organizationId: number, data: CreateContactMessageInput): Promise<ContactMessageRecord> {
    return this.prisma.contactMessage.create({
      data: {
        organizationId: BigInt(organizationId),
        referenceCode: data.referenceCode,
        fullName: data.fullName,
        email: data.email.toLowerCase(),
        topic: data.topic,
        message: data.message,
        status: 'SUBMITTED',
      },
    });
  }

  referenceCodeExists(referenceCode: string): Promise<boolean> {
    return this.prisma.contactMessage
      .findFirst({
        where: { referenceCode, deletedAt: null },
        select: { id: true },
      })
      .then(Boolean);
  }

  findById(organizationId: number, id: number): Promise<ContactMessageRecord | null> {
    return this.prisma.contactMessage.findFirst({
      where: {
        id: BigInt(id),
        organizationId: BigInt(organizationId),
        deletedAt: null,
      },
    });
  }

  findMany(filters: ContactMessageListFilters): Promise<{ items: ContactMessageRecord[]; total: number }> {
    const where: Prisma.ContactMessageWhereInput = {
      organizationId: BigInt(filters.organizationId),
      deletedAt: null,
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.topic ? { topic: filters.topic } : {}),
      ...(filters.dateFrom || filters.dateTo
        ? {
            createdAt: {
              ...(filters.dateFrom ? { gte: new Date(`${filters.dateFrom}T00:00:00.000Z`) } : {}),
              ...(filters.dateTo ? { lte: new Date(`${filters.dateTo}T23:59:59.999Z`) } : {}),
            },
          }
        : {}),
      ...(filters.search
        ? {
            OR: [
              { fullName: { contains: filters.search, mode: 'insensitive' } },
              { email: { contains: filters.search, mode: 'insensitive' } },
              { referenceCode: { contains: filters.search, mode: 'insensitive' } },
              { message: { contains: filters.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const orderBy = parseSortParam(filters.sort).map(({ field, direction }) => ({
      [field]: direction,
    })) as Prisma.ContactMessageOrderByWithRelationInput[];

    const skip = (filters.page - 1) * filters.limit;

    return Promise.all([
      this.prisma.contactMessage.findMany({
        where,
        orderBy,
        skip,
        take: filters.limit,
      }),
      this.prisma.contactMessage.count({ where }),
    ]).then(([items, total]) => ({ items, total }));
  }

  update(
    organizationId: number,
    id: number,
    data: UpdateContactMessageInput,
  ): Promise<ContactMessageRecord> {
    return this.prisma.contactMessage.update({
      where: {
        id: BigInt(id),
        organizationId: BigInt(organizationId),
      },
      data: {
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.internalNotes !== undefined ? { internalNotes: data.internalNotes } : {}),
      },
    });
  }
}

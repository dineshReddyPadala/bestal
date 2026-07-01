import type { Notification, Prisma, PrismaClient } from '@prisma/client';
import { BaseRepository } from '../../repositories/base.repository.js';
import type { NotificationListFilters } from './notification.types.js';
import { parseSortParam } from './notification.mapper.js';

export type NotificationRecord = Notification;

export class NotificationRepository extends BaseRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  findById(userId: number, id: number): Promise<NotificationRecord | null> {
    return this.prisma.notification.findFirst({
      where: {
        id: BigInt(id),
        userId: BigInt(userId),
        deletedAt: null,
      },
    });
  }

  markAsRead(userId: number, id: number): Promise<NotificationRecord> {
    return this.prisma.notification.update({
      where: {
        id: BigInt(id),
        userId: BigInt(userId),
      },
      data: {
        status: 'READ',
        readAt: new Date(),
      },
    });
  }

  markAllAsRead(userId: number): Promise<number> {
    return this.prisma.notification
      .updateMany({
        where: {
          userId: BigInt(userId),
          deletedAt: null,
          readAt: null,
        },
        data: {
          status: 'READ',
          readAt: new Date(),
        },
      })
      .then((result) => result.count);
  }

  async findMany(filters: NotificationListFilters): Promise<{
    items: NotificationRecord[];
    total: number;
  }> {
    const where = this.buildWhereClause(filters);

    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: parseSortParam(filters.sort),
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return { items, total };
  }

  private buildWhereClause(
    filters: NotificationListFilters,
  ): Prisma.NotificationWhereInput {
    const where: Prisma.NotificationWhereInput = {
      userId: BigInt(filters.userId),
      deletedAt: null,
    };

    if (filters.organizationId !== null) {
      where.OR = [
        { organizationId: BigInt(filters.organizationId) },
        { organizationId: null },
      ];
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.unreadOnly) {
      where.readAt = null;
    }

    return where;
  }
}

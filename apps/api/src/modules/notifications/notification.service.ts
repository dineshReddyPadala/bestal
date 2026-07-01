import type { FastifyInstance } from 'fastify';
import type { AuthenticatedUser } from '../../types/index.js';
import { NotFoundError } from '../../utils/index.js';
import { buildPaginationMeta } from '../../validators/common.validator.js';
import {
  mapNotificationToDto,
  mapNotificationToListItem,
} from './notification.mapper.js';
import { NotificationRepository } from './notification.repository.js';
import type {
  NotificationDto,
  NotificationListItemDto,
} from './notification.types.js';
import type { ListNotificationsQuery } from './notification.validator.js';

export class NotificationService {
  private readonly notificationRepository: NotificationRepository;

  constructor(
    fastify: FastifyInstance,
    notificationRepository?: NotificationRepository,
  ) {
    this.notificationRepository =
      notificationRepository ?? new NotificationRepository(fastify.prisma);
  }

  async list(
    authUser: AuthenticatedUser,
    query: ListNotificationsQuery,
  ): Promise<{
    data: NotificationListItemDto[];
    meta: ReturnType<typeof buildPaginationMeta>;
  }> {
    const { items, total } = await this.notificationRepository.findMany({
      userId: authUser.id,
      organizationId: authUser.organizationId,
      page: query.page,
      limit: query.limit,
      sort: query.sort,
      status: query.status,
      type: query.type,
      unreadOnly: query.unreadOnly,
    });

    return {
      data: items.map(mapNotificationToListItem),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async getById(authUser: AuthenticatedUser, id: number): Promise<NotificationDto> {
    const notification = await this.getNotificationOrThrow(authUser.id, id);
    return mapNotificationToDto(notification);
  }

  async markAsRead(authUser: AuthenticatedUser, id: number): Promise<NotificationDto> {
    await this.getNotificationOrThrow(authUser.id, id);
    const notification = await this.notificationRepository.markAsRead(
      authUser.id,
      id,
    );
    return mapNotificationToDto(notification);
  }

  async markAllAsRead(authUser: AuthenticatedUser): Promise<{ count: number }> {
    const count = await this.notificationRepository.markAllAsRead(authUser.id);
    return { count };
  }

  private async getNotificationOrThrow(userId: number, id: number) {
    const notification = await this.notificationRepository.findById(userId, id);
    if (!notification) {
      throw new NotFoundError('Notification not found');
    }
    return notification;
  }
}

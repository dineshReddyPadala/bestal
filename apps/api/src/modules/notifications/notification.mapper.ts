import type { Prisma } from '@prisma/client';
import { bigintToNumber } from '../../utils/index.js';
import type {
  NotificationDto,
  NotificationListItemDto,
} from './notification.types.js';
import type { NotificationRecord } from './notification.repository.js';

export function mapNotificationToDto(
  notification: NotificationRecord,
): NotificationDto {
  return {
    id: bigintToNumber(notification.id),
    organizationId: notification.organizationId
      ? bigintToNumber(notification.organizationId)
      : null,
    userId: bigintToNumber(notification.userId),
    type: notification.type,
    channel: notification.channel,
    status: notification.status,
    title: notification.title,
    body: notification.body,
    actionUrl: notification.actionUrl,
    metadata:
      notification.metadata && typeof notification.metadata === 'object'
        ? (notification.metadata as Record<string, unknown>)
        : null,
    sentAt: notification.sentAt?.toISOString() ?? null,
    readAt: notification.readAt?.toISOString() ?? null,
    failedAt: notification.failedAt?.toISOString() ?? null,
    failureReason: notification.failureReason,
    createdAt: notification.createdAt.toISOString(),
    updatedAt: notification.updatedAt.toISOString(),
  };
}

export function mapNotificationToListItem(
  notification: NotificationRecord,
): NotificationListItemDto {
  return {
    id: bigintToNumber(notification.id),
    type: notification.type,
    status: notification.status,
    title: notification.title,
    body: notification.body,
    actionUrl: notification.actionUrl,
    readAt: notification.readAt?.toISOString() ?? null,
    createdAt: notification.createdAt.toISOString(),
  };
}

export function parseSortParam(
  sort: string | undefined,
): Prisma.NotificationOrderByWithRelationInput[] {
  if (!sort) {
    return [{ updatedAt: 'desc' }];
  }

  return sort.split(',').map((field) => {
    const desc = field.startsWith('-');
    const key = desc ? field.slice(1) : field;
    const direction = desc ? 'desc' : 'asc';

    switch (key) {
      case 'status':
      case 'readAt':
      case 'createdAt':
      case 'updatedAt':
        return { [key]: direction };
      default:
        return { updatedAt: 'desc' as const };
    }
  });
}

import type {
  NotificationChannel,
  NotificationStatus,
  NotificationType,
} from '@prisma/client';

export interface NotificationDto {
  id: number;
  organizationId: number | null;
  userId: number;
  type: NotificationType;
  channel: NotificationChannel;
  status: NotificationStatus;
  title: string;
  body: string;
  actionUrl: string | null;
  metadata: Record<string, unknown> | null;
  sentAt: string | null;
  readAt: string | null;
  failedAt: string | null;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationListItemDto {
  id: number;
  type: NotificationType;
  status: NotificationStatus;
  title: string;
  body: string;
  actionUrl: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationListFilters {
  userId: number;
  organizationId: number | null;
  page: number;
  limit: number;
  sort?: string;
  status?: NotificationStatus;
  type?: NotificationType;
  unreadOnly?: boolean;
}

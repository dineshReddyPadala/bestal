import { z } from 'zod';
import { paginationMetaSchema } from '../../validators/api-responses.validator.js';

const notificationTypeEnum = z.enum([
  'SYSTEM',
  'INTERVIEW',
  'SHORTLIST',
  'TRIAL',
  'DEPLOYMENT',
  'DOCUMENT',
  'BACKGROUND_CHECK',
  'EVALUATION',
  'GENERAL',
]);

const notificationStatusEnum = z.enum([
  'PENDING',
  'SENT',
  'DELIVERED',
  'READ',
  'FAILED',
]);

export const listNotificationsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort: z
    .string()
    .regex(
      /^(-?(createdAt|updatedAt|status|readAt))(,-?(createdAt|updatedAt|status|readAt))*$/,
      'Invalid sort format',
    )
    .optional(),
  status: notificationStatusEnum.optional(),
  type: notificationTypeEnum.optional(),
  unreadOnly: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .optional()
    .transform((value) => {
      if (value === undefined) {
        return undefined;
      }
      if (typeof value === 'boolean') {
        return value;
      }
      return value === 'true';
    }),
});

export const notificationIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type ListNotificationsQuery = z.infer<typeof listNotificationsQuerySchema>;

const notificationDtoSchema = z.object({
  id: z.number(),
  organizationId: z.number().nullable(),
  userId: z.number(),
  type: z.string(),
  channel: z.string(),
  status: z.string(),
  title: z.string(),
  body: z.string(),
  actionUrl: z.string().nullable(),
  metadata: z.record(z.unknown()).nullable(),
  sentAt: z.string().nullable(),
  readAt: z.string().nullable(),
  failedAt: z.string().nullable(),
  failureReason: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const notificationResponseSchema = z.object({
  data: notificationDtoSchema,
});

export const notificationListItemSchema = z.object({
  id: z.number(),
  type: z.string(),
  status: z.string(),
  title: z.string(),
  body: z.string(),
  actionUrl: z.string().nullable(),
  readAt: z.string().nullable(),
  createdAt: z.string(),
});

export const notificationListResponseSchema = z.object({
  data: z.array(notificationListItemSchema),
  meta: paginationMetaSchema,
});

export const notificationMessageResponseSchema = z.object({
  data: z.object({
    message: z.string(),
  }),
});

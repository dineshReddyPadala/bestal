import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { authenticate } from '../../middleware/authenticate.middleware.js';
import { requirePermission } from '../../middleware/permission.middleware.js';
import { errorResponses } from '../../validators/api-responses.validator.js';
import { PERMISSIONS } from '../auth/auth.permissions.js';
import { NotificationController } from './notification.controller.js';
import { NotificationService } from './notification.service.js';
import {
  listNotificationsQuerySchema,
  notificationIdParamSchema,
  notificationListResponseSchema,
  notificationMessageResponseSchema,
  notificationResponseSchema,
} from './notification.validator.js';

export async function notificationRoutes(
  fastify: FastifyInstance,
): Promise<void> {
  const notificationService = new NotificationService(fastify);
  const notificationController = new NotificationController(notificationService);
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.get(
    '/',
    {
      preHandler: [
        authenticate,
        requirePermission(PERMISSIONS.NOTIFICATIONS_READ),
      ],
      schema: {
        tags: ['Notifications'],
        summary: "List current user's notifications",
        security: [{ bearerAuth: [] }],
        querystring: listNotificationsQuerySchema,
        response: {
          200: notificationListResponseSchema,
          401: errorResponses[401],
          422: errorResponses[422],
        },
      },
    },
    notificationController.list,
  );

  app.get(
    '/:id',
    {
      preHandler: [
        authenticate,
        requirePermission(PERMISSIONS.NOTIFICATIONS_READ),
      ],
      schema: {
        tags: ['Notifications'],
        summary: 'Get notification details by ID',
        security: [{ bearerAuth: [] }],
        params: notificationIdParamSchema,
        response: {
          200: notificationResponseSchema,
          401: errorResponses[401],
          404: errorResponses[404],
          422: errorResponses[422],
        },
      },
    },
    notificationController.getById,
  );

  app.patch(
    '/:id/read',
    {
      preHandler: [
        authenticate,
        requirePermission(PERMISSIONS.NOTIFICATIONS_READ),
      ],
      schema: {
        tags: ['Notifications'],
        summary: 'Mark notification as read',
        security: [{ bearerAuth: [] }],
        params: notificationIdParamSchema,
        response: {
          200: notificationResponseSchema,
          401: errorResponses[401],
          404: errorResponses[404],
          422: errorResponses[422],
        },
      },
    },
    notificationController.markAsRead,
  );

  app.post(
    '/read-all',
    {
      preHandler: [
        authenticate,
        requirePermission(PERMISSIONS.NOTIFICATIONS_READ),
      ],
      schema: {
        tags: ['Notifications'],
        summary: 'Mark all notifications as read',
        security: [{ bearerAuth: [] }],
        response: {
          200: notificationMessageResponseSchema,
          401: errorResponses[401],
        },
      },
    },
    notificationController.markAllAsRead,
  );
}

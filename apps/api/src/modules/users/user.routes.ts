import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { authenticate } from '../../middleware/authenticate.middleware.js';
import { requirePermission } from '../../middleware/permission.middleware.js';
import { errorResponses } from '../../validators/api-responses.validator.js';
import { PERMISSIONS } from '../auth/auth.permissions.js';
import { UserController } from './user.controller.js';
import { UserService } from './user.service.js';
import {
  bulkInviteBodySchema,
  bulkInviteResponseSchema,
  createUserBodySchema,
  listUsersQuerySchema,
  userListResponseSchema,
  userResponseSchema,
} from './user.validator.js';

export async function userRoutes(fastify: FastifyInstance): Promise<void> {
  const userService = new UserService(fastify);
  const userController = new UserController(userService);
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.get(
    '/',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.USERS_READ)],
      schema: {
        tags: ['Users'],
        summary: 'List organization users',
        security: [{ bearerAuth: [] }],
        querystring: listUsersQuerySchema,
        response: {
          200: userListResponseSchema,
          401: errorResponses[401],
          422: errorResponses[422],
        },
      },
    },
    userController.list,
  );

  app.post(
    '/',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.USERS_WRITE)],
      schema: {
        tags: ['Users'],
        summary: 'Invite a user and email credentials',
        security: [{ bearerAuth: [] }],
        body: createUserBodySchema,
        response: {
          201: userResponseSchema,
          401: errorResponses[401],
          409: errorResponses[409],
          422: errorResponses[422],
        },
      },
    },
    userController.invite,
  );

  app.post(
    '/bulk',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.USERS_WRITE)],
      schema: {
        tags: ['Users'],
        summary: 'Bulk invite users (Sales / Recruiter) and email credentials',
        security: [{ bearerAuth: [] }],
        body: bulkInviteBodySchema,
        response: {
          200: bulkInviteResponseSchema,
          401: errorResponses[401],
          422: errorResponses[422],
        },
      },
    },
    userController.inviteBulk,
  );
}

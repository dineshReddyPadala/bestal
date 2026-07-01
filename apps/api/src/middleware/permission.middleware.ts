import type { FastifyReply, FastifyRequest } from 'fastify';
import { AuthorizationError } from '../utils/index.js';
import {
  roleHasAllPermissions,
  roleHasAnyPermission,
  type Permission,
} from '../modules/auth/auth.permissions.js';

export function requirePermission(...permissions: Permission[]) {
  return async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
    if (!request.authUser) {
      throw new AuthorizationError('User context not found');
    }

    if (permissions.length === 0) {
      return;
    }

    if (!roleHasAllPermissions(request.authUser.role, permissions)) {
      throw new AuthorizationError(
        `Missing required permission(s): ${permissions.join(', ')}`,
      );
    }
  };
}

export function requireAnyPermission(...permissions: Permission[]) {
  return async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
    if (!request.authUser) {
      throw new AuthorizationError('User context not found');
    }

    if (permissions.length === 0) {
      return;
    }

    if (!roleHasAnyPermission(request.authUser.role, permissions)) {
      throw new AuthorizationError(
        `Requires one of: ${permissions.join(', ')}`,
      );
    }
  };
}

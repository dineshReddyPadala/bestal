import type { FastifyReply, FastifyRequest } from 'fastify';
import { AuthorizationError } from '../utils/index.js';
import { resolvePermissionsForMembership } from '../modules/admin/admin-roles.service.js';
import type { Permission } from '../modules/auth/auth.permissions.js';

export function requirePermission(...permissions: Permission[]) {
  return async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
    if (!request.authUser) {
      throw new AuthorizationError('User context not found');
    }

    if (permissions.length === 0) {
      return;
    }

    const effective = await resolvePermissionsForMembership(
      request.server.prisma,
      request.authUser.role,
      null,
    );
    const missing = permissions.filter((p) => !effective.includes(p));
    if (missing.length > 0) {
      throw new AuthorizationError(
        `Missing required permission(s): ${missing.join(', ')}`,
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

    const effective = await resolvePermissionsForMembership(
      request.server.prisma,
      request.authUser.role,
      null,
    );
    if (!permissions.some((p) => effective.includes(p))) {
      throw new AuthorizationError(
        `Requires one of: ${permissions.join(', ')}`,
      );
    }
  };
}

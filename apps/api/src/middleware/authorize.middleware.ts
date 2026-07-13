import type { FastifyReply, FastifyRequest } from 'fastify';
import type { Role } from '../constants/index.js';
import { AuthorizationError } from '../utils/index.js';

export function authorize(...allowedRoles: Role[]) {
  return async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
    if (!request.authUser) {
      throw new AuthorizationError('User context not found');
    }

    if (allowedRoles.length === 0) {
      return;
    }

    if (!allowedRoles.includes(request.authUser.role)) {
      throw new AuthorizationError(
        `Role '${request.authUser.role}' is not authorized for this action`,
      );
    }
  };
}

export function authorizePortal(expectedPortal: string) {
  return async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
    if (!request.authUser) {
      throw new AuthorizationError('User context not found');
    }

    if (request.authUser.portal !== expectedPortal) {
      throw new AuthorizationError(
        `Portal '${request.authUser.portal}' is not authorized for this route`,
      );
    }
  };
}

/** Shorthand guards for the four BesTal roles. */
export const requireAdmin = authorize('SUPER_ADMIN', 'ADMIN');
export const requireRecruiter = authorize('RECRUITER');
export const requireSales = authorize('SALES');
export const requireClient = authorize('CLIENT');

export const requireStaff = authorize('SUPER_ADMIN', 'ADMIN', 'RECRUITER', 'SALES');

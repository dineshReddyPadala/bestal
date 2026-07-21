import type { FastifyRequest } from 'fastify';
import { authenticate } from '../../middleware/authenticate.middleware.js';
import { requirePermission } from '../../middleware/permission.middleware.js';
import { PERMISSIONS } from '../auth/auth.permissions.js';

/** Super Admin only — uses existing ADMIN_PLATFORM permission. */
export const requireSuperAdmin = [
  authenticate,
  requirePermission(PERMISSIONS.ADMIN_PLATFORM),
] as const;

export function requestAuditContext(request: FastifyRequest): {
  ipAddress: string | null;
  userAgent: string | null;
} {
  return {
    ipAddress: request.ip ?? null,
    userAgent:
      typeof request.headers['user-agent'] === 'string'
        ? request.headers['user-agent'].slice(0, 500)
        : null,
  };
}

import { ROLES, type Role } from '../constants/index.js';

export function rolePortalLoginPath(role: Role | string | null | undefined): string {
  switch (role) {
    case ROLES.RECRUITER:
      return '/recruiter/login';
    case ROLES.SALES:
      return '/sales/login';
    case ROLES.CLIENT:
      return '/login/client';
    case ROLES.SUPER_ADMIN:
    case ROLES.ADMIN:
    case ROLES.VIEWER:
    default:
      return '/admin/login';
  }
}

export function rolePasswordResetPath(role: Role | string | null | undefined): string {
  switch (role) {
    case ROLES.RECRUITER:
      return '/recruiter/reset-password';
    case ROLES.SALES:
      return '/sales/reset-password';
    case ROLES.CLIENT:
      return '/client/reset-password';
    case ROLES.SUPER_ADMIN:
    case ROLES.ADMIN:
    case ROLES.VIEWER:
    default:
      return '/admin/reset-password';
  }
}

export function rolePortalEmailLabel(role: Role | string | null | undefined): string {
  switch (role) {
    case ROLES.RECRUITER:
      return 'Recruiter Portal';
    case ROLES.SALES:
      return 'Sales Portal';
    case ROLES.CLIENT:
      return 'Client Portal';
    case ROLES.SUPER_ADMIN:
    case ROLES.ADMIN:
    case ROLES.VIEWER:
    default:
      return 'Admin Portal';
  }
}

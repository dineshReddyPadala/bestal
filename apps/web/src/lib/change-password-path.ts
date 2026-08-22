import type { Portal, Role } from './api/types';

export function getChangePasswordPath(portal: Portal, role?: Role): string {
  if (role === 'SUPER_ADMIN') {
    return '/admin/change-password';
  }

  switch (portal) {
    case 'ADMIN':
      return '/admin/change-password';
    case 'RECRUITER':
      return '/recruiter/change-password';
    case 'SALES':
      return '/sales/change-password';
    case 'CLIENT':
      return '/client/change-password';
    default:
      return '/admin/change-password';
  }
}

export function isChangePasswordPath(pathname: string): boolean {
  return pathname.endsWith('/change-password');
}

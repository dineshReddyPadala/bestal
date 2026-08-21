/**
 * User-friendly labels for platform permission keys.
 * Keys must stay aligned with apps/api auth.permissions / ALL_PERMISSIONS.
 */

export const PERMISSION_LABELS: Record<string, string> = {
  'auth:me': 'View own profile',
  'auth:change_password': 'Change own password',
  'users:read': 'View users',
  'users:write': 'Create and update users',
  'users:delete': 'Delete users',
  'org:read': 'View organization',
  'org:write': 'Manage organization',
  'admin:platform': 'Platform administration',
  'audit:read': 'View audit logs',
  'clients:read': 'View clients',
  'clients:write': 'Create and update clients',
  'clients:delete': 'Delete clients',
  'candidates:read': 'View candidates',
  'candidates:write': 'Create and update candidates',
  'candidates:edit_limited': 'Edit candidates (limited)',
  'candidates:delete': 'Delete candidates',
  'candidates:approve': 'Approve and publish candidates',
  'candidates:view_pay_rate': 'View candidate pay rates',
  'skills:read': 'View skills',
  'skills:write': 'Manage skills',
  'evaluations:read': 'View evaluations',
  'evaluations:write': 'Create and update evaluations',
  'background_checks:read': 'View background checks',
  'background_checks:write': 'Manage background checks',
  'background_checks:approve': 'Approve background checks',
  'shortlists:read': 'View shortlists',
  'shortlists:write': 'Manage shortlists',
  'trials:read': 'View trials',
  'trials:write': 'Manage trials',
  'job-requests:read': 'View client enquiries',
  'job-requests:write': 'Manage client enquiries',
  'deployments:read': 'View deployments',
  'deployments:write': 'Manage deployments',
  'deployments:request': 'Request deployments',
  'sales:pipeline:read': 'View sales pipeline',
  'sales:pipeline:write': 'Manage sales pipeline',
  'sales:reports:read': 'View sales reports',
  'documents:read': 'View documents',
  'documents:write': 'Upload and manage documents',
  'notifications:read': 'View notifications',
};

export function permissionLabel(permission: string): string {
  return (
    PERMISSION_LABELS[permission] ??
    permission
      .split(':')
      .map((part) => part.replace(/_/g, ' '))
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' · ')
  );
}

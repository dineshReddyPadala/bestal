/**
 * Frontend mirror of apps/api auth.permissions + roles.
 * Used for Role Management and Permission Matrix in Super Admin.
 * Runtime authorization still comes from the API.
 */

export const PLATFORM_ROLES = [
  'SUPER_ADMIN',
  'ADMIN',
  'RECRUITER',
  'SALES',
  'CLIENT',
  'VIEWER',
] as const;

export type PlatformRole = (typeof PLATFORM_ROLES)[number];

export const ROLE_META: Record<
  PlatformRole,
  {
    label: string;
    description: string;
    protected: boolean;
    configurable: boolean;
    portal: string;
  }
> = {
  SUPER_ADMIN: {
    label: 'Super Admin',
    description: 'Full platform access including platform settings and user provisioning.',
    protected: true,
    configurable: false,
    portal: 'Admin',
  },
  ADMIN: {
    label: 'Admin',
    description: 'Daily platform operations: candidates, evaluations, BGV, clients, trials.',
    protected: false,
    configurable: true,
    portal: 'Admin',
  },
  RECRUITER: {
    label: 'Recruiter',
    description: 'Candidate pipeline, evaluations, BGV, and shortlists.',
    protected: false,
    configurable: true,
    portal: 'Recruiter',
  },
  SALES: {
    label: 'Sales',
    description: 'Client accounts, trials, deployments, and margin tracking.',
    protected: false,
    configurable: true,
    portal: 'Sales',
  },
  CLIENT: {
    label: 'Client',
    description: 'Review shortlists, request trials, and view deployments.',
    protected: false,
    configurable: true,
    portal: 'Client',
  },
  VIEWER: {
    label: 'Viewer',
    description: 'Read-only access across platform modules.',
    protected: false,
    configurable: true,
    portal: 'Admin',
  },
};

export const ALL_PERMISSIONS = [
  'auth:me',
  'auth:change_password',
  'users:read',
  'users:write',
  'users:delete',
  'org:read',
  'org:write',
  'admin:platform',
  'audit:read',
  'clients:read',
  'clients:write',
  'clients:delete',
  'candidates:read',
  'candidates:write',
  'candidates:edit_limited',
  'candidates:delete',
  'candidates:approve',
  'candidates:view_pay_rate',
  'skills:read',
  'skills:write',
  'evaluations:read',
  'evaluations:write',
  'background_checks:read',
  'background_checks:write',
  'background_checks:approve',
  'shortlists:read',
  'shortlists:write',
  'trials:read',
  'trials:write',
  'deployments:read',
  'deployments:write',
  'sales:pipeline:read',
  'sales:pipeline:write',
  'sales:reports:read',
  'documents:read',
  'documents:write',
  'notifications:read',
] as const;

export type PlatformPermission = (typeof ALL_PERMISSIONS)[number];

export const PERMISSION_GROUPS: Array<{
  id: string;
  label: string;
  permissions: PlatformPermission[];
}> = [
  {
    id: 'auth',
    label: 'Auth & users',
    permissions: [
      'auth:me',
      'auth:change_password',
      'users:read',
      'users:write',
      'users:delete',
    ],
  },
  {
    id: 'platform',
    label: 'Platform & audit',
    permissions: ['org:read', 'org:write', 'admin:platform', 'audit:read'],
  },
  {
    id: 'clients',
    label: 'Clients',
    permissions: ['clients:read', 'clients:write', 'clients:delete'],
  },
  {
    id: 'candidates',
    label: 'Candidates & skills',
    permissions: [
      'candidates:read',
      'candidates:write',
      'candidates:edit_limited',
      'candidates:delete',
      'candidates:approve',
      'candidates:view_pay_rate',
      'skills:read',
      'skills:write',
    ],
  },
  {
    id: 'workflow',
    label: 'Recruiting workflow',
    permissions: [
      'evaluations:read',
      'evaluations:write',
      'background_checks:read',
      'background_checks:write',
      'background_checks:approve',
      'shortlists:read',
      'shortlists:write',
      'trials:read',
      'trials:write',
      'deployments:read',
      'deployments:write',
    ],
  },
  {
    id: 'sales',
    label: 'Sales',
    permissions: ['sales:pipeline:read', 'sales:pipeline:write', 'sales:reports:read'],
  },
  {
    id: 'docs',
    label: 'Documents & notifications',
    permissions: ['documents:read', 'documents:write', 'notifications:read'],
  },
];

const ALL = [...ALL_PERMISSIONS];

const ORG_ADMIN = ALL.filter((p) => p !== 'admin:platform');

const RECRUITER: PlatformPermission[] = [
  'auth:me',
  'auth:change_password',
  'org:read',
  'clients:read',
  'candidates:read',
  'candidates:write',
  'candidates:delete',
  'skills:read',
  'skills:write',
  'evaluations:read',
  'evaluations:write',
  'background_checks:read',
  'background_checks:write',
  'shortlists:read',
  'shortlists:write',
  'trials:read',
  'trials:write',
  'deployments:read',
  'deployments:write',
  'documents:read',
  'documents:write',
  'notifications:read',
];

const SALES: PlatformPermission[] = [
  'auth:me',
  'auth:change_password',
  'org:read',
  'clients:read',
  'clients:write',
  'candidates:read',
  'candidates:edit_limited',
  'candidates:view_pay_rate',
  'skills:read',
  'shortlists:read',
  'shortlists:write',
  'trials:read',
  'trials:write',
  'deployments:read',
  'deployments:write',
  'sales:pipeline:read',
  'sales:pipeline:write',
  'sales:reports:read',
  'background_checks:read',
  'documents:read',
  'documents:write',
  'notifications:read',
];

const CLIENT: PlatformPermission[] = [
  'auth:me',
  'auth:change_password',
  'org:read',
  'candidates:read',
  'shortlists:read',
  'shortlists:write',
  'trials:read',
  'trials:write',
  'deployments:read',
  'documents:read',
  'notifications:read',
];

const VIEWER: PlatformPermission[] = [
  'auth:me',
  'auth:change_password',
  'org:read',
  'users:read',
  'clients:read',
  'candidates:read',
  'skills:read',
  'evaluations:read',
  'background_checks:read',
  'shortlists:read',
  'trials:read',
  'deployments:read',
  'sales:reports:read',
  'documents:read',
  'notifications:read',
  'audit:read',
];

export const ROLE_PERMISSIONS: Record<PlatformRole, readonly PlatformPermission[]> = {
  SUPER_ADMIN: ALL,
  ADMIN: ORG_ADMIN,
  RECRUITER,
  SALES,
  CLIENT,
  VIEWER,
};

export function roleHasPermission(role: PlatformRole, permission: PlatformPermission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function isPlatformRole(value: string): value is PlatformRole {
  return (PLATFORM_ROLES as readonly string[]).includes(value);
}

export function permissionLabel(permission: string): string {
  return permission
    .split(':')
    .map((part) => part.replace(/_/g, ' '))
    .join(' · ');
}

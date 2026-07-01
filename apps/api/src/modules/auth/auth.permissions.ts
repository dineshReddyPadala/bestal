import { ROLES, type Role } from '../../constants/index.js';

export const PERMISSIONS = {
  // Auth & users
  AUTH_ME: 'auth:me',
  AUTH_CHANGE_PASSWORD: 'auth:change_password',
  USERS_READ: 'users:read',
  USERS_WRITE: 'users:write',
  USERS_DELETE: 'users:delete',

  // Organization & admin
  ORG_READ: 'org:read',
  ORG_WRITE: 'org:write',
  ADMIN_PLATFORM: 'admin:platform',
  AUDIT_READ: 'audit:read',

  // Clients
  CLIENTS_READ: 'clients:read',
  CLIENTS_WRITE: 'clients:write',
  CLIENTS_DELETE: 'clients:delete',

  // Candidates & talent
  CANDIDATES_READ: 'candidates:read',
  CANDIDATES_WRITE: 'candidates:write',
  CANDIDATES_DELETE: 'candidates:delete',
  CANDIDATES_APPROVE: 'candidates:approve',
  SKILLS_READ: 'skills:read',
  SKILLS_WRITE: 'skills:write',

  // Recruiting workflow
  EVALUATIONS_READ: 'evaluations:read',
  EVALUATIONS_WRITE: 'evaluations:write',
  BACKGROUND_CHECKS_READ: 'background_checks:read',
  BACKGROUND_CHECKS_WRITE: 'background_checks:write',
  SHORTLISTS_READ: 'shortlists:read',
  SHORTLISTS_WRITE: 'shortlists:write',
  INTERVIEWS_READ: 'interviews:read',
  INTERVIEWS_WRITE: 'interviews:write',
  TRIALS_READ: 'trials:read',
  TRIALS_WRITE: 'trials:write',
  DEPLOYMENTS_READ: 'deployments:read',
  DEPLOYMENTS_WRITE: 'deployments:write',

  // Sales
  SALES_PIPELINE_READ: 'sales:pipeline:read',
  SALES_PIPELINE_WRITE: 'sales:pipeline:write',
  SALES_REPORTS_READ: 'sales:reports:read',

  // Documents & notifications
  DOCUMENTS_READ: 'documents:read',
  DOCUMENTS_WRITE: 'documents:write',
  NOTIFICATIONS_READ: 'notifications:read',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const ALL_PERMISSIONS = Object.values(PERMISSIONS);

const RECRUITER_PERMISSIONS: Permission[] = [
  PERMISSIONS.AUTH_ME,
  PERMISSIONS.AUTH_CHANGE_PASSWORD,
  PERMISSIONS.ORG_READ,
  PERMISSIONS.CLIENTS_READ,
  PERMISSIONS.CANDIDATES_READ,
  PERMISSIONS.CANDIDATES_WRITE,
  PERMISSIONS.CANDIDATES_DELETE,
  PERMISSIONS.SKILLS_READ,
  PERMISSIONS.SKILLS_WRITE,
  PERMISSIONS.EVALUATIONS_READ,
  PERMISSIONS.EVALUATIONS_WRITE,
  PERMISSIONS.BACKGROUND_CHECKS_READ,
  PERMISSIONS.BACKGROUND_CHECKS_WRITE,
  PERMISSIONS.SHORTLISTS_READ,
  PERMISSIONS.SHORTLISTS_WRITE,
  PERMISSIONS.INTERVIEWS_READ,
  PERMISSIONS.INTERVIEWS_WRITE,
  PERMISSIONS.TRIALS_READ,
  PERMISSIONS.TRIALS_WRITE,
  PERMISSIONS.DEPLOYMENTS_READ,
  PERMISSIONS.DEPLOYMENTS_WRITE,
  PERMISSIONS.DOCUMENTS_READ,
  PERMISSIONS.DOCUMENTS_WRITE,
  PERMISSIONS.NOTIFICATIONS_READ,
];

const SALES_PERMISSIONS: Permission[] = [
  PERMISSIONS.AUTH_ME,
  PERMISSIONS.AUTH_CHANGE_PASSWORD,
  PERMISSIONS.ORG_READ,
  PERMISSIONS.CLIENTS_READ,
  PERMISSIONS.CLIENTS_WRITE,
  PERMISSIONS.CANDIDATES_READ,
  PERMISSIONS.SKILLS_READ,
  PERMISSIONS.SHORTLISTS_READ,
  PERMISSIONS.INTERVIEWS_READ,
  PERMISSIONS.TRIALS_READ,
  PERMISSIONS.DEPLOYMENTS_READ,
  PERMISSIONS.SALES_PIPELINE_READ,
  PERMISSIONS.SALES_PIPELINE_WRITE,
  PERMISSIONS.SALES_REPORTS_READ,
  PERMISSIONS.DOCUMENTS_READ,
  PERMISSIONS.DOCUMENTS_WRITE,
  PERMISSIONS.NOTIFICATIONS_READ,
];

const CLIENT_PERMISSIONS: Permission[] = [
  PERMISSIONS.AUTH_ME,
  PERMISSIONS.AUTH_CHANGE_PASSWORD,
  PERMISSIONS.ORG_READ,
  PERMISSIONS.CANDIDATES_READ,
  PERMISSIONS.SHORTLISTS_READ,
  PERMISSIONS.INTERVIEWS_READ,
  PERMISSIONS.INTERVIEWS_WRITE,
  PERMISSIONS.TRIALS_READ,
  PERMISSIONS.DEPLOYMENTS_READ,
  PERMISSIONS.DOCUMENTS_READ,
  PERMISSIONS.NOTIFICATIONS_READ,
];

export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  [ROLES.ADMIN]: ALL_PERMISSIONS,
  [ROLES.RECRUITER]: RECRUITER_PERMISSIONS,
  [ROLES.SALES]: SALES_PERMISSIONS,
  [ROLES.CLIENT]: CLIENT_PERMISSIONS,
};

export function getPermissionsForRole(role: Role): readonly Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function roleHasPermission(role: Role, permission: Permission): boolean {
  const permissions = getPermissionsForRole(role);
  return permissions.includes(permission);
}

export function roleHasAnyPermission(
  role: Role,
  permissions: Permission[],
): boolean {
  return permissions.some((permission) => roleHasPermission(role, permission));
}

export function roleHasAllPermissions(
  role: Role,
  permissions: Permission[],
): boolean {
  return permissions.every((permission) => roleHasPermission(role, permission));
}

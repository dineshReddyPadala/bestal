export const ROLES = {
  ADMIN: 'ADMIN',
  RECRUITER: 'RECRUITER',
  SALES: 'SALES',
  CLIENT: 'CLIENT',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const PORTALS = {
  ADMIN: 'ADMIN',
  RECRUITER: 'RECRUITER',
  SALES: 'SALES',
  CLIENT: 'CLIENT',
} as const;

export type Portal = (typeof PORTALS)[keyof typeof PORTALS];

/** Maps each portal to the role required to log in through it. */
export const PORTAL_ROLE: Record<Portal, Role> = {
  [PORTALS.ADMIN]: ROLES.ADMIN,
  [PORTALS.RECRUITER]: ROLES.RECRUITER,
  [PORTALS.SALES]: ROLES.SALES,
  [PORTALS.CLIENT]: ROLES.CLIENT,
};

export const ROLE_PORTAL: Record<Role, Portal> = {
  [ROLES.ADMIN]: PORTALS.ADMIN,
  [ROLES.RECRUITER]: PORTALS.RECRUITER,
  [ROLES.SALES]: PORTALS.SALES,
  [ROLES.CLIENT]: PORTALS.CLIENT,
};

export const API_PREFIX = '/api/v1';

export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  BAD_REQUEST: 'BAD_REQUEST',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

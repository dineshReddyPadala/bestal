import type { Role, Portal } from '../../constants/index.js';
import type { Permission } from './auth.permissions.js';
import type { TokenPair } from '../../interfaces/index.js';

export interface AuthTokenResponse extends TokenPair {
  tokenType: 'Bearer';
}

export interface AuthUserProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  organizationId: number | null;
  organizationName: string | null;
  clientId: number | null;
  clientName: string | null;
  role: Role;
  portal: Portal;
  permissions: Permission[];
  lastLoginAt: string | null;
}

export interface ForgotPasswordResult {
  message: string;
  resetToken?: string;
}

export interface SessionContext {
  id: number;
  email: string;
  organizationId: number | null;
  role: Role;
  portal: Portal;
}

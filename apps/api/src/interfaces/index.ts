import type { Role, Portal } from '../constants/index.js';
import type { EntityId } from '../types/index.js';

export interface JwtAccessPayload {
  sub: EntityId;
  email: string;
  organizationId: EntityId | null;
  role: Role;
  portal: Portal;
}

export interface JwtRefreshPayload {
  sub: EntityId;
  tokenId: EntityId;
  type: 'refresh';
  organizationId: EntityId | null;
  role: Role;
  portal: Portal;
}

export interface IBaseRepository {
  disconnect(): Promise<void>;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

import type { Role, Portal } from '../constants/index.js';

export type EntityId = number;

export interface AuthenticatedUser {
  id: EntityId;
  email: string;
  organizationId: EntityId | null;
  role: Role;
  portal: Portal;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiSuccessResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export interface ProblemDetail {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  code?: string;
  errors?: Array<{ field: string; message: string }>;
}

export interface HealthCheckResponse {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  uptime: number;
  version: string;
  services: {
    database: 'up' | 'down';
  };
}

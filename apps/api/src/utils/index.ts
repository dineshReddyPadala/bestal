import { ERROR_CODES, HTTP_STATUS } from '../constants/index.js';
import type { ErrorCode } from '../constants/index.js';
import type { AuthenticatedUser } from '../types/index.js';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly isOperational: boolean;
  public readonly errors?: Array<{ field: string; message: string }>;

  constructor(
    message: string,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    code: ErrorCode = ERROR_CODES.INTERNAL_ERROR,
    errors?: Array<{ field: string; message: string }>,
    isOperational = true,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(
    message = 'Validation failed',
    errors?: Array<{ field: string; message: string }>,
  ) {
    super(
      message,
      HTTP_STATUS.UNPROCESSABLE_ENTITY,
      ERROR_CODES.VALIDATION_ERROR,
      errors,
    );
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.AUTHENTICATION_ERROR);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, HTTP_STATUS.FORBIDDEN, ERROR_CODES.AUTHORIZATION_ERROR);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, HTTP_STATUS.CONFLICT, ERROR_CODES.CONFLICT);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request') {
    super(message, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.BAD_REQUEST);
  }
}

export class ExternalServiceError extends AppError {
  constructor(message = 'External service error', isOperational = true) {
    super(
      message,
      HTTP_STATUS.BAD_GATEWAY,
      ERROR_CODES.EXTERNAL_SERVICE_ERROR,
      undefined,
      isOperational,
    );
  }
}

export function bigintToNumber(value: bigint): number {
  const num = Number(value);
  if (!Number.isSafeInteger(num)) {
    throw new Error(`BigInt value ${value.toString()} exceeds safe integer range`);
  }
  return num;
}

export function createRequestId(): string {
  return crypto.randomUUID();
}

export function hashToken(token: string): Promise<string> {
  return crypto.subtle
    .digest('SHA-256', new TextEncoder().encode(token))
    .then((buffer) =>
      Array.from(new Uint8Array(buffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join(''),
    );
}

export function parseDurationToMs(duration: string): number {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error(`Invalid duration format: ${duration}`);
  }

  const value = Number(match[1]);
  const unit = match[2];

  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return value * multipliers[unit]!;
}

export function requireOrganization(authUser: AuthenticatedUser): number {
  if (!authUser.organizationId) {
    throw new AuthorizationError('Organization context is required');
  }
  return authUser.organizationId;
}

export function requireUserId(authUser: AuthenticatedUser): number {
  return authUser.id;
}

export { slugify } from './slug.js';

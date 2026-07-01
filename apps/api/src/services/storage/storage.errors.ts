import { ERROR_CODES, HTTP_STATUS } from '../../constants/index.js';
import { AppError, ExternalServiceError } from '../../utils/index.js';

export class StorageError extends AppError {
  constructor(message: string, statusCode = HTTP_STATUS.BAD_REQUEST) {
    super(message, statusCode, ERROR_CODES.BAD_REQUEST);
  }
}

export class S3StorageError extends ExternalServiceError {
  public readonly awsErrorCode?: string;

  constructor(message: string, awsErrorCode?: string) {
    super(message);
    this.name = 'S3StorageError';
    this.awsErrorCode = awsErrorCode;
  }
}

export function mapAwsError(error: unknown, operation: string): S3StorageError {
  if (error instanceof S3StorageError) {
    return error;
  }

  const err = error as {
    name?: string;
    Code?: string;
    message?: string;
    $metadata?: { httpStatusCode?: number };
  };

  const code = err.Code ?? err.name ?? 'Unknown';
  const message = err.message ?? 'Unknown AWS S3 error';

  switch (code) {
    case 'NoSuchKey':
    case 'NotFound':
      return new S3StorageError(`S3 object not found during ${operation}`, code);
    case 'AccessDenied':
      return new S3StorageError(`S3 access denied during ${operation}`, code);
    case 'EntityTooLarge':
      return new S3StorageError(`File exceeds S3 size limit during ${operation}`, code);
    case 'InvalidRequest':
    case 'InvalidArgument':
      return new S3StorageError(`Invalid S3 request during ${operation}: ${message}`, code);
    default:
      return new S3StorageError(`S3 ${operation} failed: ${message}`, code);
  }
}

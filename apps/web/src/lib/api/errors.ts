import { ApiError } from './types';

export function getApiErrorMessage(error: unknown, fallback = 'Request failed'): string {
  if (error instanceof ApiError) {
    if (error.detail?.errors?.length) {
      return error.detail.errors.map((entry) => entry.message).join('. ');
    }
    return error.message;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

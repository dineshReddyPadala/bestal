import { BadRequestError } from '../../utils/index.js';
import {
  UPLOAD_CATEGORIES,
  UPLOAD_CATEGORY_CONFIG,
  type UploadCategory,
} from './storage.constants.js';
import { StorageError } from './storage.errors.js';

export interface FileValidationInput {
  mimeType: string;
  size: number;
  originalName?: string;
}

export function getUploadCategoryConfig(category: UploadCategory) {
  const config = UPLOAD_CATEGORY_CONFIG[category];
  if (!config) {
    throw new StorageError(`Unknown upload category: ${category}`);
  }
  return config;
}

export function validateUploadFile(
  category: UploadCategory,
  file: FileValidationInput,
): void {
  const config = getUploadCategoryConfig(category);

  if (!file.mimeType) {
    throw new BadRequestError(`${config.label} mime type is required`);
  }

  if (!config.allowedMimeTypes.includes(file.mimeType)) {
    throw new BadRequestError(
      `Invalid ${config.label.toLowerCase()} file type '${file.mimeType}'. ` +
        `Allowed: ${config.allowedMimeTypes.join(', ')}`,
    );
  }

  if (file.size <= 0) {
    throw new BadRequestError(`${config.label} file is empty`);
  }

  if (file.size > config.maxBytes) {
    const maxMb = Math.round(config.maxBytes / (1024 * 1024));
    throw new BadRequestError(
      `${config.label} exceeds maximum size of ${maxMb}MB`,
    );
  }

  if (file.originalName) {
    validateFileName(file.originalName);
  }
}

export function validateFileName(originalName: string): void {
  const baseName = originalName.split(/[/\\]/).pop() ?? originalName;

  if (!baseName || baseName.length > 255) {
    throw new BadRequestError('Invalid file name');
  }

  if (baseName.includes('..') || /[<>:"|?*\x00-\x1f]/.test(baseName)) {
    throw new BadRequestError('File name contains invalid characters');
  }
}

export function assertUploadCategory(value: string): UploadCategory {
  if (!(value in UPLOAD_CATEGORY_CONFIG)) {
    throw new BadRequestError(`Invalid upload category: ${value}`);
  }
  return value as UploadCategory;
}

export { UPLOAD_CATEGORIES };

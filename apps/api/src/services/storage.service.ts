import type { AppConfig } from '../config/index.js';
import { createStorageAdapter } from './storage/storage.factory.js';
import {
  buildBackgroundCheckAssetKey,
  buildCandidateAssetKey,
  buildEvaluationAssetKey,
  buildStorageKey,
} from './storage/upload.utils.js';
import { generateSignedDownloadUrl } from './storage/signed-url.utils.js';
import { safeDeleteFromS3 } from './storage/delete.utils.js';
import { S3StorageAdapter } from './storage/s3.storage.js';
import {
  validateUploadFile,
  getUploadCategoryConfig,
  type FileValidationInput,
} from './storage/file-validation.js';
import {
  DOCUMENT_KIND_TO_UPLOAD_CATEGORY,
  UPLOAD_CATEGORIES,
  type UploadCategory,
} from './storage/storage.constants.js';
import type {
  SignedUrlOptions,
  StorageUploadMetadata,
  UploadInput,
  UploadResult,
} from './storage/storage.interface.js';
import type { DocumentKind } from '@prisma/client';

export class StorageService {
  private readonly adapter;
  private readonly config: AppConfig;
  private readonly isS3: boolean;

  constructor(config: AppConfig) {
    this.config = config;
    this.adapter = createStorageAdapter(config);
    this.isS3 = config.storage.driver === 's3';
  }

  get driver(): 'local' | 's3' {
    return this.config.storage.driver;
  }

  get bucket(): string {
    return this.adapter.getBucket();
  }

  validateFile(category: UploadCategory, file: FileValidationInput): void {
    validateUploadFile(category, file);
  }

  upload(
    key: string,
    input: UploadInput,
    metadata?: StorageUploadMetadata,
  ): Promise<UploadResult> {
    if (metadata?.category) {
      this.validateFile(metadata.category as UploadCategory, {
        mimeType: input.mimeType,
        size: input.size,
        originalName: input.originalName,
      });
    }
    return this.adapter.upload(key, input, metadata);
  }

  delete(key: string, bucket: string): Promise<void> {
    return this.adapter.delete(key, bucket);
  }

  exists(key: string, bucket: string): Promise<boolean> {
    return this.adapter.exists(key, bucket);
  }

  async getSignedDownloadUrl(
    key: string,
    bucket: string,
    options?: SignedUrlOptions,
  ): Promise<string | null> {
    return this.adapter.getSignedDownloadUrl(key, bucket, options);
  }

  getPublicUrl(key: string, bucket: string): string | null {
    return this.adapter.getPublicUrl(key, bucket);
  }

  /** Resolve the best available URL for a stored file (signed URL for S3). */
  async resolveFileUrl(
    key: string,
    bucket: string,
    contentType?: string,
  ): Promise<string | null> {
    if (this.isS3) {
      return this.getSignedDownloadUrl(key, bucket, { contentType });
    }
    return this.getPublicUrl(key, bucket);
  }

  buildCandidateAssetKey(
    organizationId: number,
    candidateId: number,
    category: UploadCategory,
    originalName: string,
  ): string {
    return buildCandidateAssetKey(
      organizationId,
      candidateId,
      category,
      originalName,
    );
  }

  buildEvaluationAssetKey(
    organizationId: number,
    evaluationId: number,
    originalName: string,
  ): string {
    return buildEvaluationAssetKey(
      organizationId,
      evaluationId,
      originalName,
    );
  }

  buildBackgroundCheckAssetKey(
    organizationId: number,
    backgroundCheckId: number,
    originalName: string,
  ): string {
    return buildBackgroundCheckAssetKey(
      organizationId,
      backgroundCheckId,
      originalName,
    );
  }

  buildStorageKey(params: Parameters<typeof buildStorageKey>[0]): string {
    return buildStorageKey(params);
  }

  uploadCategoryFromDocumentKind(kind: DocumentKind): UploadCategory {
    return DOCUMENT_KIND_TO_UPLOAD_CATEGORY[kind] ?? UPLOAD_CATEGORIES.EVALUATION;
  }

  getCategoryConfig(category: UploadCategory) {
    return getUploadCategoryConfig(category);
  }

  getS3Adapter(): S3StorageAdapter | null {
    if (!this.isS3 || !(this.adapter instanceof S3StorageAdapter)) {
      return null;
    }
    return this.adapter;
  }

  async generatePresignedDownload(
    key: string,
    bucket: string,
    contentType?: string,
    expiresInSeconds?: number,
  ): Promise<string> {
    const s3 = this.getS3Adapter();
    if (!s3) {
      const url = await this.getSignedDownloadUrl(key, bucket, { contentType });
      if (!url) {
        throw new Error('Unable to generate download URL');
      }
      return url;
    }
    return generateSignedDownloadUrl(s3.getS3Service(), {
      key,
      bucket,
      contentType,
      expiresInSeconds,
    });
  }

  async safeDelete(key: string, bucket: string): Promise<boolean> {
    const s3 = this.getS3Adapter();
    if (s3) {
      return safeDeleteFromS3(s3.getS3Service(), key, bucket);
    }
    await this.delete(key, bucket);
    return true;
  }
}

export {
  UPLOAD_CATEGORIES,
  validateUploadFile,
  getUploadCategoryConfig,
} from './storage/file-validation.js';
export type { UploadCategory } from './storage/storage.constants.js';
export { S3Service } from './storage/s3.service.js';
export { S3StorageError, mapAwsError } from './storage/storage.errors.js';

import type { PrismaClient } from '@prisma/client';
import type { AppConfig, StorageConfig } from '../config/index.js';
import {
  readStorageSettings,
  resolveStorageConfig,
} from './system-settings.reader.js';
import { createStorageAdapter } from './storage/storage.factory.js';
import {
  buildBackgroundCheckAssetKey,
  buildCandidateAssetKey,
  buildClientEnquiryAssetKey,
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
  StorageAdapter,
  StorageUploadMetadata,
  UploadInput,
  UploadResult,
} from './storage/storage.interface.js';
import type { DocumentKind } from '@prisma/client';

export class StorageService {
  private adapter: StorageAdapter | null = null;
  private resolvedStorage: StorageConfig | null = null;

  constructor(
    private readonly config: AppConfig,
    private readonly prisma?: PrismaClient,
  ) {}

  private async ensureAdapter(): Promise<StorageAdapter> {
    const dbSettings = this.prisma ? await readStorageSettings(this.prisma) : null;
    const storage = resolveStorageConfig(this.config, dbSettings);
    const storageKey = JSON.stringify(storage);
    const cachedKey = this.resolvedStorage ? JSON.stringify(this.resolvedStorage) : null;
    if (!this.adapter || storageKey !== cachedKey) {
      this.resolvedStorage = storage;
      this.adapter = createStorageAdapter({ ...this.config, storage });
    }
    return this.adapter;
  }

  private async isS3Driver(): Promise<boolean> {
    const dbSettings = this.prisma ? await readStorageSettings(this.prisma) : null;
    return resolveStorageConfig(this.config, dbSettings).driver === 's3';
  }

  async getDriver(): Promise<'local' | 's3'> {
    const dbSettings = this.prisma ? await readStorageSettings(this.prisma) : null;
    return resolveStorageConfig(this.config, dbSettings).driver;
  }

  async getBucket(): Promise<string> {
    const adapter = await this.ensureAdapter();
    return adapter.getBucket();
  }

  validateFile(category: UploadCategory, file: FileValidationInput): void {
    validateUploadFile(category, file);
  }

  async upload(
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
    const adapter = await this.ensureAdapter();
    return adapter.upload(key, input, metadata);
  }

  async delete(key: string, bucket: string): Promise<void> {
    const adapter = await this.ensureAdapter();
    return adapter.delete(key, bucket);
  }

  async exists(key: string, bucket: string): Promise<boolean> {
    const adapter = await this.ensureAdapter();
    return adapter.exists(key, bucket);
  }

  async getSignedDownloadUrl(
    key: string,
    bucket: string,
    options?: SignedUrlOptions,
  ): Promise<string | null> {
    const adapter = await this.ensureAdapter();
    return adapter.getSignedDownloadUrl(key, bucket, options);
  }

  async getPublicUrl(key: string, bucket: string): Promise<string | null> {
    const adapter = await this.ensureAdapter();
    return adapter.getPublicUrl(key, bucket);
  }

  /** Resolve the best available URL for a stored file (signed URL for S3). */
  async resolveFileUrl(
    key: string,
    bucket: string,
    contentType?: string,
  ): Promise<string | null> {
    if (await this.isS3Driver()) {
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

  buildClientEnquiryAssetKey(
    organizationId: number,
    enquiryId: number,
    originalName: string,
  ): string {
    return buildClientEnquiryAssetKey(organizationId, enquiryId, originalName);
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

  async getS3Adapter(): Promise<S3StorageAdapter | null> {
    const adapter = await this.ensureAdapter();
    if (!(await this.isS3Driver()) || !(adapter instanceof S3StorageAdapter)) {
      return null;
    }
    return adapter;
  }

  async generatePresignedDownload(
    key: string,
    bucket: string,
    contentType?: string,
    expiresInSeconds?: number,
  ): Promise<string> {
    const s3 = await this.getS3Adapter();
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
    const s3 = await this.getS3Adapter();
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

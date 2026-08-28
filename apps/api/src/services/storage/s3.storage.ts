import type { AppConfig } from '../../config/index.js';
import { S3Service } from './s3.service.js';
import { uploadToS3 } from './upload.utils.js';
import { deleteFromS3 } from './delete.utils.js';
import type {
  SignedUrlOptions,
  StorageAdapter,
  StorageUploadMetadata,
  UploadInput,
  UploadResult,
} from './storage.interface.js';
import type { UploadCategory } from './storage.constants.js';

export class S3StorageAdapter implements StorageAdapter {
  private readonly s3Service: S3Service;

  constructor(config: AppConfig) {
    if (!config.storage.aws) {
      throw new Error('AWS S3 configuration is missing');
    }
    this.s3Service = new S3Service(config.storage.aws);
  }

  getBucket(): string {
    return this.s3Service.getBucket();
  }

  async upload(
    key: string,
    input: UploadInput,
    metadata?: StorageUploadMetadata,
  ): Promise<UploadResult> {
    if (!metadata?.category || metadata.organizationId === undefined || metadata.entityId === undefined) {
      const result = await this.s3Service.uploadObject({ key, input });
      const url = await this.s3Service.getSignedDownloadUrl({
        key: result.key,
        contentType: input.mimeType,
      });
      return { key: result.key, bucket: result.bucket, url };
    }

    return uploadToS3(this.s3Service, {
      key,
      input,
      category: metadata.category as UploadCategory,
      organizationId: metadata.organizationId,
      entityId: metadata.entityId,
    });
  }

  async delete(key: string, bucket: string): Promise<void> {
    await deleteFromS3(this.s3Service, key, bucket);
  }

  async exists(key: string, bucket: string): Promise<boolean> {
    return this.s3Service.objectExists(key, bucket);
  }

  async getSignedDownloadUrl(
    key: string,
    bucket: string,
    options?: SignedUrlOptions,
  ): Promise<string> {
    return this.s3Service.getSignedDownloadUrl({
      key,
      bucket,
      expiresInSeconds: options?.expiresInSeconds,
      contentType: options?.contentType,
      contentDisposition: options?.contentDisposition ?? 'inline',
      fileName: options?.fileName,
    });
  }

  getPublicUrl(_key: string, _bucket: string): string | null {
    return null;
  }

  getS3Service(): S3Service {
    return this.s3Service;
  }
}
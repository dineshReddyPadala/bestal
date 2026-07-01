import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
  type S3ClientConfig,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { AwsS3Config } from '../../config/index.js';
import {
  DEFAULT_PRESIGNED_URL_EXPIRY_SECONDS,
  S3_METADATA_ENTITY_ID,
  S3_METADATA_ORGANIZATION_ID,
  S3_METADATA_ORIGINAL_NAME,
  S3_METADATA_UPLOAD_CATEGORY,
  type UploadCategory,
} from './storage.constants.js';
import { mapAwsError } from './storage.errors.js';
import type { UploadInput } from './storage.interface.js';

export interface S3UploadOptions {
  key: string;
  input: UploadInput;
  category?: UploadCategory;
  organizationId?: number;
  entityId?: number;
}

export interface SignedUrlParams {
  key: string;
  bucket?: string;
  expiresInSeconds?: number;
  contentType?: string;
}

export class S3Service {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly defaultExpiry: number;

  constructor(config: AwsS3Config) {
    this.bucket = config.bucket;
    this.defaultExpiry = config.presignedUrlExpirySeconds;

    const clientConfig: S3ClientConfig = {
      region: config.region,
    };

    if (config.accessKeyId && config.secretAccessKey) {
      clientConfig.credentials = {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      };
    }

    this.client = new S3Client(clientConfig);
  }

  getBucket(): string {
    return this.bucket;
  }

  async uploadObject(options: S3UploadOptions) {
    const { key, input, category, organizationId, entityId } = options;

    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: input.buffer,
          ContentType: input.mimeType,
          ContentLength: input.size,
          Metadata: {
            ...(input.originalName
              ? { [S3_METADATA_ORIGINAL_NAME]: sanitizeMetadata(input.originalName) }
              : {}),
            ...(category
              ? { [S3_METADATA_UPLOAD_CATEGORY]: category }
              : {}),
            ...(organizationId !== undefined
              ? { [S3_METADATA_ORGANIZATION_ID]: String(organizationId) }
              : {}),
            ...(entityId !== undefined
              ? { [S3_METADATA_ENTITY_ID]: String(entityId) }
              : {}),
          },
        }),
      );

      return {
        key,
        bucket: this.bucket,
      };
    } catch (error) {
      throw mapAwsError(error, 'upload');
    }
  }

  async deleteObject(key: string, bucket = this.bucket): Promise<void> {
    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: key,
        }),
      );
    } catch (error) {
      throw mapAwsError(error, 'delete');
    }
  }

  async objectExists(key: string, bucket = this.bucket): Promise<boolean> {
    try {
      await this.client.send(
        new HeadObjectCommand({
          Bucket: bucket,
          Key: key,
        }),
      );
      return true;
    } catch (error) {
      const err = error as { name?: string; Code?: string };
      if (err.name === 'NotFound' || err.Code === 'NotFound') {
        return false;
      }
      throw mapAwsError(error, 'head');
    }
  }

  async getSignedDownloadUrl(params: SignedUrlParams): Promise<string> {
    const bucket = params.bucket ?? this.bucket;
    const expiresIn = params.expiresInSeconds ?? this.defaultExpiry;

    try {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: params.key,
        ResponseContentType: params.contentType,
      });

      return await getSignedUrl(this.client, command, { expiresIn });
    } catch (error) {
      throw mapAwsError(error, 'signed download URL');
    }
  }

  async getSignedUploadUrl(params: SignedUrlParams): Promise<string> {
    const bucket = params.bucket ?? this.bucket;
    const expiresIn = params.expiresInSeconds ?? this.defaultExpiry;

    if (!params.contentType) {
      throw mapAwsError(
        new Error('contentType is required for upload presigned URLs'),
        'signed upload URL',
      );
    }

    try {
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: params.key,
        ContentType: params.contentType,
      });

      return await getSignedUrl(this.client, command, { expiresIn });
    } catch (error) {
      throw mapAwsError(error, 'signed upload URL');
    }
  }
}

function sanitizeMetadata(value: string): string {
  return value.replace(/[^\x20-\x7E]/g, '').slice(0, 1024);
}

export { DEFAULT_PRESIGNED_URL_EXPIRY_SECONDS };

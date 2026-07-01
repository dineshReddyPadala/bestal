export interface UploadInput {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  size: number;
}

export interface UploadResult {
  key: string;
  bucket: string;
  url?: string;
}

export interface SignedUrlOptions {
  expiresInSeconds?: number;
  contentType?: string;
}

export interface SignedUploadUrlOptions extends SignedUrlOptions {
  contentType: string;
}

export interface StorageAdapter {
  upload(
    key: string,
    input: UploadInput,
    metadata?: StorageUploadMetadata,
  ): Promise<UploadResult>;
  delete(key: string, bucket: string): Promise<void>;
  exists(key: string, bucket: string): Promise<boolean>;
  getSignedDownloadUrl(
    key: string,
    bucket: string,
    options?: SignedUrlOptions,
  ): Promise<string | null>;
  getSignedUploadUrl(
    key: string,
    bucket: string,
    options: SignedUploadUrlOptions,
  ): Promise<string | null>;
  getPublicUrl(key: string, bucket: string): string | null;
  getBucket(): string;
}

export interface StorageUploadMetadata {
  category?: string;
  organizationId?: number;
  entityId?: number;
}

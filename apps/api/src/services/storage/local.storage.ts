import { mkdir, writeFile, unlink, access } from 'node:fs/promises';
import path from 'node:path';
import type { AppConfig } from '../../config/index.js';
import type {
  SignedUrlOptions,
  SignedUploadUrlOptions,
  StorageAdapter,
  StorageUploadMetadata,
  UploadInput,
  UploadResult,
} from './storage.interface.js';

export class LocalStorageAdapter implements StorageAdapter {
  private readonly basePath: string;
  private readonly appUrl: string;

  constructor(config: AppConfig) {
    this.basePath = path.resolve(config.storage.localPath);
    this.appUrl = config.appUrl;
  }

  getBucket(): string {
    return 'local';
  }

  async upload(
    key: string,
    input: UploadInput,
    _metadata?: StorageUploadMetadata,
  ): Promise<UploadResult> {
    const filePath = path.join(this.basePath, key);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, input.buffer);

    const publicPath = `/uploads/${key.replace(/\\/g, '/')}`;

    return {
      key,
      bucket: 'local',
      url: `${this.appUrl}${publicPath}`,
    };
  }

  async delete(key: string, _bucket: string): Promise<void> {
    const filePath = path.join(this.basePath, key);
    try {
      await unlink(filePath);
    } catch {
      // File may already be removed
    }
  }

  async exists(key: string, _bucket: string): Promise<boolean> {
    const filePath = path.join(this.basePath, key);
    try {
      await access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async getSignedDownloadUrl(
    key: string,
    bucket: string,
    _options?: SignedUrlOptions,
  ): Promise<string> {
    const publicUrl = this.getPublicUrl(key, bucket);
    return publicUrl ?? `${this.appUrl}/uploads/${key.replace(/\\/g, '/')}`;
  }

  async getSignedUploadUrl(
    key: string,
    bucket: string,
    _options: SignedUploadUrlOptions,
  ): Promise<string> {
    return this.getSignedDownloadUrl(key, bucket);
  }

  getPublicUrl(key: string, bucket: string): string | null {
    if (bucket !== 'local') {
      return null;
    }
    return `${this.appUrl}/uploads/${key.replace(/\\/g, '/')}`;
  }
}

import type { AppConfig } from '../../config/index.js';
import { BadRequestError } from '../../utils/index.js';
import { LocalStorageAdapter } from './local.storage.js';
import { S3StorageAdapter } from './s3.storage.js';
import type { StorageAdapter } from './storage.interface.js';

export function createStorageAdapter(config: AppConfig): StorageAdapter {
  if (config.storage.driver === 's3') {
    if (!config.storage.aws) {
      throw new BadRequestError('S3 storage is not fully configured');
    }
    return new S3StorageAdapter(config);
  }
  return new LocalStorageAdapter(config);
}

export function createS3StorageAdapter(config: AppConfig): S3StorageAdapter {
  if (!config.storage.aws) {
    throw new BadRequestError('S3 storage is not fully configured');
  }
  return new S3StorageAdapter(config);
}

export { LocalStorageAdapter, S3StorageAdapter };

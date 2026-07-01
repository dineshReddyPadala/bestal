import type { S3Service } from './s3.service.js';
import { mapAwsError } from './storage.errors.js';

export async function deleteFromS3(
  s3Service: S3Service,
  key: string,
  bucket?: string,
): Promise<void> {
  try {
    await s3Service.deleteObject(key, bucket);
  } catch (error) {
    throw mapAwsError(error, 'delete');
  }
}

export async function safeDeleteFromS3(
  s3Service: S3Service,
  key: string,
  bucket?: string,
): Promise<boolean> {
  try {
    const exists = await s3Service.objectExists(key, bucket);
    if (!exists) {
      return false;
    }
    await s3Service.deleteObject(key, bucket);
    return true;
  } catch {
    return false;
  }
}

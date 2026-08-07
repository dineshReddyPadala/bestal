import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { Document } from '@prisma/client';
import type { AppConfig } from '../config/index.js';
import { NotFoundError } from '../utils/index.js';
import { StorageService } from './storage.service.js';

export type DocumentDownloadPayload = {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
};

export async function readStoredDocumentBuffer(
  document: Pick<Document, 's3Key' | 's3Bucket' | 'originalName' | 'mimeType' | 'fileUrl'>,
  config: AppConfig,
  storageService: StorageService,
): Promise<DocumentDownloadPayload> {
  if (config.storage.driver === 'local') {
    const filePath = path.join(config.storage.localPath, document.s3Key);
    try {
      const buffer = await readFile(filePath);
      return {
        buffer,
        fileName: document.originalName,
        mimeType: document.mimeType,
      };
    } catch {
      throw new NotFoundError('Document file not found');
    }
  }

  const downloadUrl = await storageService.resolveFileUrl(
    document.s3Key,
    document.s3Bucket,
    document.mimeType,
  );
  if (!downloadUrl) {
    throw new NotFoundError('Document download URL unavailable');
  }

  const response = await fetch(downloadUrl);
  if (!response.ok) {
    throw new NotFoundError('Document file not found');
  }

  return {
    buffer: Buffer.from(await response.arrayBuffer()),
    fileName: document.originalName,
    mimeType: document.mimeType,
  };
}

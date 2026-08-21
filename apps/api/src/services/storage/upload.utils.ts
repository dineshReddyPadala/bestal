import path from 'node:path';
import { UPLOAD_CATEGORIES, type UploadCategory } from './storage.constants.js';
import { getUploadCategoryConfig } from './file-validation.js';
import type { UploadInput, UploadResult } from './storage.interface.js';
import type { S3Service } from './s3.service.js';

export interface BuildStorageKeyParams {
  organizationId: number;
  entityFolder: string;
  entityId: number;
  category: UploadCategory;
  originalName: string;
}

export function buildStorageKey(params: BuildStorageKeyParams): string {
  const config = getUploadCategoryConfig(params.category);
  const ext = path.extname(params.originalName).toLowerCase();
  const timestamp = Date.now();
  const random = crypto.randomUUID().slice(0, 8);
  const fileName = `${config.s3Prefix}-${timestamp}-${random}${ext}`;

  return [
    'organizations',
    String(params.organizationId),
    params.entityFolder,
    String(params.entityId),
    config.s3Prefix,
    fileName,
  ].join('/');
}

/** Compact durable reference for DB columns with URL length limits (not for direct download). */
export function buildS3ObjectReference(bucket: string, key: string): string {
  return `s3://${bucket}/${key}`;
}

export async function uploadToS3(
  s3Service: S3Service,
  params: {
    key: string;
    input: UploadInput;
    category: UploadCategory;
    organizationId: number;
    entityId: number;
  },
): Promise<UploadResult> {
  const result = await s3Service.uploadObject({
    key: params.key,
    input: params.input,
    category: params.category,
    organizationId: params.organizationId,
    entityId: params.entityId,
  });

  const signedUrl = await s3Service.getSignedDownloadUrl({
    key: result.key,
    bucket: result.bucket,
    contentType: params.input.mimeType,
  });

  return {
    key: result.key,
    bucket: result.bucket,
    url: signedUrl,
  };
}

export function buildCandidateAssetKey(
  organizationId: number,
  candidateId: number,
  category: UploadCategory,
  originalName: string,
): string {
  return buildStorageKey({
    organizationId,
    entityFolder: 'candidates',
    entityId: candidateId,
    category,
    originalName,
  });
}

export function buildEvaluationAssetKey(
  organizationId: number,
  evaluationId: number,
  originalName: string,
): string {
  return buildStorageKey({
    organizationId,
    entityFolder: 'evaluations',
    entityId: evaluationId,
    category: UPLOAD_CATEGORIES.EVALUATION,
    originalName,
  });
}

export function buildBackgroundCheckAssetKey(
  organizationId: number,
  backgroundCheckId: number,
  originalName: string,
): string {
  return buildStorageKey({
    organizationId,
    entityFolder: 'background-checks',
    entityId: backgroundCheckId,
    category: UPLOAD_CATEGORIES.BACKGROUND_CHECK,
    originalName,
  });
}

export function buildClientEnquiryAssetKey(
  organizationId: number,
  enquiryId: number,
  originalName: string,
): string {
  return buildStorageKey({
    organizationId,
    entityFolder: 'client-enquiries',
    entityId: enquiryId,
    category: UPLOAD_CATEGORIES.CLIENT_ENQUIRY,
    originalName,
  });
}

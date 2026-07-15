import type { S3Service, SignedUrlParams } from './s3.service.js';

export interface GenerateSignedDownloadUrlParams extends SignedUrlParams {
  contentType?: string;
}

export async function generateSignedDownloadUrl(
  s3Service: S3Service,
  params: GenerateSignedDownloadUrlParams,
): Promise<string> {
  return s3Service.getSignedDownloadUrl(params);
}

export async function generateSignedDownloadUrls(
  s3Service: S3Service,
  items: GenerateSignedDownloadUrlParams[],
): Promise<string[]> {
  return Promise.all(
    items.map((item) => s3Service.getSignedDownloadUrl(item)),
  );
}

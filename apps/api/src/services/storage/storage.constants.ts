/**
 * Upload categories aligned with BesTal document types.
 */
export const UPLOAD_CATEGORIES = {
  RESUME: 'RESUME',
  EVALUATION: 'EVALUATION',
  BACKGROUND_CHECK: 'BACKGROUND_CHECK',
  CANDIDATE_PHOTO: 'CANDIDATE_PHOTO',
  VIDEO: 'VIDEO',
} as const;

export type UploadCategory =
  (typeof UPLOAD_CATEGORIES)[keyof typeof UPLOAD_CATEGORIES];

export interface UploadCategoryConfig {
  label: string;
  allowedMimeTypes: readonly string[];
  maxBytes: number;
  s3Prefix: string;
}

export const UPLOAD_CATEGORY_CONFIG: Record<
  UploadCategory,
  UploadCategoryConfig
> = {
  [UPLOAD_CATEGORIES.RESUME]: {
    label: 'Resume',
    allowedMimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    maxBytes: 10 * 1024 * 1024,
    s3Prefix: 'resumes',
  },
  [UPLOAD_CATEGORIES.EVALUATION]: {
    label: 'Evaluation',
    allowedMimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/webp',
    ],
    maxBytes: 15 * 1024 * 1024,
    s3Prefix: 'evaluations',
  },
  [UPLOAD_CATEGORIES.BACKGROUND_CHECK]: {
    label: 'Background Check',
    allowedMimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/webp',
    ],
    maxBytes: 20 * 1024 * 1024,
    s3Prefix: 'background-checks',
  },
  [UPLOAD_CATEGORIES.CANDIDATE_PHOTO]: {
    label: 'Candidate Photo',
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxBytes: 5 * 1024 * 1024,
    s3Prefix: 'photos',
  },
  [UPLOAD_CATEGORIES.VIDEO]: {
    label: 'Video',
    allowedMimeTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
    maxBytes: 100 * 1024 * 1024,
    s3Prefix: 'videos',
  },
};

/** Maps Prisma DocumentKind to upload category. */
export const DOCUMENT_KIND_TO_UPLOAD_CATEGORY = {
  RESUME: UPLOAD_CATEGORIES.RESUME,
  PROFILE_IMAGE: UPLOAD_CATEGORIES.CANDIDATE_PHOTO,
  INTRO_VIDEO: UPLOAD_CATEGORIES.VIDEO,
  GENERAL: UPLOAD_CATEGORIES.EVALUATION,
} as const;

export const DEFAULT_PRESIGNED_URL_EXPIRY_SECONDS = 3600;

export const DEFAULT_S3_ACL = 'private' as const;

export const S3_METADATA_ORIGINAL_NAME = 'original-name';

export const S3_METADATA_UPLOAD_CATEGORY = 'upload-category';

export const S3_METADATA_ORGANIZATION_ID = 'organization-id';

export const S3_METADATA_ENTITY_ID = 'entity-id';

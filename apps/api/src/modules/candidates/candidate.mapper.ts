import type { AppConfig } from '../../config/index.js';
import { mapCandidateExtendedDto } from './candidate-field-mapper.js';
import type {
  CandidateDocumentDto,
  CandidateDto,
  CandidateListItemDto,
  PublicFeaturedEvaluationDto,
} from './candidate.types.js';
import type { CandidateWithRelations } from './candidate.repository.js';
import type { Document, Evaluation } from '@prisma/client';
import { bigintToNumber } from '../../utils/index.js';

type UrlResolver = (
  key: string,
  bucket: string,
  mimeType?: string,
) => Promise<string | null> | string | null;

export async function mapDocumentToDtoAsync(
  doc: Document | null | undefined,
  resolveUrl: UrlResolver,
): Promise<CandidateDocumentDto | null> {
  if (!doc || doc.deletedAt) {
    return null;
  }

  const url = await resolveUrl(doc.s3Key, doc.s3Bucket, doc.mimeType);

  return {
    id: bigintToNumber(doc.id),
    kind: doc.kind,
    fileName: doc.fileName,
    originalName: doc.originalName,
    mimeType: doc.mimeType,
    fileSize: bigintToNumber(doc.fileSize),
    status: doc.status,
    url,
    createdAt: doc.createdAt.toISOString(),
  };
}

export async function mapCandidateToDtoAsync(
  candidate: CandidateWithRelations,
  resolveUrl: UrlResolver,
): Promise<CandidateDto> {
  const [resume, profileImage, introVideo] = await Promise.all([
    mapDocumentToDtoAsync(candidate.resumeDocument, resolveUrl),
    mapDocumentToDtoAsync(candidate.profileImageDocument, resolveUrl),
    mapDocumentToDtoAsync(candidate.introVideoDocument, resolveUrl),
  ]);

  return {
    id: bigintToNumber(candidate.id),
    organizationId: bigintToNumber(candidate.organizationId),
    firstName: candidate.firstName,
    lastName: candidate.lastName,
    email: candidate.email,
    phone: candidate.phone,
    status: candidate.status,
    visibility: candidate.visibility,
    approvalStatus: candidate.approvalStatus,
    source: candidate.source,
    headline: candidate.headline,
    summary: candidate.summary,
    location: candidate.location,
    yearsExperience: candidate.yearsExperience,
    availableFrom: candidate.availableFrom?.toISOString().slice(0, 10) ?? null,
    expectedRate: candidate.expectedRate ? Number(candidate.expectedRate) : null,
    currency: candidate.currency,
    linkedinUrl: candidate.linkedinUrl,
    primarySkillCommunityId: candidate.primarySkillCommunityId
      ? bigintToNumber(candidate.primarySkillCommunityId)
      : null,
    primarySkillCommunityName: candidate.primarySkillCommunity?.name ?? null,
    publishedAt: candidate.publishedAt?.toISOString() ?? null,
    hiddenAt: candidate.hiddenAt?.toISOString() ?? null,
    approvedAt: candidate.approvedAt?.toISOString() ?? null,
    approvedById: candidate.approvedById
      ? bigintToNumber(candidate.approvedById)
      : null,
    rejectedAt: candidate.rejectedAt?.toISOString() ?? null,
    rejectedById: candidate.rejectedById
      ? bigintToNumber(candidate.rejectedById)
      : null,
    rejectionReason: candidate.rejectionReason,
    resume,
    profileImage,
    introVideo,
    skills: (candidate.skills ?? []).map((skill) => ({
      id: bigintToNumber(skill.id),
      skillCommunityId: skill.skillCommunityId
        ? bigintToNumber(skill.skillCommunityId)
        : null,
      skillCommunityName: skill.skillCommunity?.name ?? null,
      skillName: skill.skillName,
      skillCategory: skill.skillCategory,
      proficiencyLevel: skill.proficiencyLevel,
      yearsExperience: skill.yearsExperience,
      isPrimary: skill.isPrimary,
      notes: skill.notes,
    })),
    ...mapCandidateExtendedDto(candidate),
    createdAt: candidate.createdAt.toISOString(),
    updatedAt: candidate.updatedAt.toISOString(),
  };
}

export async function mapCandidateToListItemAsync(
  candidate: CandidateWithRelations,
  resolveUrl: UrlResolver,
): Promise<CandidateListItemDto> {
  const profileImageDoc = candidate.profileImageDocument;
  const profileImageUrl =
    profileImageDoc && !profileImageDoc.deletedAt
      ? ((await resolveUrl(
          profileImageDoc.s3Key,
          profileImageDoc.s3Bucket,
          profileImageDoc.mimeType,
        )) ?? null)
      : null;

  return {
    id: bigintToNumber(candidate.id),
    firstName: candidate.firstName,
    lastName: candidate.lastName,
    email: candidate.email,
    status: candidate.status,
    visibility: candidate.visibility,
    approvalStatus: candidate.approvalStatus,
    headline: candidate.headline,
    location: candidate.location,
    yearsExperience: candidate.yearsExperience,
    primarySkillCommunityName: candidate.primarySkillCommunity?.name ?? null,
    primaryRole: candidate.primaryRole ?? null,
    currentCompany: candidate.currentCompany ?? null,
    currentTitle: candidate.currentTitle ?? null,
    bestalScore: candidate.bestalScore ?? null,
    clientBillRate: candidate.clientBillRate ? Number(candidate.clientBillRate) : null,
    currency: candidate.currency,
    availabilityStatus: candidate.availabilityStatus ?? null,
    timezoneOverlap: candidate.timezoneOverlap ?? null,
    hasResume: Boolean(candidate.resumeDocumentId),
    hasProfileImage: Boolean(candidate.profileImageDocumentId),
    profileImageUrl,
    hasIntroVideo: Boolean(candidate.introVideoDocumentId),
    profileStatus: candidate.profileStatus,
    evaluationStatus: candidate.evaluationStatus,
    bgvStatus: candidate.bgvStatus,
    submittedForApprovalAt: candidate.submittedForApprovalAt?.toISOString() ?? null,
    hasAiSummary: Boolean(candidate.aiSummary?.trim()),
    hasSkills: (candidate.skills?.length ?? 0) > 0,
    hasAvailability: Boolean(
      candidate.availabilityStatus && candidate.availableFrom,
    ),
    hasCommercials:
      candidate.clientBillRate != null && Number(candidate.clientBillRate) > 0,
    createdAt: candidate.createdAt.toISOString(),
    updatedAt: candidate.updatedAt.toISOString(),
  };
}

export function parseSortParam(
  sort: string | undefined,
): import('@prisma/client').Prisma.CandidateOrderByWithRelationInput[] {
  if (!sort) {
    return [{ updatedAt: 'desc' }];
  }

  return sort.split(',').map((field) => {
    const desc = field.startsWith('-');
    const key = desc ? field.slice(1) : field;
    const direction = desc ? 'desc' : 'asc';

    switch (key) {
      case 'firstName':
      case 'lastName':
      case 'email':
      case 'status':
      case 'visibility':
      case 'approvalStatus':
      case 'yearsExperience':
      case 'bestalScore':
      case 'publishedAt':
      case 'createdAt':
      case 'updatedAt':
        return { [key]: direction };
      default:
        return { updatedAt: 'desc' as const };
    }
  });
}

export function mapPublicFeaturedEvaluation(
  candidate: CandidateWithRelations,
  evaluation?: Evaluation | null,
): PublicFeaturedEvaluationDto | null {
  if (evaluation) {
    return {
      technicalScore: evaluation.technicalScore,
      problemSolvingScore: evaluation.problemSolvingScore,
      collaborationCulturalFitScore: evaluation.collaborationCulturalFitScore,
      clientReadinessScore: evaluation.clientReadinessScore,
      communicationScore: evaluation.communicationScore,
      evaluationSummary: evaluation.evaluationSummary,
      recommendation: evaluation.recommendation,
      evaluatorComments: evaluation.evaluatorComments,
      evaluationDate: evaluation.evaluationDate?.toISOString().slice(0, 10) ?? null,
    };
  }

  if (candidate.technicalScore == null && candidate.communicationScore == null) {
    return null;
  }

  return {
    technicalScore: candidate.technicalScore,
    problemSolvingScore: null,
    collaborationCulturalFitScore: null,
    clientReadinessScore: null,
    communicationScore: candidate.communicationScore,
    evaluationSummary: null,
    recommendation: null,
    evaluatorComments: null,
    evaluationDate: null,
  };
}

export function buildPublicUploadUrl(
  config: AppConfig,
  key: string,
  bucket: string,
): string | null {
  if (bucket === 'local') {
    return `${config.appUrl}/uploads/${key.replace(/\\/g, '/')}`;
  }
  return null;
}

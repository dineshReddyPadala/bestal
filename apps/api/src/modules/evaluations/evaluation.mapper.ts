import type { Prisma } from '@prisma/client';
import { bigintToNumber } from '../../utils/index.js';
import type { EvaluationDto, EvaluationListItemDto } from './evaluation.types.js';
import type { EvaluationRecord } from './evaluation.repository.js';

function formatPersonName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`;
}

function formatDateOnly(value: Date | null): string | null {
  if (!value) return null;
  return value.toISOString().slice(0, 10);
}

export function mapEvaluationToDto(evaluation: EvaluationRecord): EvaluationDto {
  return {
    id: bigintToNumber(evaluation.id),
    organizationId: bigintToNumber(evaluation.organizationId),
    candidateId: bigintToNumber(evaluation.candidateId),
    candidateName: formatPersonName(
      evaluation.candidate.firstName,
      evaluation.candidate.lastName,
    ),
    evaluatorName: evaluation.evaluatorName,
    evaluatorCompany: evaluation.evaluatorCompany,
    evaluationType: evaluation.evaluationType,
    evaluationDate: formatDateOnly(evaluation.evaluationDate),
    technicalScore: evaluation.technicalScore,
    communicationScore: evaluation.communicationScore,
    problemSolvingScore: evaluation.problemSolvingScore,
    architectureScore: evaluation.architectureScore,
    clientReadinessScore: evaluation.clientReadinessScore,
    recommendation: evaluation.recommendation,
    evaluatorComments: evaluation.evaluatorComments,
    aiEvaluationSummary: evaluation.aiEvaluationSummary,
    recordingUrl: evaluation.recordingUrl,
    evaluationFileUrl: evaluation.evaluationFileUrl,
    createdAt: evaluation.createdAt.toISOString(),
    updatedAt: evaluation.updatedAt.toISOString(),
  };
}

export function mapEvaluationToListItem(
  evaluation: EvaluationRecord,
): EvaluationListItemDto {
  return {
    id: bigintToNumber(evaluation.id),
    candidateId: bigintToNumber(evaluation.candidateId),
    candidateName: formatPersonName(
      evaluation.candidate.firstName,
      evaluation.candidate.lastName,
    ),
    evaluatorName: evaluation.evaluatorName,
    evaluatorCompany: evaluation.evaluatorCompany,
    evaluationType: evaluation.evaluationType,
    evaluationDate: formatDateOnly(evaluation.evaluationDate),
    recommendation: evaluation.recommendation,
    technicalScore: evaluation.technicalScore,
    createdAt: evaluation.createdAt.toISOString(),
    updatedAt: evaluation.updatedAt.toISOString(),
  };
}

export function parseSortParam(
  sort: string | undefined,
): Prisma.EvaluationOrderByWithRelationInput[] {
  if (!sort) {
    return [{ createdAt: 'desc' }];
  }

  return sort.split(',').map((field) => {
    const desc = field.startsWith('-');
    const key = desc ? field.slice(1) : field;
    const direction = desc ? 'desc' : 'asc';

    switch (key) {
      case 'evaluationDate':
      case 'technicalScore':
      case 'createdAt':
      case 'updatedAt':
        return { [key]: direction };
      default:
        return { createdAt: 'desc' as const };
    }
  });
}

import type { Prisma } from '@prisma/client';
import { bigintToNumber } from '../../utils/index.js';
import type { EvaluationDto, EvaluationListItemDto } from './evaluation.types.js';
import type { EvaluationRecord } from './evaluation.repository.js';

function formatPersonName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`;
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
    clientId: evaluation.clientId ? bigintToNumber(evaluation.clientId) : null,
    clientName: evaluation.client?.name ?? null,
    evaluatorId: bigintToNumber(evaluation.evaluatorId),
    evaluatorName:
      evaluation.evaluatorName ??
      formatPersonName(
        evaluation.evaluator.firstName,
        evaluation.evaluator.lastName,
      ),
    status: evaluation.status,
    recommendation: evaluation.recommendation,
    overallScore: evaluation.overallScore ? Number(evaluation.overallScore) : null,
    technicalScore: evaluation.technicalScore
      ? Number(evaluation.technicalScore)
      : null,
    softSkillScore: evaluation.softSkillScore
      ? Number(evaluation.softSkillScore)
      : null,
    communicationScore: evaluation.communicationScore
      ? Number(evaluation.communicationScore)
      : null,
    problemSolvingScore: evaluation.problemSolvingScore
      ? Number(evaluation.problemSolvingScore)
      : null,
    architectureScore: evaluation.architectureScore
      ? Number(evaluation.architectureScore)
      : null,
    clientReadinessScore: evaluation.clientReadinessScore
      ? Number(evaluation.clientReadinessScore)
      : null,
    evaluatorCompany: evaluation.evaluatorCompany,
    evaluationType: evaluation.evaluationType,
    evaluatorComments: evaluation.evaluatorComments,
    aiEvaluationSummary: evaluation.aiEvaluationSummary,
    recordingUrl: evaluation.recordingUrl,
    evaluationFileUrl: evaluation.evaluationFileUrl,
    summary: evaluation.summary,
    strengths: evaluation.strengths,
    weaknesses: evaluation.weaknesses,
    evaluatedAt: evaluation.evaluatedAt?.toISOString() ?? null,
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
    clientId: evaluation.clientId ? bigintToNumber(evaluation.clientId) : null,
    clientName: evaluation.client?.name ?? null,
    evaluatorId: bigintToNumber(evaluation.evaluatorId),
    evaluatorName: formatPersonName(
      evaluation.evaluator.firstName,
      evaluation.evaluator.lastName,
    ),
    status: evaluation.status,
    recommendation: evaluation.recommendation,
    overallScore: evaluation.overallScore ? Number(evaluation.overallScore) : null,
    evaluatedAt: evaluation.evaluatedAt?.toISOString() ?? null,
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
      case 'status':
      case 'evaluatedAt':
      case 'overallScore':
      case 'createdAt':
      case 'updatedAt':
        return { [key]: direction };
      default:
        return { createdAt: 'desc' as const };
    }
  });
}

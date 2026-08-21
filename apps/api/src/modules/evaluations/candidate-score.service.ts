import type { Evaluation, PrismaClient } from '@prisma/client';
import { syncImportedCandidateProfileStatus } from '../candidates/candidate-profile-sync.js';

type ScoreFields = Pick<
  Evaluation,
  | 'technicalScore'
  | 'communicationScore'
  | 'problemSolvingScore'
  | 'collaborationCulturalFitScore'
  | 'clientReadinessScore'
  | 'recommendation'
  | 'aiEvaluationSummary'
>;

function averageDimensionScores(evaluation: ScoreFields): number | null {
  const scores = [
    evaluation.technicalScore,
    evaluation.communicationScore,
    evaluation.problemSolvingScore,
    evaluation.collaborationCulturalFitScore,
    evaluation.clientReadinessScore,
  ].filter((score): score is number => score != null);

  if (!scores.length) return null;
  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
}

function recommendationMultiplier(recommendation: string | null): number {
  switch (recommendation) {
    case 'Strong Hire':
      return 1.05;
    case 'Hire':
      return 1;
    case 'Borderline':
      return 0.92;
    case 'Reject':
      return 0.8;
    default:
      return 1;
  }
}

export function computeBestalScore(evaluation: ScoreFields): number | null {
  const average = averageDimensionScores(evaluation);
  if (average == null && !evaluation.aiEvaluationSummary) return null;

  const base = average ?? 70;
  const adjusted = Math.round(base * recommendationMultiplier(evaluation.recommendation));
  return Math.min(100, Math.max(0, adjusted));
}

export function deriveEvaluationStatus(evaluation: ScoreFields): string {
  if (evaluation.aiEvaluationSummary && averageDimensionScores(evaluation) != null) {
    return 'COMPLETED';
  }
  if (evaluation.aiEvaluationSummary || averageDimensionScores(evaluation) != null) {
    return 'IN_PROGRESS';
  }
  return 'NOT_STARTED';
}

export async function recalculateCandidateScoresFromEvaluations(
  prisma: PrismaClient,
  organizationId: number,
  candidateId: number,
  options?: { bestalScoreOverride?: number | null },
): Promise<{ bestalScore: number | null; evaluationStatus: string }> {
  const latest = await prisma.evaluation.findFirst({
    where: {
      organizationId: BigInt(organizationId),
      candidateId: BigInt(candidateId),
      deletedAt: null,
    },
    orderBy: [{ evaluationDate: 'desc' }, { createdAt: 'desc' }],
  });

  if (!latest) {
    await prisma.candidate.update({
      where: {
        id: BigInt(candidateId),
        organizationId: BigInt(organizationId),
      },
      data: {
        evaluationStatus: 'NOT_STARTED',
      },
    });
    return { bestalScore: null, evaluationStatus: 'NOT_STARTED' };
  }

  const bestalScore =
    options?.bestalScoreOverride != null
      ? options.bestalScoreOverride
      : computeBestalScore(latest);
  const evaluationStatus = deriveEvaluationStatus(latest);

  await prisma.candidate.update({
    where: {
      id: BigInt(candidateId),
      organizationId: BigInt(organizationId),
    },
    data: {
      bestalScore,
      technicalScore: latest.technicalScore,
      communicationScore: latest.communicationScore,
      evaluationStatus,
    },
  });

  const imported = await prisma.candidate.findFirst({
    where: {
      id: BigInt(candidateId),
      organizationId: BigInt(organizationId),
      deletedAt: null,
    },
    select: { sourceCandidateId: true },
  });

  if (imported?.sourceCandidateId?.trim()) {
    await syncImportedCandidateProfileStatus(prisma, organizationId, candidateId);
  } else {
    await prisma.candidate.update({
      where: {
        id: BigInt(candidateId),
        organizationId: BigInt(organizationId),
      },
      data: { profileStatus: 'EVALUATION_COMPLETE' },
    });
  }

  return { bestalScore, evaluationStatus };
}

import {
  EVALUATION_RECOMMENDATIONS,
  EVALUATION_TYPES,
  type EvaluationRecommendationValue,
  type EvaluationTypeValue,
} from '@bestal/shared-utils';
import type {
  EvaluationExtractionFormPatch,
  EvaluationExtractionResponse,
} from './evaluation-extraction.types';

function clampScore(value: number | undefined): number | undefined {
  if (value == null || Number.isNaN(value)) return undefined;
  return Math.min(100, Math.max(0, Math.round(value)));
}

function normalizeEvaluationType(value: string | undefined): EvaluationTypeValue | undefined {
  if (!value) return undefined;
  const match = EVALUATION_TYPES.find(
    (t) => t.toLowerCase() === value.toLowerCase(),
  );
  return match;
}

function normalizeRecommendation(
  value: string | undefined,
): EvaluationRecommendationValue | undefined {
  if (!value) return undefined;
  const match = EVALUATION_RECOMMENDATIONS.find(
    (r) => r.toLowerCase() === value.toLowerCase(),
  );
  return match;
}

export function mapEvaluationExtractionToForm(
  extraction: EvaluationExtractionResponse,
  fileName: string,
): EvaluationExtractionFormPatch {
  const comments = [extraction.evaluatorComments, extraction.extractedText]
    .filter(Boolean)
    .join('\n\n')
    .trim();

  return {
    evaluatorName: extraction.evaluatorName?.trim() || undefined,
    evaluatorCompany: extraction.evaluatorCompany?.trim() || undefined,
    evaluationType: normalizeEvaluationType(extraction.evaluationType),
    evaluationDate: extraction.evaluationDate,
    technicalScore: clampScore(extraction.technicalScore),
    communicationScore: clampScore(extraction.communicationScore),
    problemSolvingScore: clampScore(extraction.problemSolvingScore),
    architectureScore: clampScore(extraction.architectureScore),
    clientReadinessScore: clampScore(extraction.clientReadinessScore),
    recommendation: normalizeRecommendation(extraction.recommendation),
    evaluatorComments: comments || undefined,
    aiEvaluationSummary: extraction.aiEvaluationSummary?.trim() || undefined,
    evaluationFileUrl: fileName,
  };
}

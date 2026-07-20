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
  const normalized = value.trim().toLowerCase();
  const exact = EVALUATION_TYPES.find((t) => t.toLowerCase() === normalized);
  if (exact) return exact;

  const aliases: Record<string, EvaluationTypeValue> = {
    'technical interview': 'Live Technical Interview',
    'live interview': 'Live Technical Interview',
    'coding assessment': 'Coding Test',
    coding: 'Coding Test',
    'system design interview': 'System Design',
    'client fit': 'Communication',
    'soft skills': 'Communication',
    overall: 'Manual Scorecard',
    scorecard: 'Manual Scorecard',
  };
  return aliases[normalized];
}

function normalizeRecommendation(
  value: string | undefined,
): EvaluationRecommendationValue | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase().replace(/[_-]+/g, ' ');
  const exact = EVALUATION_RECOMMENDATIONS.find((r) => r.toLowerCase() === normalized);
  if (exact) return exact;

  const aliases: Record<string, EvaluationRecommendationValue> = {
    rejected: 'Reject',
    reject: 'Reject',
    'no hire': 'Reject',
    'strong no hire': 'Reject',
    'do not hire': 'Reject',
    hold: 'Borderline',
    maybe: 'Borderline',
    'needs follow up': 'Borderline',
    'follow up': 'Borderline',
    'strong hire': 'Strong Hire',
    hire: 'Hire',
  };
  return aliases[normalized];
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

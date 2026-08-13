import {
  EVALUATION_RECOMMENDATIONS,
  EVALUATION_TYPES,
  type EvaluationRecommendationValue,
  type EvaluationTypeValue,
} from './evaluation-options.js';

const IMPORT_EVALUATION_TYPE_MAP: Record<string, EvaluationTypeValue> = {
  CODING_TEST: 'Coding Test',
  TECHNICAL_INTERVIEW: 'Live Technical Interview',
  SYSTEM_DESIGN: 'System Design',
  PLATFORM_SPECIFIC: 'Platform-Specific',
  COMMUNICATION: 'Communication',
  FUNCTIONAL: 'Functional',
  MANUAL_SCORECARD: 'Manual Scorecard',
};

const IMPORT_RECOMMENDATION_MAP: Record<string, EvaluationRecommendationValue> = {
  STRONG_HIRE: 'Strong Hire',
  HIRE: 'Hire',
  BORDERLINE: 'Borderline',
  REJECT: 'Reject',
};

function slugKey(value: string): string {
  return value.trim().toUpperCase().replace(/[\s-]+/g, '_');
}

/** Normalize import slug or UI label to API evaluation type. */
export function normalizeEvaluationType(
  value: string | null | undefined,
): EvaluationTypeValue | undefined {
  if (!value?.trim()) return undefined;
  const trimmed = value.trim();
  const slug = slugKey(trimmed);
  if (slug in IMPORT_EVALUATION_TYPE_MAP) {
    return IMPORT_EVALUATION_TYPE_MAP[slug];
  }
  const exact = EVALUATION_TYPES.find((item) => item.toLowerCase() === trimmed.toLowerCase());
  return exact;
}

/** Normalize import slug or UI label to API recommendation. */
export function normalizeEvaluationRecommendation(
  value: string | null | undefined,
): EvaluationRecommendationValue | undefined {
  if (!value?.trim()) return undefined;
  const trimmed = value.trim();
  const slug = slugKey(trimmed);
  if (slug in IMPORT_RECOMMENDATION_MAP) {
    return IMPORT_RECOMMENDATION_MAP[slug];
  }
  const exact = EVALUATION_RECOMMENDATIONS.find(
    (item) => item.toLowerCase() === trimmed.toLowerCase(),
  );
  if (exact) return exact;
  const normalized = trimmed.toLowerCase().replace(/[_-]+/g, ' ');
  const aliases: Record<string, EvaluationRecommendationValue> = {
    rejected: 'Reject',
    reject: 'Reject',
    'no hire': 'Reject',
    hold: 'Borderline',
    maybe: 'Borderline',
    'strong hire': 'Strong Hire',
    hire: 'Hire',
  };
  return aliases[normalized];
}

export function fileNameFromEvaluationFileUrl(url: string | null | undefined): string {
  if (!url?.trim()) return '';
  const raw = url.trim();
  try {
    if (raw.includes('://')) {
      const path = new URL(raw).pathname;
      const name = path.split('/').pop();
      if (name) return decodeURIComponent(name);
    }
  } catch {
    /* ignore malformed URLs */
  }
  const segment = raw.split('/').pop();
  return segment ? decodeURIComponent(segment) : raw;
}

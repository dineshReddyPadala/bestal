export const EVALUATION_TYPES = [
  'Coding Test',
  'Live Technical Interview',
  'System Design',
  'Platform-Specific',
  'Communication',
  'Functional',
  'Manual Scorecard',
] as const;

export type EvaluationTypeValue = (typeof EVALUATION_TYPES)[number];

export const EVALUATION_RECOMMENDATIONS = [
  'Strong Hire',
  'Hire',
  'Borderline',
  'Reject',
] as const;

export type EvaluationRecommendationValue = (typeof EVALUATION_RECOMMENDATIONS)[number];

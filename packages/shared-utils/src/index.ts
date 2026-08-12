import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

export function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export {
  EVALUATION_TYPES,
  EVALUATION_RECOMMENDATIONS,
  type EvaluationTypeValue,
  type EvaluationRecommendationValue,
} from './evaluation-options.js';

export {
  CANDIDATE_AVAILABILITY_STATUSES,
  CANDIDATE_AVAILABILITY_LABELS,
  CANDIDATE_PROFILE_STATUSES,
  CANDIDATE_PROFILE_STATUS_LABELS,
  CANDIDATE_VISIBILITY_STATUSES,
  CANDIDATE_VISIBILITY_LABELS,
  type CandidateAvailabilityStatusValue,
  type CandidateProfileStatusValue,
  type CandidateVisibilityStatusValue,
} from './candidate-options.js';

export {
  IMPORT_WORKBOOK_SHEETS,
  IMPORT_DATA_SHEETS,
  IMPORT_METADATA_SHEETS,
  IMPORT_UPLOAD_REQUIRED_SHEETS,
  IMPORT_TEMPLATE_SHEETS,
  IMPORT_REQUIRED_SHEETS,
  IMPORT_SKILL_COMMUNITY_ALIASES,
  CANDIDATE_SHEET_COLUMNS,
  SKILLS_SHEET_COLUMNS,
  EVALUATION_SHEET_COLUMNS,
  BGV_SHEET_COLUMNS,
  SCORES_SHEET_COLUMNS,
  CANDIDATE_REQUIRED_FIELDS,
  IMPORT_SKILL_COMMUNITIES,
  IMPORT_AVAILABILITY_STATUSES,
  IMPORT_EVALUATION_TYPES,
  IMPORT_BGV_STATUSES,
  IMPORT_CANDIDATE_SOURCES,
  IMPORT_PROFICIENCY_LEVELS,
  IMPORT_RECOMMENDATION_VALUES,
  IMPORT_CURRENCIES,
  IMPORT_TIMEZONES,
  IMPORT_SCORE_SOURCES,
  IMPORT_INSTRUCTIONS,
  slugifySkillCommunity,
  type ImportSkillCommunity,
  type ImportAvailabilityStatus,
  type ImportEvaluationType,
  type ImportBgvStatus,
  type ImportCandidateSource,
  type ImportProficiencyLevel,
  type ImportRecommendationValue,
  type ImportCurrency,
  type ImportScoreSource,
} from './candidate-import-contract.js';

export {
  PUBLIC_SKILL_COMMUNITIES,
  HOW_IT_WORKS_STEPS,
  FOR_CLIENTS_BENEFITS,
  FOR_TALENT_BENEFITS,
} from './public-content.js';

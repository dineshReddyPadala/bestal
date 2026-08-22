import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'USD', locale = 'en-US') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export type OrgDateFormat = 'MMM d, yyyy' | 'dd/MM/yyyy' | 'yyyy-MM-dd';

export type OrgFormatSettings = {
  dateFormat: OrgDateFormat;
  locale: string;
};

export const DEFAULT_ORG_FORMAT: OrgFormatSettings = {
  dateFormat: 'MMM d, yyyy',
  locale: 'en-US',
};

export function formatOrgDate(
  date: string,
  settings: OrgFormatSettings = DEFAULT_ORG_FORMAT,
): string {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;

  switch (settings.dateFormat) {
    case 'dd/MM/yyyy':
      return new Intl.DateTimeFormat(settings.locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(parsed);
    case 'yyyy-MM-dd':
      return parsed.toISOString().slice(0, 10);
    case 'MMM d, yyyy':
    default:
      return new Intl.DateTimeFormat(settings.locale, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(parsed);
  }
}

/** @deprecated Prefer formatOrgDate with organization settings from useOrgSettings(). */
export function formatDate(date: string) {
  return formatOrgDate(date);
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
  TIMEZONE_OPTIONS,
  IMPORT_TIMEZONE_VALUES,
  type TimezoneOption,
} from './timezones.js';

export {
  EVALUATION_TYPES,
  EVALUATION_RECOMMENDATIONS,
  type EvaluationTypeValue,
  type EvaluationRecommendationValue,
} from './evaluation-options.js';

export {
  normalizeEvaluationType,
  normalizeEvaluationRecommendation,
  fileNameFromEvaluationFileUrl,
} from './evaluation-normalize.js';

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
  DEPRECATED_SCORES_SHEET_COLUMNS,
  CANDIDATE_REQUIRED_FIELDS,
  IMPORT_SKILL_COMMUNITIES,
  IMPORT_AVAILABILITY_STATUSES,
  IMPORT_EVALUATION_TYPES,
  IMPORT_BGV_STATUSES,
  IMPORT_BGV_PER_CHECK_STATUSES,
  IMPORT_BGV_PACKAGE_TYPES,
  IMPORT_CANDIDATE_SOURCES,
  CANDIDATE_SOURCE_OPTIONS,
  CANDIDATE_SOURCE_LABELS,
  LEGACY_CANDIDATE_SOURCES,
  IMPORT_PROFICIENCY_LEVELS,
  IMPORT_RECOMMENDATION_VALUES,
  IMPORT_CURRENCIES,
  IMPORT_PREFERRED_ENGAGEMENTS,
  IMPORT_PREFERRED_SHIFTS,
  IMPORT_TIMEZONES,
  IMPORT_SCORE_SOURCES,
  IMPORT_INSTRUCTIONS,
  slugifySkillCommunity,
  type ImportSkillCommunity,
  type ImportAvailabilityStatus,
  type ImportEvaluationType,
  type ImportBgvStatus,
  type ImportBgvPerCheckStatus,
  type ImportBgvPackageType,
  type ImportCandidateSource,
  type ImportProficiencyLevel,
  type ImportRecommendationValue,
  type ImportCurrency,
  type ImportPreferredEngagement,
  type ImportPreferredShift,
  type ImportScoreSource,
} from './candidate-import-contract.js';

export { parseNoticePeriodToDays } from './notice-period.js';

export {
  formatBgvCheckStatusesSummary,
  displayBgvResultSummary,
  resolveBgvResultSummaryForImport,
  hasAnyBgvCheckStatus,
  isPlaceholderBgvSummary,
  formatBgvStatusLabel,
  BGV_PER_CHECK_STATUS_OPTIONS,
  type BgvCheckStatusFields,
} from './bgv-check-summary.js';

export {
  PUBLIC_SKILL_COMMUNITIES,
  HOW_IT_WORKS_STEPS,
  FOR_CLIENTS_BENEFITS,
  FOR_TALENT_BENEFITS,
} from './public-content.js';
export { COLLABORATION_CULTURAL_FIT_LABEL } from './evaluation-labels.js';

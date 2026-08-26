/**
 * Canonical BesTal Candidate Data Import workbook contract.
 * One template for every ATS — no vendor-specific parsing branches.
 */

import { BGV_PER_CHECK_STATUS_OPTIONS } from './bgv-check-summary.js';
import { EVALUATION_RECOMMENDATIONS, EVALUATION_TYPES } from './evaluation-options.js';

export const IMPORT_WORKBOOK_SHEETS = {
  CANDIDATE: 'Candidate',
  SKILLS: 'Skills',
  EVALUATION: 'Evaluation',
  BGV: 'Background Verification',
  SCORES: 'Scores',
  SKILL_COMMUNITIES: 'Skill Communities_values',
  AVAILABILITY_STATUS: 'Availability Status_values',
  EVALUATION_TYPES: 'Evaluation Types_values',
  BGV_STATUS: 'BGV Status_values',
  CANDIDATE_SOURCES: 'Candidate Sources_values',
  PROFICIENCY_LEVELS: 'Proficiency Levels_values',
  RECOMMENDATION_VALUES: 'Recommendation Values_values',
  CURRENCY: 'Currency_values',
  TIMEZONES: 'Timezones_values',
  PREFERRED_SHIFTS: 'Preferred Shifts_values',
  PREFERRED_ENGAGEMENTS: 'Preferred Engagements_values',
  BGV_PER_CHECK_STATUS: 'BGV Per Check Status_values',
  BGV_PACKAGE_TYPES: 'BGV Package Types_values',
  SCORE_SOURCES: 'Score Sources_values',
  IMPORT_INSTRUCTIONS: 'Import Instructions',
} as const;

export const IMPORT_DATA_SHEETS = [
  IMPORT_WORKBOOK_SHEETS.CANDIDATE,
  IMPORT_WORKBOOK_SHEETS.SKILLS,
  IMPORT_WORKBOOK_SHEETS.EVALUATION,
  IMPORT_WORKBOOK_SHEETS.BGV,
  IMPORT_WORKBOOK_SHEETS.SCORES,
] as const;

export const IMPORT_METADATA_SHEETS = [
  IMPORT_WORKBOOK_SHEETS.SKILL_COMMUNITIES,
  IMPORT_WORKBOOK_SHEETS.AVAILABILITY_STATUS,
  IMPORT_WORKBOOK_SHEETS.EVALUATION_TYPES,
  IMPORT_WORKBOOK_SHEETS.BGV_STATUS,
  IMPORT_WORKBOOK_SHEETS.CANDIDATE_SOURCES,
  IMPORT_WORKBOOK_SHEETS.PROFICIENCY_LEVELS,
  IMPORT_WORKBOOK_SHEETS.RECOMMENDATION_VALUES,
  IMPORT_WORKBOOK_SHEETS.CURRENCY,
  IMPORT_WORKBOOK_SHEETS.TIMEZONES,
  IMPORT_WORKBOOK_SHEETS.PREFERRED_SHIFTS,
  IMPORT_WORKBOOK_SHEETS.PREFERRED_ENGAGEMENTS,
  IMPORT_WORKBOOK_SHEETS.BGV_PER_CHECK_STATUS,
  IMPORT_WORKBOOK_SHEETS.BGV_PACKAGE_TYPES,
  IMPORT_WORKBOOK_SHEETS.SCORE_SOURCES,
  IMPORT_WORKBOOK_SHEETS.IMPORT_INSTRUCTIONS,
] as const;

/** Sheets that must be present in an uploaded workbook (metadata tabs are optional). */
export const IMPORT_UPLOAD_REQUIRED_SHEETS = IMPORT_DATA_SHEETS;

/** All sheets generated in the downloadable template (data + metadata + instructions). */
export const IMPORT_TEMPLATE_SHEETS = [
  ...IMPORT_DATA_SHEETS,
  ...IMPORT_METADATA_SHEETS,
] as const;

/** @deprecated Prefer IMPORT_TEMPLATE_SHEETS or IMPORT_UPLOAD_REQUIRED_SHEETS. */
export const IMPORT_REQUIRED_SHEETS = IMPORT_TEMPLATE_SHEETS;

/** Common ATS / legacy labels mapped to canonical DB skill community names. */
export const IMPORT_SKILL_COMMUNITY_ALIASES: Record<string, string> = {
  'DevOps & Cloud': 'Cloud / DevOps',
  'Machine Learning': 'AI / GenAI',
  'Mobile Development': 'Mobile',
};

export const CANDIDATE_SHEET_COLUMNS = [
  'candidate_id',
  'first_name',
  'last_name',
  'email',
  'phone',
  'location',
  'country',
  'timezone',
  'headline',
  'years_experience',
  'primary_role',
  'skill_community',
  'ai_summary',
  'strengths',
  'weaknesses',
  'availability_status',
  'available_from',
  'bill_rate',
  'pay_rate',
  'currency',
  'source',
  'linkedin_url',
  'github_url',
  'portfolio_url',
  'current_company',
  'current_title',
  'education',
  'notice_period_days',
  'preferred_shift',
  'preferred_engagement',
  'min_hours_per_week',
  'max_hours_per_week',
  'hours_per_week',
  'resume_url',
] as const;

export const SKILLS_SHEET_COLUMNS = [
  'candidate_id',
  'skill_name',
  'proficiency',
  'years_experience',
  'is_primary',
] as const;

export const EVALUATION_SHEET_COLUMNS = [
  'candidate_id',
  'evaluation_type',
  'evaluation_date',
  'evaluator_name',
  'evaluator_company',
  'technical_score',
  'communication_score',
  'problem_solving_score',
  'collaboration_cultural_fit_score',
  'client_readiness_score',
  'recommendation',
  'evaluation_summary',
  'ai_evaluation_summary',
  'comments',
] as const;

export const BGV_SHEET_COLUMNS = [
  'candidate_id',
  'bgv_status',
  'package_type',
  'vendor',
  'id_check_status',
  'employment_check_status',
  'criminal_check_status',
  'initiated_date',
  'completed_date',
  'bgv_summary',
  'concern_notes',
] as const;

export const SCORES_SHEET_COLUMNS = [
  'candidate_id',
  'bestal_score',
  'reliability_score',
  'score_source',
  'score_date',
] as const;

/** Removed from Scores sheet — dimension scores belong on Evaluation rows only. */
export const DEPRECATED_SCORES_SHEET_COLUMNS = [
  'technical_score',
  'communication_score',
  'problem_solving_score',
  'collaboration_cultural_fit_score',
  'client_readiness_score',
] as const;

export const CANDIDATE_REQUIRED_FIELDS = [
  'candidate_id',
  'first_name',
  'last_name',
  'years_experience',
  'primary_role',
  'source',
] as const;

export const IMPORT_SKILL_COMMUNITIES = [
  'Data Engineering',
  'AI / GenAI',
  'Cloud / DevOps',
  'QA Automation',
  'Frontend',
  'Backend',
  'Full Stack',
  'Mobile',
  'Cybersecurity',
  'SAP',
  'Salesforce',
  'ServiceNow',
] as const;

export const IMPORT_AVAILABILITY_STATUSES = [
  'AVAILABLE',
  'IMMEDIATE',
  'ONE_WEEK',
  'TWO_WEEKS',
  'THIRTY_DAYS',
  'FUTURE',
  'NOT_AVAILABLE',
] as const;

/** @deprecated Use EVALUATION_TYPES — template dropdowns use UI labels. */
export const IMPORT_EVALUATION_TYPES = EVALUATION_TYPES;

/** Matches Prisma BackgroundCheckStatus enum values. */
export const IMPORT_BGV_STATUSES = [
  'NOT_STARTED',
  'PENDING',
  'CONSENT_PENDING',
  'INITIATED',
  'IN_PROGRESS',
  'CLEAR',
  'CONSIDER',
  'COMPLETED_CLEAR',
  'COMPLETED_WITH_CONCERN',
  'SUSPENDED',
  'FAILED',
  'CANCELLED',
  'EXPIRED',
] as const;

export const IMPORT_BGV_PER_CHECK_STATUSES = BGV_PER_CHECK_STATUS_OPTIONS;

/** Matches Prisma BackgroundCheckType enum values. */
export const IMPORT_BGV_PACKAGE_TYPES = [
  'COMPREHENSIVE',
  'CRIMINAL',
  'EMPLOYMENT',
  'EDUCATION',
  'REFERENCE',
  'IDENTITY',
  'CREDIT',
] as const;

export const IMPORT_CANDIDATE_SOURCES = [
  'OORWIN',
  'WORKDAY',
  'GREENHOUSE',
  'LEVER',
  'BULLHORN',
  'ZOHO_RECRUIT',
  'LINKEDIN',
  'INDEED',
  'REFERRAL',
  'CAREER_PAGE',
  'AGENCY',
  'OTHER',
] as const;

/** Legacy manual-entry sources kept for candidates created before import alignment. */
export const LEGACY_CANDIDATE_SOURCES = ['DIRECT', 'JOB_BOARD', 'INTERNAL'] as const;

/** Canonical source values for wizard UI, validation, and API (import + legacy). */
export const CANDIDATE_SOURCE_OPTIONS = [
  ...IMPORT_CANDIDATE_SOURCES,
  ...LEGACY_CANDIDATE_SOURCES,
] as const;

export const CANDIDATE_SOURCE_LABELS: Record<(typeof CANDIDATE_SOURCE_OPTIONS)[number], string> = {
  OORWIN: 'Oorwin',
  WORKDAY: 'Workday',
  GREENHOUSE: 'Greenhouse',
  LEVER: 'Lever',
  BULLHORN: 'Bullhorn',
  ZOHO_RECRUIT: 'Zoho Recruit',
  LINKEDIN: 'LinkedIn',
  INDEED: 'Indeed',
  REFERRAL: 'Referral',
  CAREER_PAGE: 'Career Page',
  AGENCY: 'Agency',
  OTHER: 'Other',
  DIRECT: 'Direct',
  JOB_BOARD: 'Job Board',
  INTERNAL: 'Internal',
};

export const IMPORT_PROFICIENCY_LEVELS = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Expert',
] as const;

export const IMPORT_RECOMMENDATION_VALUES = EVALUATION_RECOMMENDATIONS;

export const IMPORT_PREFERRED_ENGAGEMENTS = [
  'FULL_TIME',
  'PART_TIME',
  'CONTRACT',
  'FREELANCE',
] as const;

export const IMPORT_PREFERRED_SHIFTS = [
  'IST Morning',
  'IST Evening',
  'US Eastern',
  'US Pacific',
  'Flexible',
  'Custom/Other',
] as const;

export const IMPORT_CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'] as const;

export { IMPORT_TIMEZONE_VALUES as IMPORT_TIMEZONES } from './timezones.js';

export const IMPORT_SCORE_SOURCES = [
  'ATS_AI',
  'BESTAL_AI',
  'RECRUITER',
  'MANUAL',
  'INTERVIEWER',
] as const;

export const IMPORT_INSTRUCTIONS = [
  'Do not rename sheet names.',
  'Do not modify column headers.',
  'Use dropdowns in highlighted (yellow) columns — do not type free text for master data values.',
  'candidate_id is mandatory on every data sheet row.',
  'candidate_id must be unique within the Candidate sheet.',
  'availability_status and available_from are required on every Candidate row.',
  'All related sheets must reference the same candidate_id.',
  'Multiple skills require multiple rows in the Skills sheet.',
  'Evaluation dimension scores (technical, communication, etc.) belong on the Evaluation sheet only.',
  'Scores sheet holds aggregate bestal_score and reliability_score only.',
  'All score values must be integers from 0 to 100.',
  'notice_period_days is the notice period in calendar days (single column).',
  'years_experience accepts decimals (e.g. 3.6) from 0 to 60.',
  'Dates must use YYYY-MM-DD. Evaluation and score dates cannot be in the future when scores are provided.',
  'Multiple values in a single field use | as the separator.',
  'AI-generated fields are optional and imported exactly as provided.',
  'Missing AI fields remain blank — BesTal does not run AI during import.',
  'After import, edit candidates to update evaluation/BGV and submit for approval when ready.',
  'The template is generic and supports any ATS.',
] as const;

export type ImportSkillCommunity = (typeof IMPORT_SKILL_COMMUNITIES)[number];
export type ImportAvailabilityStatus = (typeof IMPORT_AVAILABILITY_STATUSES)[number];
export type ImportEvaluationType = (typeof IMPORT_EVALUATION_TYPES)[number];
export type ImportRecommendationValue = (typeof IMPORT_RECOMMENDATION_VALUES)[number];
export type ImportBgvStatus = (typeof IMPORT_BGV_STATUSES)[number];
export type ImportCandidateSource = (typeof IMPORT_CANDIDATE_SOURCES)[number];
export type ImportProficiencyLevel = (typeof IMPORT_PROFICIENCY_LEVELS)[number];
export type ImportCurrency = (typeof IMPORT_CURRENCIES)[number];
export type ImportPreferredEngagement = (typeof IMPORT_PREFERRED_ENGAGEMENTS)[number];
export type ImportPreferredShift = (typeof IMPORT_PREFERRED_SHIFTS)[number];
export type ImportBgvPerCheckStatus = (typeof IMPORT_BGV_PER_CHECK_STATUSES)[number];
export type ImportBgvPackageType = (typeof IMPORT_BGV_PACKAGE_TYPES)[number];
export type ImportScoreSource = (typeof IMPORT_SCORE_SOURCES)[number];

export function slugifySkillCommunity(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Canonical BesTal Candidate Data Import workbook contract.
 * One template for every ATS — no vendor-specific parsing branches.
 */

export const IMPORT_WORKBOOK_SHEETS = {
  CANDIDATE: 'Candidate',
  SKILLS: 'Skills',
  EVALUATION: 'Evaluation',
  BGV: 'Background Verification',
  SCORES: 'Scores',
  SKILL_COMMUNITIES: 'Skill Communities',
  AVAILABILITY_STATUS: 'Availability Status',
  EVALUATION_TYPES: 'Evaluation Types',
  BGV_STATUS: 'BGV Status',
  CANDIDATE_SOURCES: 'Candidate Sources',
  PROFICIENCY_LEVELS: 'Proficiency Levels',
  RECOMMENDATION_VALUES: 'Recommendation Values',
  CURRENCY: 'Currency',
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
  IMPORT_WORKBOOK_SHEETS.IMPORT_INSTRUCTIONS,
] as const;

export const IMPORT_REQUIRED_SHEETS = [
  ...IMPORT_DATA_SHEETS,
  ...IMPORT_METADATA_SHEETS,
] as const;

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
  'summary',
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
  'notice_period',
  'preferred_shift',
  'timezone_overlap',
  'resume_url',
] as const;

export const SKILLS_SHEET_COLUMNS = [
  'candidate_id',
  'skill_name',
  'skill_category',
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
  'architecture_score',
  'client_readiness_score',
  'recommendation',
  'evaluation_summary',
  'ai_evaluation_summary',
  'comments',
] as const;

export const BGV_SHEET_COLUMNS = [
  'candidate_id',
  'bgv_status',
  'vendor',
  'id_check_status',
  'address_check_status',
  'employment_check_status',
  'education_check_status',
  'criminal_check_status',
  'reference_check_status',
  'initiated_date',
  'completed_date',
  'bgv_summary',
  'concern_notes',
] as const;

export const SCORES_SHEET_COLUMNS = [
  'candidate_id',
  'bestal_score',
  'technical_score',
  'communication_score',
  'problem_solving_score',
  'architecture_score',
  'reliability_score',
  'client_readiness_score',
  'score_source',
  'score_date',
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

export const IMPORT_EVALUATION_TYPES = [
  'CODING_TEST',
  'TECHNICAL_INTERVIEW',
  'SYSTEM_DESIGN',
  'PLATFORM_SPECIFIC',
  'COMMUNICATION',
  'FUNCTIONAL',
  'MANUAL_SCORECARD',
] as const;

export const IMPORT_BGV_STATUSES = [
  'NOT_STARTED',
  'CONSENT_PENDING',
  'INITIATED',
  'IN_PROGRESS',
  'COMPLETED_CLEAR',
  'COMPLETED_WITH_CONCERN',
  'FAILED',
  'EXPIRED',
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

export const IMPORT_PROFICIENCY_LEVELS = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Expert',
] as const;

export const IMPORT_RECOMMENDATION_VALUES = [
  'STRONG_HIRE',
  'HIRE',
  'BORDERLINE',
  'REJECT',
] as const;

export const IMPORT_CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'] as const;

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
  'candidate_id is mandatory on every data sheet row.',
  'candidate_id must be unique within the Candidate sheet.',
  'All related sheets must reference the same candidate_id.',
  'Multiple skills require multiple rows in the Skills sheet.',
  'Scores must be between 0 and 100.',
  'Dates must use YYYY-MM-DD.',
  'Multiple values in a single field use | as the separator.',
  'AI-generated fields are optional.',
  'AI fields will be imported exactly as provided.',
  'Missing AI fields remain blank.',
  'AI processing is not triggered during import.',
  'Candidates require Recruiter Review and Admin Approval after import.',
  'The template is generic and supports any ATS.',
  'Import candidates exactly as provided — BesTal will not recalculate scores or generate summaries.',
] as const;

export type ImportSkillCommunity = (typeof IMPORT_SKILL_COMMUNITIES)[number];
export type ImportAvailabilityStatus = (typeof IMPORT_AVAILABILITY_STATUSES)[number];
export type ImportEvaluationType = (typeof IMPORT_EVALUATION_TYPES)[number];
export type ImportBgvStatus = (typeof IMPORT_BGV_STATUSES)[number];
export type ImportCandidateSource = (typeof IMPORT_CANDIDATE_SOURCES)[number];
export type ImportProficiencyLevel = (typeof IMPORT_PROFICIENCY_LEVELS)[number];
export type ImportRecommendationValue = (typeof IMPORT_RECOMMENDATION_VALUES)[number];
export type ImportCurrency = (typeof IMPORT_CURRENCIES)[number];
export type ImportScoreSource = (typeof IMPORT_SCORE_SOURCES)[number];

export function slugifySkillCommunity(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

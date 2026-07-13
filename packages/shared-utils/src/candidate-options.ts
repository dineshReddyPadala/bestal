export const CANDIDATE_AVAILABILITY_STATUSES = [
  'IMMEDIATE',
  'ONE_WEEK',
  'TWO_WEEKS',
  'THIRTY_DAYS',
  'FUTURE',
  'NOT_AVAILABLE',
] as const;

export type CandidateAvailabilityStatusValue = (typeof CANDIDATE_AVAILABILITY_STATUSES)[number];

export const CANDIDATE_AVAILABILITY_LABELS: Record<CandidateAvailabilityStatusValue, string> = {
  IMMEDIATE: 'Immediate',
  ONE_WEEK: '1 Week',
  TWO_WEEKS: '2 Weeks',
  THIRTY_DAYS: '30 Days',
  FUTURE: 'Future',
  NOT_AVAILABLE: 'Not Available',
};

export const CANDIDATE_PROFILE_STATUSES = [
  'SOURCED',
  'AI_SCREENED',
  'RECRUITER_SCREENED',
  'EVALUATION_PENDING',
  'EVALUATION_COMPLETE',
  'BGV_PENDING',
  'BGV_COMPLETE',
  'PROFILE_DRAFT',
  'ADMIN_APPROVED',
  'CLIENT_VISIBLE',
  'SHORTLISTED',
  'TRIAL',
  'DEPLOYED',
  'REJECTED',
  'INACTIVE',
] as const;

export type CandidateProfileStatusValue = (typeof CANDIDATE_PROFILE_STATUSES)[number];

export const CANDIDATE_PROFILE_STATUS_LABELS: Record<CandidateProfileStatusValue, string> = {
  SOURCED: 'Sourced',
  AI_SCREENED: 'AI Screened',
  RECRUITER_SCREENED: 'Recruiter Screened',
  EVALUATION_PENDING: 'Evaluation Pending',
  EVALUATION_COMPLETE: 'Evaluation Complete',
  BGV_PENDING: 'BGV Pending',
  BGV_COMPLETE: 'BGV Complete',
  PROFILE_DRAFT: 'Profile Draft',
  ADMIN_APPROVED: 'Admin Approved',
  CLIENT_VISIBLE: 'Client Visible',
  SHORTLISTED: 'Shortlisted',
  TRIAL: 'Trial',
  DEPLOYED: 'Deployed',
  REJECTED: 'Rejected',
  INACTIVE: 'Inactive',
};

export const CANDIDATE_VISIBILITY_STATUSES = [
  'INTERNAL_ONLY',
  'CLIENT_VISIBLE',
  'HIDDEN',
] as const;

export type CandidateVisibilityStatusValue = (typeof CANDIDATE_VISIBILITY_STATUSES)[number];

export const CANDIDATE_VISIBILITY_LABELS: Record<CandidateVisibilityStatusValue, string> = {
  INTERNAL_ONLY: 'Internal Only',
  CLIENT_VISIBLE: 'Client Visible',
  HIDDEN: 'Hidden',
};

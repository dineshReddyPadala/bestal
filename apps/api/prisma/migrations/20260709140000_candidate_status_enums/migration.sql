-- Candidate availability, profile, and visibility status enums

CREATE TYPE "CandidateAvailabilityStatus" AS ENUM (
  'IMMEDIATE',
  'ONE_WEEK',
  'TWO_WEEKS',
  'THIRTY_DAYS',
  'FUTURE',
  'NOT_AVAILABLE'
);

CREATE TYPE "CandidateProfileStatus" AS ENUM (
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
  'INACTIVE'
);

ALTER TYPE "CandidateVisibility" RENAME VALUE 'DRAFT' TO 'INTERNAL_ONLY';
ALTER TYPE "CandidateVisibility" RENAME VALUE 'PUBLISHED' TO 'CLIENT_VISIBLE';

ALTER TABLE "candidates" ALTER COLUMN "availability_status" TYPE "CandidateAvailabilityStatus"
  USING (
    CASE lower(coalesce("availability_status", ''))
      WHEN 'immediate' THEN 'IMMEDIATE'::"CandidateAvailabilityStatus"
      WHEN 'available' THEN 'IMMEDIATE'::"CandidateAvailabilityStatus"
      WHEN '1 week' THEN 'ONE_WEEK'::"CandidateAvailabilityStatus"
      WHEN 'one_week' THEN 'ONE_WEEK'::"CandidateAvailabilityStatus"
      WHEN '2 weeks' THEN 'TWO_WEEKS'::"CandidateAvailabilityStatus"
      WHEN 'two_weeks' THEN 'TWO_WEEKS'::"CandidateAvailabilityStatus"
      WHEN '30 days' THEN 'THIRTY_DAYS'::"CandidateAvailabilityStatus"
      WHEN 'thirty_days' THEN 'THIRTY_DAYS'::"CandidateAvailabilityStatus"
      WHEN 'future' THEN 'FUTURE'::"CandidateAvailabilityStatus"
      WHEN 'partially_available' THEN 'FUTURE'::"CandidateAvailabilityStatus"
      WHEN 'on_notice' THEN 'ONE_WEEK'::"CandidateAvailabilityStatus"
      WHEN 'not available' THEN 'NOT_AVAILABLE'::"CandidateAvailabilityStatus"
      WHEN 'not_available' THEN 'NOT_AVAILABLE'::"CandidateAvailabilityStatus"
      ELSE NULL
    END
  );

ALTER TABLE "candidates" ALTER COLUMN "profile_status" TYPE "CandidateProfileStatus"
  USING (
    CASE upper(coalesce("profile_status", ''))
      WHEN 'SOURCED' THEN 'SOURCED'::"CandidateProfileStatus"
      WHEN 'AI_SCREENED' THEN 'AI_SCREENED'::"CandidateProfileStatus"
      WHEN 'RECRUITER_SCREENED' THEN 'RECRUITER_SCREENED'::"CandidateProfileStatus"
      WHEN 'EVALUATION_PENDING' THEN 'EVALUATION_PENDING'::"CandidateProfileStatus"
      WHEN 'EVALUATION_COMPLETE' THEN 'EVALUATION_COMPLETE'::"CandidateProfileStatus"
      WHEN 'BGV_PENDING' THEN 'BGV_PENDING'::"CandidateProfileStatus"
      WHEN 'BGV_COMPLETE' THEN 'BGV_COMPLETE'::"CandidateProfileStatus"
      WHEN 'PROFILE_DRAFT' THEN 'PROFILE_DRAFT'::"CandidateProfileStatus"
      WHEN 'ADMIN_APPROVED' THEN 'ADMIN_APPROVED'::"CandidateProfileStatus"
      WHEN 'CLIENT_VISIBLE' THEN 'CLIENT_VISIBLE'::"CandidateProfileStatus"
      WHEN 'SHORTLISTED' THEN 'SHORTLISTED'::"CandidateProfileStatus"
      WHEN 'TRIAL' THEN 'TRIAL'::"CandidateProfileStatus"
      WHEN 'DEPLOYED' THEN 'DEPLOYED'::"CandidateProfileStatus"
      WHEN 'REJECTED' THEN 'REJECTED'::"CandidateProfileStatus"
      WHEN 'INACTIVE' THEN 'INACTIVE'::"CandidateProfileStatus"
      WHEN 'ACTIVE' THEN 'PROFILE_DRAFT'::"CandidateProfileStatus"
      ELSE 'PROFILE_DRAFT'::"CandidateProfileStatus"
    END
  );

ALTER TABLE "candidates" ALTER COLUMN "profile_status" SET DEFAULT 'PROFILE_DRAFT';
ALTER TABLE "candidates" ALTER COLUMN "visibility" SET DEFAULT 'INTERNAL_ONLY';

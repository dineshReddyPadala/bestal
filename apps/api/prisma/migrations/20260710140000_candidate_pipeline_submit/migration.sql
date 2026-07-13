-- Candidate pipeline: default sourced status and submit-for-approval timestamp

ALTER TABLE "candidates" ADD COLUMN IF NOT EXISTS "submitted_for_approval_at" TIMESTAMP(3);

ALTER TABLE "candidates" ALTER COLUMN "profile_status" SET DEFAULT 'SOURCED';

UPDATE "candidates"
SET "profile_status" = 'SOURCED'
WHERE "profile_status" = 'PROFILE_DRAFT'
  AND "submitted_for_approval_at" IS NULL
  AND "approved_at" IS NULL;

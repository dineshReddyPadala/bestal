-- Standard Candidate Data Import schema alignment

-- Enum extensions (additive)
ALTER TYPE "CandidateStatus" ADD VALUE IF NOT EXISTS 'IMPORTED';
ALTER TYPE "CandidateAvailabilityStatus" ADD VALUE IF NOT EXISTS 'AVAILABLE';
ALTER TYPE "CandidateProfileStatus" ADD VALUE IF NOT EXISTS 'IMPORTED';
ALTER TYPE "CandidateApprovalStatus" ADD VALUE IF NOT EXISTS 'PENDING_REVIEW';

DO $$ BEGIN
  CREATE TYPE "AiScreeningStatus" AS ENUM ('NOT_SCREENED', 'IMPORTED', 'COMPLETED', 'FAILED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "CandidateScoreSource" AS ENUM ('ATS_AI', 'BESTAL_AI', 'RECRUITER', 'MANUAL', 'INTERVIEWER');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "CandidateImportBatchStatus" AS ENUM ('PREVIEWED', 'CONFIRMING', 'PROCESSING', 'COMPLETED', 'FAILED', 'EXPIRED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "CandidateImportRowAction" AS ENUM ('CREATE', 'UPDATE', 'SKIP', 'FAIL');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TYPE "CandidateSource" ADD VALUE IF NOT EXISTS 'OORWIN';
ALTER TYPE "CandidateSource" ADD VALUE IF NOT EXISTS 'WORKDAY';
ALTER TYPE "CandidateSource" ADD VALUE IF NOT EXISTS 'GREENHOUSE';
ALTER TYPE "CandidateSource" ADD VALUE IF NOT EXISTS 'LEVER';
ALTER TYPE "CandidateSource" ADD VALUE IF NOT EXISTS 'BULLHORN';
ALTER TYPE "CandidateSource" ADD VALUE IF NOT EXISTS 'ZOHO_RECRUIT';
ALTER TYPE "CandidateSource" ADD VALUE IF NOT EXISTS 'INDEED';
ALTER TYPE "CandidateSource" ADD VALUE IF NOT EXISTS 'CAREER_PAGE';

ALTER TYPE "BackgroundCheckStatus" ADD VALUE IF NOT EXISTS 'CONSENT_PENDING';
ALTER TYPE "BackgroundCheckStatus" ADD VALUE IF NOT EXISTS 'INITIATED';
ALTER TYPE "BackgroundCheckStatus" ADD VALUE IF NOT EXISTS 'COMPLETED_CLEAR';
ALTER TYPE "BackgroundCheckStatus" ADD VALUE IF NOT EXISTS 'COMPLETED_WITH_CONCERN';
ALTER TYPE "BackgroundCheckStatus" ADD VALUE IF NOT EXISTS 'EXPIRED';

-- Candidate field extensions
ALTER TABLE "candidates"
  ADD COLUMN IF NOT EXISTS "source_candidate_id" VARCHAR(150),
  ADD COLUMN IF NOT EXISTS "country" VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "timezone" VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "current_title" VARCHAR(150),
  ADD COLUMN IF NOT EXISTS "notice_period" VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "portfolio_url" VARCHAR(500),
  ADD COLUMN IF NOT EXISTS "resume_url" VARCHAR(500),
  ADD COLUMN IF NOT EXISTS "ai_screening_status" "AiScreeningStatus" NOT NULL DEFAULT 'NOT_SCREENED';

CREATE UNIQUE INDEX IF NOT EXISTS "candidates_organization_id_source_source_candidate_id_key"
  ON "candidates"("organization_id", "source", "source_candidate_id");

CREATE INDEX IF NOT EXISTS "candidates_organization_id_source_candidate_id_idx"
  ON "candidates"("organization_id", "source_candidate_id");

-- Candidate skills: allow multiple named skills; community optional
ALTER TABLE "candidate_skills" ALTER COLUMN "skill_community_id" DROP NOT NULL;

UPDATE "candidate_skills"
SET "skill_name" = COALESCE(NULLIF(TRIM("skill_name"), ''), 'Imported Skill')
WHERE "skill_name" IS NULL OR TRIM("skill_name") = '';

ALTER TABLE "candidate_skills" ALTER COLUMN "skill_name" SET NOT NULL;

ALTER TABLE "candidate_skills" DROP CONSTRAINT IF EXISTS "candidate_skills_candidate_id_skill_community_id_key";

DO $$ BEGIN
  ALTER TABLE "candidate_skills"
    ADD CONSTRAINT "candidate_skills_candidate_id_skill_name_key" UNIQUE ("candidate_id", "skill_name");
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Evaluation summary column
ALTER TABLE "evaluations"
  ADD COLUMN IF NOT EXISTS "evaluation_summary" TEXT;

-- BGV component statuses + default type
ALTER TABLE "background_checks"
  ALTER COLUMN "type" SET DEFAULT 'COMPREHENSIVE';

ALTER TABLE "background_checks"
  ADD COLUMN IF NOT EXISTS "id_check_status" VARCHAR(50),
  ADD COLUMN IF NOT EXISTS "address_check_status" VARCHAR(50),
  ADD COLUMN IF NOT EXISTS "employment_check_status" VARCHAR(50),
  ADD COLUMN IF NOT EXISTS "education_check_status" VARCHAR(50),
  ADD COLUMN IF NOT EXISTS "criminal_check_status" VARCHAR(50),
  ADD COLUMN IF NOT EXISTS "reference_check_status" VARCHAR(50);

-- Candidate scores
CREATE TABLE IF NOT EXISTS "candidate_scores" (
  "id" BIGSERIAL PRIMARY KEY,
  "organization_id" BIGINT NOT NULL,
  "candidate_id" BIGINT NOT NULL,
  "bestal_score" INTEGER,
  "technical_score" INTEGER,
  "communication_score" INTEGER,
  "problem_solving_score" INTEGER,
  "architecture_score" INTEGER,
  "reliability_score" INTEGER,
  "client_readiness_score" INTEGER,
  "score_source" "CandidateScoreSource" NOT NULL,
  "score_date" DATE,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" TIMESTAMP(3),
  CONSTRAINT "candidate_scores_organization_id_fkey"
    FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "candidate_scores_candidate_id_fkey"
    FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "candidate_scores_organization_id_deleted_at_idx"
  ON "candidate_scores"("organization_id", "deleted_at");
CREATE INDEX IF NOT EXISTS "candidate_scores_candidate_id_deleted_at_idx"
  ON "candidate_scores"("candidate_id", "deleted_at");
CREATE INDEX IF NOT EXISTS "candidate_scores_candidate_id_score_date_idx"
  ON "candidate_scores"("candidate_id", "score_date");

-- Generic import audit tables
CREATE TABLE IF NOT EXISTS "candidate_import_batches" (
  "id" BIGSERIAL PRIMARY KEY,
  "organization_id" BIGINT NOT NULL,
  "created_by_id" BIGINT NOT NULL,
  "file_name" VARCHAR(255) NOT NULL,
  "file_checksum" VARCHAR(64) NOT NULL,
  "status" "CandidateImportBatchStatus" NOT NULL DEFAULT 'PREVIEWED',
  "created_count" INTEGER NOT NULL DEFAULT 0,
  "updated_count" INTEGER NOT NULL DEFAULT 0,
  "skipped_count" INTEGER NOT NULL DEFAULT 0,
  "failed_count" INTEGER NOT NULL DEFAULT 0,
  "processed_count" INTEGER NOT NULL DEFAULT 0,
  "total_count" INTEGER NOT NULL DEFAULT 0,
  "error_summary" TEXT,
  "preview_payload" JSONB,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "confirmed_at" TIMESTAMP(3),
  "completed_at" TIMESTAMP(3),
  CONSTRAINT "candidate_import_batches_organization_id_fkey"
    FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "candidate_import_batches_created_by_id_fkey"
    FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "candidate_import_batches_organization_id_created_at_idx"
  ON "candidate_import_batches"("organization_id", "created_at");
CREATE INDEX IF NOT EXISTS "candidate_import_batches_organization_id_file_checksum_idx"
  ON "candidate_import_batches"("organization_id", "file_checksum");
CREATE INDEX IF NOT EXISTS "candidate_import_batches_status_expires_at_idx"
  ON "candidate_import_batches"("status", "expires_at");

CREATE TABLE IF NOT EXISTS "candidate_import_rows" (
  "id" BIGSERIAL PRIMARY KEY,
  "batch_id" BIGINT NOT NULL,
  "row_number" INTEGER NOT NULL,
  "source_candidate_id" VARCHAR(150) NOT NULL,
  "email" VARCHAR(255),
  "candidate_id" BIGINT,
  "action" "CandidateImportRowAction" NOT NULL,
  "error_message" TEXT,
  "normalized_payload" JSONB NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "processed_at" TIMESTAMP(3),
  CONSTRAINT "candidate_import_rows_batch_id_fkey"
    FOREIGN KEY ("batch_id") REFERENCES "candidate_import_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "candidate_import_rows_candidate_id_fkey"
    FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "candidate_import_rows_batch_id_row_number_idx"
  ON "candidate_import_rows"("batch_id", "row_number");
CREATE INDEX IF NOT EXISTS "candidate_import_rows_batch_id_action_idx"
  ON "candidate_import_rows"("batch_id", "action");
CREATE INDEX IF NOT EXISTS "candidate_import_rows_candidate_id_idx"
  ON "candidate_import_rows"("candidate_id");

CREATE TABLE IF NOT EXISTS "candidate_import_errors" (
  "id" BIGSERIAL PRIMARY KEY,
  "batch_id" BIGINT NOT NULL,
  "sheet_name" VARCHAR(100) NOT NULL,
  "row_number" INTEGER,
  "source_candidate_id" VARCHAR(150),
  "column_name" VARCHAR(100),
  "supplied_value" TEXT,
  "error_code" VARCHAR(80) NOT NULL,
  "message" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "candidate_import_errors_batch_id_fkey"
    FOREIGN KEY ("batch_id") REFERENCES "candidate_import_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "candidate_import_errors_batch_id_sheet_name_row_number_idx"
  ON "candidate_import_errors"("batch_id", "sheet_name", "row_number");

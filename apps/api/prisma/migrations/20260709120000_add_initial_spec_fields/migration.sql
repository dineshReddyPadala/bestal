-- Align schema with initial BesTal table spec (BigInt PKs retained)

-- clients
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "company_size" VARCHAR(50);
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "headquarters" VARCHAR(255);
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "primary_contact_name" VARCHAR(150);
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "payment_terms" VARCHAR(100);

-- candidates
ALTER TABLE "candidates" ADD COLUMN IF NOT EXISTS "created_by_id" BIGINT;
ALTER TABLE "candidates" ADD COLUMN IF NOT EXISTS "oorwin_candidate_id" VARCHAR(100);
ALTER TABLE "candidates" ADD COLUMN IF NOT EXISTS "display_name" VARCHAR(200);
ALTER TABLE "candidates" ADD COLUMN IF NOT EXISTS "primary_role" VARCHAR(150);
ALTER TABLE "candidates" ADD COLUMN IF NOT EXISTS "current_company" VARCHAR(255);
ALTER TABLE "candidates" ADD COLUMN IF NOT EXISTS "education" TEXT;
ALTER TABLE "candidates" ADD COLUMN IF NOT EXISTS "availability_status" VARCHAR(50);
ALTER TABLE "candidates" ADD COLUMN IF NOT EXISTS "timezone_overlap" VARCHAR(100);
ALTER TABLE "candidates" ADD COLUMN IF NOT EXISTS "preferred_shift" VARCHAR(50);
ALTER TABLE "candidates" ADD COLUMN IF NOT EXISTS "min_hours_per_week" INTEGER;
ALTER TABLE "candidates" ADD COLUMN IF NOT EXISTS "max_hours_per_week" INTEGER;
ALTER TABLE "candidates" ADD COLUMN IF NOT EXISTS "client_bill_rate" DECIMAL(12,2);
ALTER TABLE "candidates" ADD COLUMN IF NOT EXISTS "candidate_pay_rate" DECIMAL(12,2);
ALTER TABLE "candidates" ADD COLUMN IF NOT EXISTS "gross_margin" DECIMAL(12,2);
ALTER TABLE "candidates" ADD COLUMN IF NOT EXISTS "github_url" VARCHAR(500);
ALTER TABLE "candidates" ADD COLUMN IF NOT EXISTS "naukri_url" VARCHAR(500);
ALTER TABLE "candidates" ADD COLUMN IF NOT EXISTS "ai_summary" TEXT;
ALTER TABLE "candidates" ADD COLUMN IF NOT EXISTS "client_profile_summary" TEXT;
ALTER TABLE "candidates" ADD COLUMN IF NOT EXISTS "strengths" TEXT;
ALTER TABLE "candidates" ADD COLUMN IF NOT EXISTS "weaknesses" TEXT;
ALTER TABLE "candidates" ADD COLUMN IF NOT EXISTS "risk_flags" TEXT;
ALTER TABLE "candidates" ADD COLUMN IF NOT EXISTS "bestal_score" INTEGER;
ALTER TABLE "candidates" ADD COLUMN IF NOT EXISTS "technical_score" INTEGER;
ALTER TABLE "candidates" ADD COLUMN IF NOT EXISTS "communication_score" INTEGER;
ALTER TABLE "candidates" ADD COLUMN IF NOT EXISTS "reliability_score" INTEGER;
ALTER TABLE "candidates" ADD COLUMN IF NOT EXISTS "evaluation_status" VARCHAR(50);
ALTER TABLE "candidates" ADD COLUMN IF NOT EXISTS "bgv_status" VARCHAR(50);
ALTER TABLE "candidates" ADD COLUMN IF NOT EXISTS "profile_status" VARCHAR(50);
ALTER TABLE "candidates" ADD COLUMN IF NOT EXISTS "deployment_status" VARCHAR(50);

CREATE UNIQUE INDEX IF NOT EXISTS "candidates_oorwin_candidate_id_key" ON "candidates"("oorwin_candidate_id");
CREATE INDEX IF NOT EXISTS "candidates_created_by_id_idx" ON "candidates"("created_by_id");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'candidates_created_by_id_fkey'
  ) THEN
    ALTER TABLE "candidates"
      ADD CONSTRAINT "candidates_created_by_id_fkey"
      FOREIGN KEY ("created_by_id") REFERENCES "users"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- candidate_skills
ALTER TABLE "candidate_skills" ADD COLUMN IF NOT EXISTS "skill_name" VARCHAR(150);
ALTER TABLE "candidate_skills" ADD COLUMN IF NOT EXISTS "skill_category" VARCHAR(100);

-- evaluations
ALTER TABLE "evaluations" ADD COLUMN IF NOT EXISTS "evaluator_name" VARCHAR(150);
ALTER TABLE "evaluations" ADD COLUMN IF NOT EXISTS "evaluator_company" VARCHAR(255);
ALTER TABLE "evaluations" ADD COLUMN IF NOT EXISTS "evaluation_type" VARCHAR(100);
ALTER TABLE "evaluations" ADD COLUMN IF NOT EXISTS "communication_score" DECIMAL(5,2);
ALTER TABLE "evaluations" ADD COLUMN IF NOT EXISTS "problem_solving_score" DECIMAL(5,2);
ALTER TABLE "evaluations" ADD COLUMN IF NOT EXISTS "architecture_score" DECIMAL(5,2);
ALTER TABLE "evaluations" ADD COLUMN IF NOT EXISTS "client_readiness_score" DECIMAL(5,2);
ALTER TABLE "evaluations" ADD COLUMN IF NOT EXISTS "evaluator_comments" TEXT;
ALTER TABLE "evaluations" ADD COLUMN IF NOT EXISTS "ai_evaluation_summary" TEXT;
ALTER TABLE "evaluations" ADD COLUMN IF NOT EXISTS "recording_url" VARCHAR(500);
ALTER TABLE "evaluations" ADD COLUMN IF NOT EXISTS "evaluation_file_url" VARCHAR(500);

-- shortlist_candidates (maps to client_shortlists)
ALTER TABLE "shortlist_candidates" ADD COLUMN IF NOT EXISTS "status" VARCHAR(50);

-- trial_requests
ALTER TABLE "trial_requests" ADD COLUMN IF NOT EXISTS "trial_type" VARCHAR(100);
ALTER TABLE "trial_requests" ADD COLUMN IF NOT EXISTS "max_trial_hours" INTEGER DEFAULT 20;
ALTER TABLE "trial_requests" ADD COLUMN IF NOT EXISTS "task_description" TEXT;
ALTER TABLE "trial_requests" ADD COLUMN IF NOT EXISTS "success_criteria" TEXT;
ALTER TABLE "trial_requests" ADD COLUMN IF NOT EXISTS "client_rating" INTEGER;
ALTER TABLE "trial_requests" ADD COLUMN IF NOT EXISTS "converted_to_paid" BOOLEAN NOT NULL DEFAULT false;

-- deployments
ALTER TABLE "deployments" ADD COLUMN IF NOT EXISTS "candidate_pay_rate" DECIMAL(12,2);
ALTER TABLE "deployments" ADD COLUMN IF NOT EXISTS "gross_margin_per_hour" DECIMAL(12,2);
ALTER TABLE "deployments" ADD COLUMN IF NOT EXISTS "expected_hours_per_week" INTEGER;
ALTER TABLE "deployments" ADD COLUMN IF NOT EXISTS "timezone" VARCHAR(50);
ALTER TABLE "deployments" ADD COLUMN IF NOT EXISTS "reporting_manager_name" VARCHAR(150);
ALTER TABLE "deployments" ADD COLUMN IF NOT EXISTS "reporting_manager_email" VARCHAR(255);

-- documents
ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "file_url" VARCHAR(1000);

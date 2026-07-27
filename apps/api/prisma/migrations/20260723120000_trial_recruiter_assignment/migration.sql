ALTER TABLE "trial_requests"
  ADD COLUMN "assigned_recruiter_id" BIGINT,
  ADD COLUMN "candidate_confirmed_at" TIMESTAMP(3);

ALTER TABLE "trial_requests"
  ADD CONSTRAINT "trial_requests_assigned_recruiter_id_fkey"
  FOREIGN KEY ("assigned_recruiter_id") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "trial_requests_assigned_recruiter_id_idx"
  ON "trial_requests"("assigned_recruiter_id");

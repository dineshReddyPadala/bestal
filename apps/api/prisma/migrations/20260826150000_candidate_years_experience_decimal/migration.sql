-- Allow fractional years of experience (e.g. 3.6 years).
ALTER TABLE "candidates"
  ALTER COLUMN "years_experience" TYPE DECIMAL(4, 1)
  USING "years_experience"::decimal;

ALTER TABLE "candidate_skills"
  ALTER COLUMN "years_experience" TYPE DECIMAL(4, 1)
  USING "years_experience"::decimal;

-- Simplify evaluations: free-text evaluator name, remove system user/client links and workflow fields

ALTER TABLE "evaluations" DROP CONSTRAINT IF EXISTS "evaluations_client_id_fkey";
ALTER TABLE "evaluations" DROP CONSTRAINT IF EXISTS "evaluations_evaluator_id_fkey";

DROP INDEX IF EXISTS "evaluations_organization_id_status_deleted_at_idx";
DROP INDEX IF EXISTS "evaluations_client_id_deleted_at_idx";
DROP INDEX IF EXISTS "evaluations_evaluator_id_idx";
DROP INDEX IF EXISTS "evaluations_organization_id_evaluated_at_idx";

ALTER TABLE "evaluations" ADD COLUMN IF NOT EXISTS "evaluation_date" DATE;

UPDATE "evaluations" e
SET "evaluator_name" = COALESCE(e."evaluator_name", u."first_name" || ' ' || u."last_name")
FROM "users" u
WHERE e."evaluator_id" = u."id" AND e."evaluator_name" IS NULL;

UPDATE "evaluations" SET "evaluator_name" = 'Unknown' WHERE "evaluator_name" IS NULL;
ALTER TABLE "evaluations" ALTER COLUMN "evaluator_name" SET NOT NULL;

ALTER TABLE "evaluations" ALTER COLUMN "recommendation" TYPE TEXT USING "recommendation"::TEXT;

ALTER TABLE "evaluations" ALTER COLUMN "technical_score" TYPE INTEGER USING ROUND("technical_score")::INTEGER;
ALTER TABLE "evaluations" ALTER COLUMN "communication_score" TYPE INTEGER USING ROUND("communication_score")::INTEGER;
ALTER TABLE "evaluations" ALTER COLUMN "problem_solving_score" TYPE INTEGER USING ROUND("problem_solving_score")::INTEGER;
ALTER TABLE "evaluations" ALTER COLUMN "architecture_score" TYPE INTEGER USING ROUND("architecture_score")::INTEGER;
ALTER TABLE "evaluations" ALTER COLUMN "client_readiness_score" TYPE INTEGER USING ROUND("client_readiness_score")::INTEGER;

ALTER TABLE "evaluations" DROP COLUMN IF EXISTS "client_id";
ALTER TABLE "evaluations" DROP COLUMN IF EXISTS "evaluator_id";
ALTER TABLE "evaluations" DROP COLUMN IF EXISTS "status";
ALTER TABLE "evaluations" DROP COLUMN IF EXISTS "overall_score";
ALTER TABLE "evaluations" DROP COLUMN IF EXISTS "soft_skill_score";
ALTER TABLE "evaluations" DROP COLUMN IF EXISTS "summary";
ALTER TABLE "evaluations" DROP COLUMN IF EXISTS "strengths";
ALTER TABLE "evaluations" DROP COLUMN IF EXISTS "weaknesses";
ALTER TABLE "evaluations" DROP COLUMN IF EXISTS "evaluated_at";

DROP TYPE IF EXISTS "EvaluationStatus";
DROP TYPE IF EXISTS "EvaluationRecommendation";

CREATE INDEX IF NOT EXISTS "evaluations_organization_id_deleted_at_idx" ON "evaluations"("organization_id", "deleted_at");
CREATE INDEX IF NOT EXISTS "evaluations_organization_id_evaluation_date_idx" ON "evaluations"("organization_id", "evaluation_date");

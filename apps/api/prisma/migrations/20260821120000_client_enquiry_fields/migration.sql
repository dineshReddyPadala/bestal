-- AlterTable
ALTER TABLE "job_requests" ADD COLUMN "reference_code" VARCHAR(32),
ADD COLUMN "company_domain" VARCHAR(255),
ADD COLUMN "location" VARCHAR(255),
ADD COLUMN "timezone" VARCHAR(50),
ADD COLUMN "additional_requirements" TEXT,
ADD COLUMN "jobs" JSONB,
ADD COLUMN "attachments" JSONB;

-- Backfill reference codes for any existing rows
UPDATE "job_requests"
SET "reference_code" = 'REQ-' || EXTRACT(YEAR FROM "created_at")::text || '-' || LPAD("id"::text, 4, '0')
WHERE "reference_code" IS NULL;

ALTER TABLE "job_requests" ALTER COLUMN "reference_code" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "job_requests_reference_code_key" ON "job_requests"("reference_code");

-- CreateEnum
CREATE TYPE "AutomationJobType" AS ENUM ('RESUME_SCREENING', 'EVALUATION_ANALYSIS', 'BGV_ANALYSIS');

-- CreateEnum
CREATE TYPE "AutomationJobStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'RETRYING', 'CANCELLED');

-- CreateTable
CREATE TABLE "automation_jobs" (
    "id" BIGSERIAL NOT NULL,
    "candidate_id" BIGINT,
    "document_id" BIGINT,
    "job_type" "AutomationJobType" NOT NULL,
    "status" "AutomationJobStatus" NOT NULL DEFAULT 'PENDING',
    "workflow_name" VARCHAR(150),
    "workflow_version" VARCHAR(50),
    "n8n_execution_id" VARCHAR(100),
    "input_reference" JSONB,
    "output_reference" JSONB,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "max_attempts" INTEGER NOT NULL DEFAULT 3,
    "error_code" VARCHAR(80),
    "error_message" TEXT,
    "requested_by" BIGINT NOT NULL,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automation_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "automation_jobs_candidate_id_idx" ON "automation_jobs"("candidate_id");

-- CreateIndex
CREATE INDEX "automation_jobs_document_id_idx" ON "automation_jobs"("document_id");

-- CreateIndex
CREATE INDEX "automation_jobs_job_type_idx" ON "automation_jobs"("job_type");

-- CreateIndex
CREATE INDEX "automation_jobs_status_idx" ON "automation_jobs"("status");

-- CreateIndex
CREATE INDEX "automation_jobs_n8n_execution_id_idx" ON "automation_jobs"("n8n_execution_id");

-- CreateIndex
CREATE INDEX "automation_jobs_requested_by_idx" ON "automation_jobs"("requested_by");

-- CreateIndex
CREATE INDEX "automation_jobs_status_job_type_created_at_idx" ON "automation_jobs"("status", "job_type", "created_at");

-- AddForeignKey
ALTER TABLE "automation_jobs" ADD CONSTRAINT "automation_jobs_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_jobs" ADD CONSTRAINT "automation_jobs_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_jobs" ADD CONSTRAINT "automation_jobs_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

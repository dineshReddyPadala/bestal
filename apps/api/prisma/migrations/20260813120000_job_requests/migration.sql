-- CreateEnum
CREATE TYPE "JobRequestStatus" AS ENUM ('SUBMITTED', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'CLOSED');

-- CreateEnum
CREATE TYPE "JobRequestSource" AS ENUM ('WEBSITE');

-- CreateTable
CREATE TABLE "job_requests" (
    "id" BIGSERIAL NOT NULL,
    "organization_id" BIGINT NOT NULL,
    "job_title" VARCHAR(255) NOT NULL,
    "job_description" TEXT NOT NULL,
    "required_skills" JSONB NOT NULL,
    "experience_required" VARCHAR(50) NOT NULL,
    "number_of_resources" VARCHAR(20) NOT NULL,
    "company_name" VARCHAR(255) NOT NULL,
    "website" VARCHAR(500) NOT NULL,
    "contact_name" VARCHAR(150) NOT NULL,
    "contact_email" VARCHAR(255) NOT NULL,
    "contact_phone" VARCHAR(30) NOT NULL,
    "status" "JobRequestStatus" NOT NULL DEFAULT 'SUBMITTED',
    "source" "JobRequestSource" NOT NULL DEFAULT 'WEBSITE',
    "assigned_to_id" BIGINT,
    "internal_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "job_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "job_requests_organization_id_status_deleted_at_idx" ON "job_requests"("organization_id", "status", "deleted_at");

-- CreateIndex
CREATE INDEX "job_requests_assigned_to_id_idx" ON "job_requests"("assigned_to_id");

-- CreateIndex
CREATE INDEX "job_requests_organization_id_created_at_idx" ON "job_requests"("organization_id", "created_at");

-- AddForeignKey
ALTER TABLE "job_requests" ADD CONSTRAINT "job_requests_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_requests" ADD CONSTRAINT "job_requests_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

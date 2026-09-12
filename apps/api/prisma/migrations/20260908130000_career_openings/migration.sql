-- CreateEnum
CREATE TYPE "CareerOpeningStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED');

-- CreateTable
CREATE TABLE "career_openings" (
    "id" BIGSERIAL NOT NULL,
    "organization_id" BIGINT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(160) NOT NULL,
    "skill_community" VARCHAR(120) NOT NULL,
    "location" VARCHAR(255) NOT NULL,
    "remote" BOOLEAN NOT NULL DEFAULT false,
    "job_level" VARCHAR(80) NOT NULL,
    "experience" VARCHAR(80) NOT NULL,
    "about_role" TEXT NOT NULL,
    "responsibilities" JSONB NOT NULL,
    "requirements" JSONB NOT NULL,
    "status" "CareerOpeningStatus" NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "career_openings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "career_openings_slug_key" ON "career_openings"("slug");

-- CreateIndex
CREATE INDEX "career_openings_organization_id_status_deleted_at_idx" ON "career_openings"("organization_id", "status", "deleted_at");

-- CreateIndex
CREATE INDEX "career_openings_status_deleted_at_published_at_idx" ON "career_openings"("status", "deleted_at", "published_at");

-- AddForeignKey
ALTER TABLE "career_openings" ADD CONSTRAINT "career_openings_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

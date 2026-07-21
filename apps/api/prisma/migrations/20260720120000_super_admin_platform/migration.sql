-- AlterEnum
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'VIEWER';

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "OorwinImportStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "system_settings" (
    "id" BIGSERIAL NOT NULL,
    "key" VARCHAR(100) NOT NULL,
    "value" JSONB NOT NULL,
    "updated_by_id" BIGINT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "system_settings_key_key" ON "system_settings"("key");

-- CreateTable
CREATE TABLE IF NOT EXISTS "oorwin_import_batches" (
    "id" BIGSERIAL NOT NULL,
    "organization_id" BIGINT NOT NULL,
    "created_by_id" BIGINT NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "status" "OorwinImportStatus" NOT NULL DEFAULT 'PENDING',
    "created_count" INTEGER NOT NULL DEFAULT 0,
    "updated_count" INTEGER NOT NULL DEFAULT 0,
    "skipped_count" INTEGER NOT NULL DEFAULT 0,
    "failed_count" INTEGER NOT NULL DEFAULT 0,
    "error_summary" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "oorwin_import_batches_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "oorwin_import_batches_organization_id_created_at_idx" ON "oorwin_import_batches"("organization_id", "created_at");
CREATE INDEX IF NOT EXISTS "oorwin_import_batches_status_created_at_idx" ON "oorwin_import_batches"("status", "created_at");

CREATE TABLE IF NOT EXISTS "oorwin_import_rows" (
    "id" BIGSERIAL NOT NULL,
    "batch_id" BIGINT NOT NULL,
    "row_number" INTEGER NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(30),
    "oorwin_id" VARCHAR(100),
    "candidate_id" BIGINT,
    "action" VARCHAR(20) NOT NULL,
    "error_message" TEXT,
    "raw_payload" JSONB,

    CONSTRAINT "oorwin_import_rows_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "oorwin_import_rows_batch_id_row_number_idx" ON "oorwin_import_rows"("batch_id", "row_number");

-- ForeignKeys (ignore if already exist)
DO $$ BEGIN
  ALTER TABLE "system_settings" ADD CONSTRAINT "system_settings_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "oorwin_import_batches" ADD CONSTRAINT "oorwin_import_batches_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "oorwin_import_batches" ADD CONSTRAINT "oorwin_import_batches_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "oorwin_import_rows" ADD CONSTRAINT "oorwin_import_rows_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "oorwin_import_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

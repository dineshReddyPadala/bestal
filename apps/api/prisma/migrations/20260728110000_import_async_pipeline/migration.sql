-- AlterEnum
ALTER TYPE "CandidateImportBatchStatus" ADD VALUE IF NOT EXISTS 'QUEUED';
ALTER TYPE "CandidateImportBatchStatus" ADD VALUE IF NOT EXISTS 'VALIDATING';

-- AlterTable
ALTER TABLE "candidate_import_batches" ADD COLUMN IF NOT EXISTS "file_content" BYTEA;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "candidate_import_rows_batch_id_processed_at_row_number_idx"
  ON "candidate_import_rows"("batch_id", "processed_at", "row_number");

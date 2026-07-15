-- BGV workflow fields: consent, vendor assignment, AI summary, admin review, document links
ALTER TABLE "background_checks" ADD COLUMN "ai_summary" TEXT;
ALTER TABLE "background_checks" ADD COLUMN "review_notes" TEXT;
ALTER TABLE "background_checks" ADD COLUMN "consent_confirmed_at" TIMESTAMP(3);
ALTER TABLE "background_checks" ADD COLUMN "consent_confirmed_by_id" BIGINT;
ALTER TABLE "background_checks" ADD COLUMN "vendor_assigned_at" TIMESTAMP(3);
ALTER TABLE "background_checks" ADD COLUMN "reviewed_by_id" BIGINT;
ALTER TABLE "background_checks" ADD COLUMN "reviewed_at" TIMESTAMP(3);
ALTER TABLE "background_checks" ADD COLUMN "consent_document_id" BIGINT;
ALTER TABLE "background_checks" ADD COLUMN "report_document_id" BIGINT;

ALTER TABLE "background_checks"
  ADD CONSTRAINT "background_checks_consent_confirmed_by_id_fkey"
  FOREIGN KEY ("consent_confirmed_by_id") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "background_checks"
  ADD CONSTRAINT "background_checks_reviewed_by_id_fkey"
  FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "background_checks"
  ADD CONSTRAINT "background_checks_consent_document_id_fkey"
  FOREIGN KEY ("consent_document_id") REFERENCES "documents"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "background_checks"
  ADD CONSTRAINT "background_checks_report_document_id_fkey"
  FOREIGN KEY ("report_document_id") REFERENCES "documents"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

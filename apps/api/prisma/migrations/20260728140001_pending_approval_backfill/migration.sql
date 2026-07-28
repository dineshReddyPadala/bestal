-- Backfill submitted drafts to PENDING_APPROVAL (must run after enum value is committed)
UPDATE "candidates"
SET "profile_status" = 'PENDING_APPROVAL'
WHERE "profile_status" = 'PROFILE_DRAFT'
  AND "submitted_for_approval_at" IS NOT NULL
  AND "approval_status" = 'PENDING';

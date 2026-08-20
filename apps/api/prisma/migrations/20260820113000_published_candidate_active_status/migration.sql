-- Published client-visible candidates must have status ACTIVE for client portal search.
UPDATE "candidates"
SET "status" = 'ACTIVE'
WHERE "visibility" = 'CLIENT_VISIBLE'
  AND "approval_status" = 'APPROVED'
  AND "status" <> 'ACTIVE'
  AND "deleted_at" IS NULL;

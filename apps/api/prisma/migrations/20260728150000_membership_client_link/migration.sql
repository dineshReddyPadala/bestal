-- AlterTable
ALTER TABLE "memberships" ADD COLUMN "client_id" BIGINT;

-- CreateIndex
CREATE INDEX "memberships_client_id_idx" ON "memberships"("client_id");

-- AddForeignKey
ALTER TABLE "memberships"
  ADD CONSTRAINT "memberships_client_id_fkey"
  FOREIGN KEY ("client_id") REFERENCES "clients"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Normalize existing client contact emails to lowercase
UPDATE "clients"
SET "contact_email" = lower("contact_email")
WHERE "contact_email" IS NOT NULL
  AND "contact_email" <> lower("contact_email");

-- Backfill CLIENT memberships by matching contact email within the same organization
UPDATE "memberships" AS m
SET "client_id" = c.id
FROM "users" AS u, "clients" AS c
WHERE m.user_id = u.id
  AND c.organization_id = m.organization_id
  AND c.deleted_at IS NULL
  AND c.contact_email = lower(u.email)
  AND m.role = 'CLIENT'
  AND m.client_id IS NULL;

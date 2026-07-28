-- AlterTable
ALTER TABLE "deployments" ADD COLUMN "requested_by_id" BIGINT;

-- AddForeignKey
ALTER TABLE "deployments" ADD CONSTRAINT "deployments_requested_by_id_fkey" FOREIGN KEY ("requested_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "deployments_requested_by_id_idx" ON "deployments"("requested_by_id");

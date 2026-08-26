-- CreateEnum
CREATE TYPE "ContactMessageTopic" AS ENUM ('GENERAL', 'SALES', 'SUPPORT', 'PRESS', 'PARTNERSHIPS', 'INVESTORS');

-- CreateEnum
CREATE TYPE "ContactMessageStatus" AS ENUM ('SUBMITTED', 'READ', 'REPLIED', 'CLOSED');

-- CreateTable
CREATE TABLE "contact_messages" (
    "id" BIGSERIAL NOT NULL,
    "organization_id" BIGINT NOT NULL,
    "reference_code" VARCHAR(32) NOT NULL,
    "full_name" VARCHAR(150) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "topic" "ContactMessageTopic" NOT NULL,
    "message" TEXT NOT NULL,
    "status" "ContactMessageStatus" NOT NULL DEFAULT 'SUBMITTED',
    "internal_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contact_messages_reference_code_key" ON "contact_messages"("reference_code");

-- CreateIndex
CREATE INDEX "contact_messages_organization_id_status_deleted_at_idx" ON "contact_messages"("organization_id", "status", "deleted_at");

-- CreateIndex
CREATE INDEX "contact_messages_organization_id_created_at_idx" ON "contact_messages"("organization_id", "created_at");

-- AddForeignKey
ALTER TABLE "contact_messages" ADD CONSTRAINT "contact_messages_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

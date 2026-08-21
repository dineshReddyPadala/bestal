-- AlterTable
ALTER TABLE "clients" ADD COLUMN "contact_designation" VARCHAR(150);

-- CreateTable
CREATE TABLE "client_signup_otps" (
    "id" BIGSERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "otp_hash" VARCHAR(128) NOT NULL,
    "payload" JSONB NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_signup_otps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "client_signup_otps_email_used_at_idx" ON "client_signup_otps"("email", "used_at");

-- CreateIndex
CREATE INDEX "client_signup_otps_expires_at_idx" ON "client_signup_otps"("expires_at");

CREATE TABLE IF NOT EXISTS "login_otps" (
  "id" BIGSERIAL NOT NULL,
  "email" VARCHAR(255) NOT NULL,
  "portal" "Portal" NOT NULL,
  "otp_hash" VARCHAR(128) NOT NULL,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "used_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "login_otps_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "login_otps_email_portal_used_at_idx" ON "login_otps"("email", "portal", "used_at");
CREATE INDEX IF NOT EXISTS "login_otps_expires_at_idx" ON "login_otps"("expires_at");

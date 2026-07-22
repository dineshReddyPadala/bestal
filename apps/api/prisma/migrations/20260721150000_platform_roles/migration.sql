-- Platform roles + optional membership link for custom role assignment

CREATE TABLE "platform_roles" (
    "id" BIGSERIAL NOT NULL,
    "code" VARCHAR(64) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "description" TEXT,
    "portal" VARCHAR(30) NOT NULL,
    "base_role" "Role" NOT NULL,
    "permissions" JSONB NOT NULL,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "is_protected" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" BIGINT,
    "updated_by_id" BIGINT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "platform_roles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "platform_roles_code_key" ON "platform_roles"("code");
CREATE INDEX "platform_roles_is_active_deleted_at_idx" ON "platform_roles"("is_active", "deleted_at");
CREATE INDEX "platform_roles_portal_idx" ON "platform_roles"("portal");

ALTER TABLE "platform_roles" ADD CONSTRAINT "platform_roles_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "platform_roles" ADD CONSTRAINT "platform_roles_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "memberships" ADD COLUMN "platform_role_id" BIGINT;
CREATE INDEX "memberships_platform_role_id_idx" ON "memberships"("platform_role_id");
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_platform_role_id_fkey" FOREIGN KEY ("platform_role_id") REFERENCES "platform_roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

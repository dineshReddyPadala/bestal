-- CreateTable
CREATE TABLE "icons" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "icons_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "icons_is_active_deleted_at_idx" ON "icons"("is_active", "deleted_at");

-- CreateIndex
CREATE INDEX "icons_name_idx" ON "icons"("name");

-- AlterTable
ALTER TABLE "skill_communities" ADD COLUMN "icon_id" BIGINT;

-- CreateIndex
CREATE INDEX "skill_communities_icon_id_idx" ON "skill_communities"("icon_id");

-- AddForeignKey
ALTER TABLE "skill_communities" ADD CONSTRAINT "skill_communities_icon_id_fkey" FOREIGN KEY ("icon_id") REFERENCES "icons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

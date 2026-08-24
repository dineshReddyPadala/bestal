ALTER TABLE "skill_communities" ADD COLUMN "display_order" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX "skill_communities_is_active_deleted_at_display_order_idx"
ON "skill_communities" ("is_active", "deleted_at", "display_order");

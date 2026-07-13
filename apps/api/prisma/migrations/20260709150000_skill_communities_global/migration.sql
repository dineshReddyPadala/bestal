-- Skill communities are platform-wide (not scoped to an organization)

-- Repoint candidate FKs to a single row per slug before deduplicating
WITH canonical AS (
  SELECT slug, MIN(id) AS keep_id
  FROM "skill_communities"
  GROUP BY slug
),
dupes AS (
  SELECT sc.id AS old_id, c.keep_id
  FROM "skill_communities" sc
  INNER JOIN canonical c ON sc.slug = c.slug AND sc.id <> c.keep_id
)
UPDATE "candidates" c
SET "primary_skill_community_id" = d.keep_id
FROM dupes d
WHERE c."primary_skill_community_id" = d.old_id;

WITH canonical AS (
  SELECT slug, MIN(id) AS keep_id
  FROM "skill_communities"
  GROUP BY slug
),
dupes AS (
  SELECT sc.id AS old_id, c.keep_id
  FROM "skill_communities" sc
  INNER JOIN canonical c ON sc.slug = c.slug AND sc.id <> c.keep_id
)
UPDATE "candidate_skills" cs
SET "skill_community_id" = d.keep_id
FROM dupes d
WHERE cs."skill_community_id" = d.old_id;

WITH canonical AS (
  SELECT slug, MIN(id) AS keep_id
  FROM "skill_communities"
  GROUP BY slug
)
DELETE FROM "skill_communities" sc
USING canonical c
WHERE sc.slug = c.slug AND sc.id <> c.keep_id;

ALTER TABLE "skill_communities" DROP CONSTRAINT IF EXISTS "skill_communities_organization_id_fkey";

DROP INDEX IF EXISTS "skill_communities_organization_id_is_active_deleted_at_idx";
DROP INDEX IF EXISTS "skill_communities_organization_id_name_idx";
DROP INDEX IF EXISTS "skill_communities_organization_id_slug_key";

ALTER TABLE "skill_communities" DROP COLUMN "organization_id";

CREATE UNIQUE INDEX "skill_communities_slug_key" ON "skill_communities"("slug");
CREATE INDEX "skill_communities_is_active_deleted_at_idx" ON "skill_communities"("is_active", "deleted_at");
CREATE INDEX "skill_communities_name_idx" ON "skill_communities"("name");

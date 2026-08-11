-- DropForeignKey
ALTER TABLE "candidate_skills" DROP CONSTRAINT "candidate_skills_skill_community_id_fkey";

-- DropIndex
DROP INDEX "candidate_skills_candidate_id_skill_community_id_key";

-- AlterTable
ALTER TABLE "candidate_scores" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "candidate_skills" ADD CONSTRAINT "candidate_skills_skill_community_id_fkey" FOREIGN KEY ("skill_community_id") REFERENCES "skill_communities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

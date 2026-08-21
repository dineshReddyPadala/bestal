ALTER TABLE "evaluations"
  RENAME COLUMN "architecture_score" TO "collaboration_cultural_fit_score";

ALTER TABLE "candidate_scores"
  RENAME COLUMN "architecture_score" TO "collaboration_cultural_fit_score";

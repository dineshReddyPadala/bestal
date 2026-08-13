-- Communication templates for admin-managed notification content
CREATE TABLE "communication_templates" (
    "id" BIGSERIAL NOT NULL,
    "key" VARCHAR(120) NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "subject" VARCHAR(500),
    "body" TEXT NOT NULL,
    "variables" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "communication_templates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "communication_templates_key_key" ON "communication_templates"("key");

INSERT INTO "communication_templates" ("key", "channel", "subject", "body", "variables", "updated_at")
VALUES
  (
    'notification.generic',
    'EMAIL',
    '{{title}}',
    '{{body}}',
    '["title","body","firstName","actionUrl"]'::jsonb,
    CURRENT_TIMESTAMP
  ),
  (
    'trial.requested',
    'EMAIL',
    '{{title}}',
    '{{clientName}} requested a free trial for {{candidateName}}.',
    '["title","clientName","candidateName","count","actionUrl"]'::jsonb,
    CURRENT_TIMESTAMP
  ),
  (
    'trial.status_changed',
    'EMAIL',
    'Trial {{status}}',
    'Trial for {{candidateName}} is now {{status}}.',
    '["candidateName","status","actionUrl"]'::jsonb,
    CURRENT_TIMESTAMP
  ),
  (
    'deployment.requested',
    'EMAIL',
    'Deployment request pending',
    '{{clientName}} requested deployment of {{candidateName}} as {{roleTitle}}.',
    '["clientName","candidateName","roleTitle","actionUrl"]'::jsonb,
    CURRENT_TIMESTAMP
  ),
  (
    'deployment.status_changed',
    'EMAIL',
    'Deployment {{status}}',
    'Deployment for {{candidateName}} ({{roleTitle}}) is now {{status}}.',
    '["candidateName","roleTitle","status","actionUrl"]'::jsonb,
    CURRENT_TIMESTAMP
  ),
  (
    'candidate.pending_approval',
    'EMAIL',
    'Candidate pending approval',
    '{{candidateName}} was submitted for approval.',
    '["candidateName","actionUrl"]'::jsonb,
    CURRENT_TIMESTAMP
  ),
  (
    'import.finished',
    'EMAIL',
    '{{title}}',
    'Import #{{batchId}}: {{successCount}} success, {{failCount}} failed, {{skipCount}} skipped.',
    '["title","batchId","successCount","failCount","skipCount","actionUrl"]'::jsonb,
    CURRENT_TIMESTAMP
  ),
  (
    'evaluation.processed',
    'EMAIL',
    'Evaluation processed',
    'Evaluation for {{candidateName}} was processed. BesTal score updated to {{bestalScore}}.',
    '["candidateName","bestalScore","actionUrl"]'::jsonb,
    CURRENT_TIMESTAMP
  ),
  (
    'bgv.analyzed',
    'EMAIL',
    'BGV report analyzed',
    'BGV report for {{candidateName}} was analyzed. Status: {{bgvStatus}}.',
    '["candidateName","bgvStatus","actionUrl"]'::jsonb,
    CURRENT_TIMESTAMP
  )
ON CONFLICT ("key") DO NOTHING;

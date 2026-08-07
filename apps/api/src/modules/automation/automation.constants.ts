import type { AutomationJobStatus, AutomationJobType } from '@prisma/client';

export const AUTOMATION_JOB_TYPES = {
  RESUME_SCREENING: 'RESUME_SCREENING',
  EVALUATION_ANALYSIS: 'EVALUATION_ANALYSIS',
  BGV_ANALYSIS: 'BGV_ANALYSIS',
} as const satisfies Record<AutomationJobType, AutomationJobType>;

export const AUTOMATION_JOB_STATUSES = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  RETRYING: 'RETRYING',
  CANCELLED: 'CANCELLED',
} as const satisfies Record<AutomationJobStatus, AutomationJobStatus>;

export const DEFAULT_AUTOMATION_MAX_ATTEMPTS = 3;

/** Default n8n workflow identity when Platform Settings omit name/version. */
export const DEFAULT_AUTOMATION_WORKFLOW_IDENTITIES = {
  RESUME_SCREENING: {
    name: 'BESTAL_RESUME_AI_SCREENING',
    version: '1.0.0',
  },
  EVALUATION_ANALYSIS: {
    name: 'BESTAL_EVALUATION_AI_ANALYSIS',
    version: '1.0.0',
  },
  BGV_ANALYSIS: {
    name: 'BESTAL_BGV_AI_ANALYSIS',
    version: '1.0.0',
  },
} as const satisfies Record<
  AutomationJobType,
  { name: string; version: string }
>;

/** @deprecated Use Platform Settings + resolveWorkflowIdentity — kept as createJob fallback. */
export const AUTOMATION_WORKFLOW_NAMES = {
  RESUME_SCREENING: DEFAULT_AUTOMATION_WORKFLOW_IDENTITIES.RESUME_SCREENING.name,
  EVALUATION_ANALYSIS: DEFAULT_AUTOMATION_WORKFLOW_IDENTITIES.EVALUATION_ANALYSIS.name,
  BGV_ANALYSIS: DEFAULT_AUTOMATION_WORKFLOW_IDENTITIES.BGV_ANALYSIS.name,
} as const satisfies Record<AutomationJobType, string>;

/** Terminal statuses — callbacks for these jobs are ignored (idempotent). */
export const AUTOMATION_TERMINAL_STATUSES: ReadonlySet<AutomationJobStatus> = new Set([
  AUTOMATION_JOB_STATUSES.COMPLETED,
  AUTOMATION_JOB_STATUSES.CANCELLED,
]);

/** Header n8n must send when calling Fastify callbacks. */
export const AUTOMATION_CALLBACK_SECRET_HEADER = 'x-automation-callback-secret';

/** Header Fastify sends when triggering n8n webhooks. */
export const N8N_WEBHOOK_SECRET_HEADER = 'x-n8n-webhook-secret';

/** Shown when AI endpoints are called without n8n workflow configuration. */
export const N8N_AUTOMATION_REQUIRED_MESSAGE =
  'Configure n8n automation in Platform Settings before running AI analysis.';

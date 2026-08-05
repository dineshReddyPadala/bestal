import type { AutomationJobType, PrismaClient, Role } from '@prisma/client';
import type { N8nConfig } from '../config/index.js';
import { DEFAULT_AUTOMATION_WORKFLOW_IDENTITIES } from '../modules/automation/automation.constants.js';

export type TrialsSettings = {
  freeTrialHours: number;
};

export type NotificationsSettings = {
  emailEnabled: boolean;
  trialEndingSoonDays: number;
  deploymentEndingSoonDays: number;
  importNotifyRoles: Role[];
};

const DEFAULT_TRIALS: TrialsSettings = {
  freeTrialHours: 20,
};

const DEFAULT_NOTIFICATIONS: NotificationsSettings = {
  emailEnabled: true,
  trialEndingSoonDays: 2,
  deploymentEndingSoonDays: 7,
  importNotifyRoles: ['SUPER_ADMIN', 'ADMIN', 'RECRUITER'],
};

/** Super Admin → Platform Settings → Automation / n8n workflows. */
export type WorkflowsSettings = {
  enabled: boolean;
  baseUrl: string | null;
  resumeWorkflowPath: string | null;
  resumeWorkflowName: string | null;
  resumeWorkflowVersion: string | null;
  evaluationWorkflowPath: string | null;
  evaluationWorkflowName: string | null;
  evaluationWorkflowVersion: string | null;
  bgvWorkflowPath: string | null;
  bgvWorkflowName: string | null;
  bgvWorkflowVersion: string | null;
  webhookSecret: string | null;
  requestTimeoutMs: number;
};

const DEFAULT_WORKFLOWS: WorkflowsSettings = {
  enabled: false,
  baseUrl: null,
  resumeWorkflowPath: null,
  resumeWorkflowName: DEFAULT_AUTOMATION_WORKFLOW_IDENTITIES.RESUME_SCREENING.name,
  resumeWorkflowVersion: DEFAULT_AUTOMATION_WORKFLOW_IDENTITIES.RESUME_SCREENING.version,
  evaluationWorkflowPath: null,
  evaluationWorkflowName: DEFAULT_AUTOMATION_WORKFLOW_IDENTITIES.EVALUATION_ANALYSIS.name,
  evaluationWorkflowVersion: DEFAULT_AUTOMATION_WORKFLOW_IDENTITIES.EVALUATION_ANALYSIS.version,
  bgvWorkflowPath: null,
  bgvWorkflowName: DEFAULT_AUTOMATION_WORKFLOW_IDENTITIES.BGV_ANALYSIS.name,
  bgvWorkflowVersion: DEFAULT_AUTOMATION_WORKFLOW_IDENTITIES.BGV_ANALYSIS.version,
  webhookSecret: null,
  requestTimeoutMs: 30_000,
};

const MASKED_SECRET = '********';

function asObj(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export async function readTrialsSettings(
  prisma: PrismaClient,
): Promise<TrialsSettings> {
  const row = await prisma.systemSetting.findUnique({ where: { key: 'trials' } });
  const obj = asObj(row?.value);
  const hours = Number(obj.freeTrialHours);
  return {
    freeTrialHours:
      Number.isFinite(hours) && hours > 0
        ? Math.floor(hours)
        : DEFAULT_TRIALS.freeTrialHours,
  };
}

export async function readNotificationsSettings(
  prisma: PrismaClient,
): Promise<NotificationsSettings> {
  const row = await prisma.systemSetting.findUnique({
    where: { key: 'notifications' },
  });
  const obj = asObj(row?.value);
  const trialDays = Number(obj.trialEndingSoonDays);
  const deployDays = Number(obj.deploymentEndingSoonDays);
  const roles = Array.isArray(obj.importNotifyRoles)
    ? (obj.importNotifyRoles.filter(
        (r): r is Role =>
          typeof r === 'string' &&
          ['SUPER_ADMIN', 'ADMIN', 'RECRUITER', 'SALES', 'CLIENT', 'VIEWER'].includes(r),
      ) as Role[])
    : DEFAULT_NOTIFICATIONS.importNotifyRoles;

  return {
    emailEnabled:
      obj.emailEnabled === undefined
        ? DEFAULT_NOTIFICATIONS.emailEnabled
        : Boolean(obj.emailEnabled),
    trialEndingSoonDays:
      Number.isFinite(trialDays) && trialDays >= 0
        ? Math.floor(trialDays)
        : DEFAULT_NOTIFICATIONS.trialEndingSoonDays,
    deploymentEndingSoonDays:
      Number.isFinite(deployDays) && deployDays >= 0
        ? Math.floor(deployDays)
        : DEFAULT_NOTIFICATIONS.deploymentEndingSoonDays,
    importNotifyRoles: roles.length > 0 ? roles : DEFAULT_NOTIFICATIONS.importNotifyRoles,
  };
}

function trimOrNull(value: unknown): string | null {
  const text = String(value ?? '').trim();
  return text || null;
}

function parseWorkflowsFromStorage(
  value: unknown,
): WorkflowsSettings {
  const obj = asObj(value);
  const timeout = Number(obj.requestTimeoutMs);
  return {
    enabled: obj.enabled === undefined ? DEFAULT_WORKFLOWS.enabled : Boolean(obj.enabled),
    baseUrl: trimOrNull(obj.baseUrl),
    resumeWorkflowPath: trimOrNull(obj.resumeWorkflowPath),
    resumeWorkflowName:
      trimOrNull(obj.resumeWorkflowName) ?? DEFAULT_WORKFLOWS.resumeWorkflowName,
    resumeWorkflowVersion:
      trimOrNull(obj.resumeWorkflowVersion) ?? DEFAULT_WORKFLOWS.resumeWorkflowVersion,
    evaluationWorkflowPath: trimOrNull(obj.evaluationWorkflowPath),
    evaluationWorkflowName:
      trimOrNull(obj.evaluationWorkflowName) ?? DEFAULT_WORKFLOWS.evaluationWorkflowName,
    evaluationWorkflowVersion:
      trimOrNull(obj.evaluationWorkflowVersion) ?? DEFAULT_WORKFLOWS.evaluationWorkflowVersion,
    bgvWorkflowPath: trimOrNull(obj.bgvWorkflowPath),
    bgvWorkflowName:
      trimOrNull(obj.bgvWorkflowName) ?? DEFAULT_WORKFLOWS.bgvWorkflowName,
    bgvWorkflowVersion:
      trimOrNull(obj.bgvWorkflowVersion) ?? DEFAULT_WORKFLOWS.bgvWorkflowVersion,
    webhookSecret: trimOrNull(obj.webhookSecret),
    requestTimeoutMs:
      Number.isFinite(timeout) && timeout > 0
        ? Math.floor(timeout)
        : DEFAULT_WORKFLOWS.requestTimeoutMs,
  };
}

export function resolveWorkflowIdentity(
  settings: WorkflowsSettings,
  jobType: AutomationJobType,
): { workflowName: string; workflowVersion: string } {
  switch (jobType) {
    case 'RESUME_SCREENING':
      return {
        workflowName:
          settings.resumeWorkflowName ??
          DEFAULT_AUTOMATION_WORKFLOW_IDENTITIES.RESUME_SCREENING.name,
        workflowVersion:
          settings.resumeWorkflowVersion ??
          DEFAULT_AUTOMATION_WORKFLOW_IDENTITIES.RESUME_SCREENING.version,
      };
    case 'EVALUATION_ANALYSIS':
      return {
        workflowName:
          settings.evaluationWorkflowName ??
          DEFAULT_AUTOMATION_WORKFLOW_IDENTITIES.EVALUATION_ANALYSIS.name,
        workflowVersion:
          settings.evaluationWorkflowVersion ??
          DEFAULT_AUTOMATION_WORKFLOW_IDENTITIES.EVALUATION_ANALYSIS.version,
      };
    case 'BGV_ANALYSIS':
      return {
        workflowName:
          settings.bgvWorkflowName ??
          DEFAULT_AUTOMATION_WORKFLOW_IDENTITIES.BGV_ANALYSIS.name,
        workflowVersion:
          settings.bgvWorkflowVersion ??
          DEFAULT_AUTOMATION_WORKFLOW_IDENTITIES.BGV_ANALYSIS.version,
      };
    default: {
      const _exhaustive: never = jobType;
      return _exhaustive;
    }
  }
}

/** Raw workflows settings from DB (includes secrets — server-side only). */
export async function readWorkflowsSettings(
  prisma: PrismaClient,
): Promise<WorkflowsSettings> {
  const row = await prisma.systemSetting.findUnique({ where: { key: 'workflows' } });
  return parseWorkflowsFromStorage(row?.value);
}

/** Maps platform workflows settings to the n8n client config shape. */
export async function readN8nConfig(prisma: PrismaClient): Promise<N8nConfig> {
  const settings = await readWorkflowsSettings(prisma);
  if (!settings.enabled) {
    return {
      baseUrl: null,
      resumeWorkflowPath: null,
      evaluationWorkflowPath: null,
      bgvWorkflowPath: null,
      webhookSecret: null,
      requestTimeoutMs: settings.requestTimeoutMs,
    };
  }
  return {
    baseUrl: settings.baseUrl,
    resumeWorkflowPath: settings.resumeWorkflowPath,
    evaluationWorkflowPath: settings.evaluationWorkflowPath,
    bgvWorkflowPath: settings.bgvWorkflowPath,
    webhookSecret: settings.webhookSecret,
    requestTimeoutMs: settings.requestTimeoutMs,
  };
}

export function maskWorkflowsSettingsForAdmin(
  value: unknown,
): Record<string, unknown> {
  const settings = parseWorkflowsFromStorage(value);
  return {
    ...settings,
    webhookSecret: settings.webhookSecret ? MASKED_SECRET : null,
  };
}

export function mergeWorkflowsSettingsUpdate(
  incoming: unknown,
  existing: unknown,
): WorkflowsSettings {
  const next = parseWorkflowsFromStorage(incoming);
  const prev = parseWorkflowsFromStorage(existing);
  const secret = trimOrNull(asObj(incoming).webhookSecret);
  if (!secret || secret === MASKED_SECRET) {
    next.webhookSecret = prev.webhookSecret;
  }
  return next;
}

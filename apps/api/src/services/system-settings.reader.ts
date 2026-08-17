import type { AutomationJobType, PrismaClient, Role } from '@prisma/client';
import type { AppConfig, N8nConfig, StorageConfig } from '../config/index.js';
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

export type PricingSettings = {
  currency: string;
  locale: string;
  supportedCurrencies: string[];
  defaultPayRate: number;
  defaultBillRate: number;
  minMarginPercent: number;
};

export type LocalizationSettings = {
  dateFormat: 'MMM d, yyyy' | 'dd/MM/yyyy' | 'yyyy-MM-dd';
  locale: string;
};

export type EmailSettings = {
  enabled: boolean;
  host: string;
  port: number;
  user: string | null;
  password: string | null;
  fromAddress: string | null;
  fromName: string | null;
  secure: boolean;
};

export type IntegrationsSettings = {
  oorwinEnabled: boolean;
  oorwinApiUrl: string | null;
  webhookUrl: string | null;
  smsProvider: 'none' | 'twilio' | 'whatsapp';
  smsApiKey: string | null;
  smsSenderId: string | null;
  whatsAppPhoneNumberId: string | null;
};

export type OrgDisplaySettings = {
  currency: string;
  locale: string;
  dateFormat: LocalizationSettings['dateFormat'];
  supportedCurrencies: string[];
};

const DEFAULT_PRICING: PricingSettings = {
  currency: 'USD',
  locale: 'en-US',
  supportedCurrencies: ['USD', 'EUR', 'GBP', 'INR'],
  defaultPayRate: 0,
  defaultBillRate: 0,
  minMarginPercent: 20,
};

const DEFAULT_LOCALIZATION: LocalizationSettings = {
  dateFormat: 'MMM d, yyyy',
  locale: 'en-US',
};

const DEFAULT_EMAIL: EmailSettings = {
  enabled: false,
  host: 'smtp.gmail.com',
  port: 587,
  user: null,
  password: null,
  fromAddress: null,
  fromName: null,
  secure: false,
};

const DEFAULT_INTEGRATIONS: IntegrationsSettings = {
  oorwinEnabled: false,
  oorwinApiUrl: null,
  webhookUrl: null,
  smsProvider: 'none',
  smsApiKey: null,
  smsSenderId: null,
  whatsAppPhoneNumberId: null,
};

const DATE_FORMATS = new Set<LocalizationSettings['dateFormat']>([
  'MMM d, yyyy',
  'dd/MM/yyyy',
  'yyyy-MM-dd',
]);

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

function parseStringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback;
  const items = value.filter(
    (item): item is string => typeof item === 'string' && Boolean(item.trim()),
  );
  return items.length > 0 ? items : fallback;
}

export async function readPricingSettings(prisma: PrismaClient): Promise<PricingSettings> {
  const row = await prisma.systemSetting.findUnique({ where: { key: 'pricing' } });
  const obj = asObj(row?.value);
  const currency = trimOrNull(obj.currency) ?? DEFAULT_PRICING.currency;
  const locale = trimOrNull(obj.locale) ?? DEFAULT_PRICING.locale;
  return {
    currency,
    locale,
    supportedCurrencies: parseStringArray(obj.supportedCurrencies, DEFAULT_PRICING.supportedCurrencies),
    defaultPayRate: Number.isFinite(Number(obj.defaultPayRate))
      ? Number(obj.defaultPayRate)
      : DEFAULT_PRICING.defaultPayRate,
    defaultBillRate: Number.isFinite(Number(obj.defaultBillRate))
      ? Number(obj.defaultBillRate)
      : DEFAULT_PRICING.defaultBillRate,
    minMarginPercent: Number.isFinite(Number(obj.minMarginPercent))
      ? Number(obj.minMarginPercent)
      : DEFAULT_PRICING.minMarginPercent,
  };
}

export async function readLocalizationSettings(
  prisma: PrismaClient,
): Promise<LocalizationSettings> {
  const row = await prisma.systemSetting.findUnique({ where: { key: 'localization' } });
  const obj = asObj(row?.value);
  const dateFormatRaw = trimOrNull(obj.dateFormat);
  const dateFormat = DATE_FORMATS.has(dateFormatRaw as LocalizationSettings['dateFormat'])
    ? (dateFormatRaw as LocalizationSettings['dateFormat'])
    : DEFAULT_LOCALIZATION.dateFormat;
  return {
    dateFormat,
    locale: trimOrNull(obj.locale) ?? DEFAULT_LOCALIZATION.locale,
  };
}

export async function readOrgDisplaySettings(prisma: PrismaClient): Promise<OrgDisplaySettings> {
  const [pricing, localization] = await Promise.all([
    readPricingSettings(prisma),
    readLocalizationSettings(prisma),
  ]);
  return {
    currency: pricing.currency,
    locale: localization.locale || pricing.locale,
    dateFormat: localization.dateFormat,
    supportedCurrencies: pricing.supportedCurrencies,
  };
}

function parseEmailFromStorage(value: unknown): EmailSettings {
  const obj = asObj(value);
  const port = Number(obj.port);
  return {
    enabled: obj.enabled === undefined ? DEFAULT_EMAIL.enabled : Boolean(obj.enabled),
    host: trimOrNull(obj.host) ?? DEFAULT_EMAIL.host,
    port: Number.isFinite(port) && port > 0 ? Math.floor(port) : DEFAULT_EMAIL.port,
    user: trimOrNull(obj.user),
    password: trimOrNull(obj.password),
    fromAddress: trimOrNull(obj.fromAddress),
    fromName: trimOrNull(obj.fromName),
    secure: obj.secure === undefined ? DEFAULT_EMAIL.secure : Boolean(obj.secure),
  };
}

export async function readEmailSettings(prisma: PrismaClient): Promise<EmailSettings> {
  const row = await prisma.systemSetting.findUnique({ where: { key: 'email' } });
  return parseEmailFromStorage(row?.value);
}

export function maskEmailSettingsForAdmin(value: unknown): Record<string, unknown> {
  const settings = parseEmailFromStorage(value);
  return {
    ...settings,
    password: settings.password ? MASKED_SECRET : null,
  };
}

export function mergeEmailSettingsUpdate(incoming: unknown, existing: unknown): EmailSettings {
  const next = parseEmailFromStorage(incoming);
  const prev = parseEmailFromStorage(existing);
  const password = trimOrNull(asObj(incoming).password);
  if (!password || password === MASKED_SECRET) {
    next.password = prev.password;
  }
  return next;
}

function parseIntegrationsFromStorage(value: unknown): IntegrationsSettings {
  const obj = asObj(value);
  const smsProviderRaw = trimOrNull(obj.smsProvider);
  const smsProvider =
    smsProviderRaw === 'twilio' || smsProviderRaw === 'whatsapp'
      ? smsProviderRaw
      : DEFAULT_INTEGRATIONS.smsProvider;
  return {
    oorwinEnabled:
      obj.oorwinEnabled === undefined
        ? DEFAULT_INTEGRATIONS.oorwinEnabled
        : Boolean(obj.oorwinEnabled),
    oorwinApiUrl: trimOrNull(obj.oorwinApiUrl),
    webhookUrl: trimOrNull(obj.webhookUrl),
    smsProvider,
    smsApiKey: trimOrNull(obj.smsApiKey),
    smsSenderId: trimOrNull(obj.smsSenderId),
    whatsAppPhoneNumberId: trimOrNull(obj.whatsAppPhoneNumberId),
  };
}

export async function readIntegrationsSettings(
  prisma: PrismaClient,
): Promise<IntegrationsSettings> {
  const row = await prisma.systemSetting.findUnique({ where: { key: 'integrations' } });
  return parseIntegrationsFromStorage(row?.value);
}

export function maskIntegrationsSettingsForAdmin(value: unknown): Record<string, unknown> {
  const settings = parseIntegrationsFromStorage(value);
  return {
    ...settings,
    smsApiKey: settings.smsApiKey ? MASKED_SECRET : null,
  };
}

export function mergeIntegrationsSettingsUpdate(
  incoming: unknown,
  existing: unknown,
): IntegrationsSettings {
  const next = parseIntegrationsFromStorage(incoming);
  const prev = parseIntegrationsFromStorage(existing);
  const apiKey = trimOrNull(asObj(incoming).smsApiKey);
  if (!apiKey || apiKey === MASKED_SECRET) {
    next.smsApiKey = prev.smsApiKey;
  }
  return next;
}

export type StorageSettings = {
  driver: 'local' | 's3' | null;
  region: string | null;
  bucket: string | null;
  accessKeyId: string | null;
  secretAccessKey: string | null;
  presignedUrlExpirySeconds: number | null;
  endpoint: string | null;
  forcePathStyle: boolean | null;
  localPath: string | null;
};

function parseStorageFromStorage(value: unknown): StorageSettings {
  const obj = asObj(value);
  const driverRaw = trimOrNull(obj.driver);
  const driver =
    driverRaw === 'local' || driverRaw === 's3' ? driverRaw : null;
  const expiry = Number(obj.presignedUrlExpirySeconds);
  return {
    driver,
    region: trimOrNull(obj.region),
    bucket: trimOrNull(obj.bucket),
    accessKeyId: trimOrNull(obj.accessKeyId),
    secretAccessKey: trimOrNull(obj.secretAccessKey),
    presignedUrlExpirySeconds:
      Number.isFinite(expiry) && expiry > 0 ? Math.floor(expiry) : null,
    endpoint: trimOrNull(obj.endpoint),
    forcePathStyle:
      obj.forcePathStyle === undefined || obj.forcePathStyle === null
        ? null
        : Boolean(obj.forcePathStyle),
    localPath: trimOrNull(obj.localPath),
  };
}

export async function readStorageSettings(prisma: PrismaClient): Promise<StorageSettings> {
  const row = await prisma.systemSetting.findUnique({ where: { key: 'storage' } });
  return parseStorageFromStorage(row?.value);
}

export function resolveStorageConfig(
  config: AppConfig,
  dbSettings?: StorageSettings | null,
): StorageConfig {
  const driver = dbSettings?.driver ?? config.storage.driver;
  if (driver === 's3') {
    const region = dbSettings?.region ?? config.storage.aws?.region;
    const bucket = dbSettings?.bucket ?? config.storage.aws?.bucket;
    if (!region || !bucket) {
      return config.storage;
    }
    return {
      driver: 's3',
      localPath: dbSettings?.localPath ?? config.storage.localPath,
      aws: {
        region,
        bucket,
        accessKeyId: dbSettings?.accessKeyId ?? config.storage.aws?.accessKeyId,
        secretAccessKey:
          dbSettings?.secretAccessKey ?? config.storage.aws?.secretAccessKey,
        presignedUrlExpirySeconds:
          dbSettings?.presignedUrlExpirySeconds ??
          config.storage.aws?.presignedUrlExpirySeconds ??
          3600,
        endpoint: dbSettings?.endpoint ?? config.storage.aws?.endpoint,
        forcePathStyle:
          dbSettings?.forcePathStyle ?? config.storage.aws?.forcePathStyle,
      },
    };
  }
  return {
    driver: 'local',
    localPath: dbSettings?.localPath ?? config.storage.localPath,
  };
}

export function maskStorageSettingsForAdmin(value: unknown): Record<string, unknown> {
  const settings = parseStorageFromStorage(value);
  return {
    ...settings,
    secretAccessKey: settings.secretAccessKey ? MASKED_SECRET : null,
  };
}

export function mergeStorageSettingsUpdate(
  incoming: unknown,
  existing: unknown,
): StorageSettings {
  const next = parseStorageFromStorage(incoming);
  const prev = parseStorageFromStorage(existing);
  const secret = trimOrNull(asObj(incoming).secretAccessKey);
  if (!secret || secret === MASKED_SECRET) {
    next.secretAccessKey = prev.secretAccessKey;
  }
  return next;
}

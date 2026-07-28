import type { PrismaClient, Role } from '@prisma/client';

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

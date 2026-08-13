import type { NotificationType, Prisma, PrismaClient, Role } from '@prisma/client';
import type { AppConfig } from '../config/index.js';
import { renderCommunicationTemplate } from './communication-template.service.js';
import { EmailService } from './email.service.js';

export type NotifyUsersInput = {
  organizationId: number;
  userIds: number[];
  type: NotificationType;
  title: string;
  body: string;
  actionUrl?: string | null;
  metadata?: Record<string, unknown>;
  /** Also send EMAIL channel notifications via SMTP when configured */
  sendEmail?: boolean;
  templateKey?: string;
  templateVariables?: Record<string, string | number | null | undefined>;
};

/**
 * Create in-app notifications (and optional email) for a set of users.
 */
export async function notifyUsers(
  prisma: PrismaClient,
  config: AppConfig,
  input: NotifyUsersInput,
): Promise<void> {
  const uniqueIds = [...new Set(input.userIds.filter((id) => Number.isFinite(id) && id > 0))];
  if (uniqueIds.length === 0) return;

  const now = new Date();
  await prisma.notification.createMany({
    data: uniqueIds.map((userId) => ({
      organizationId: BigInt(input.organizationId),
      userId: BigInt(userId),
      type: input.type,
      channel: 'IN_APP' as const,
      status: 'SENT' as const,
      title: input.title,
      body: input.body,
      actionUrl: input.actionUrl ?? null,
      sentAt: now,
      metadata: (input.metadata as Prisma.InputJsonValue | undefined) ?? undefined,
    })),
  });

  if (!input.sendEmail) return;

  const email = new EmailService(config, prisma);
  const rendered = input.templateKey
    ? await renderCommunicationTemplate(prisma, input.templateKey, {
        title: input.title,
        body: input.body,
        actionUrl: input.actionUrl ?? '',
        ...(input.templateVariables ?? {}),
      }, { subject: input.title, body: input.body })
    : { subject: input.title, body: input.body };

  const users = await prisma.user.findMany({
    where: {
      id: { in: uniqueIds.map((id) => BigInt(id)) },
      deletedAt: null,
      isActive: true,
    },
    select: { id: true, email: true, firstName: true },
  });

  for (const user of users) {
    let sent = false;
    let failureReason: string | null = null;
    try {
      const result = await email.sendNotificationEmail({
        to: user.email,
        firstName: user.firstName,
        title: input.title,
        body: rendered.body,
        subject: rendered.subject,
        actionUrl: input.actionUrl,
      });
      sent = result.sent;
      if (!sent) failureReason = 'Mail transport not configured';
    } catch (err) {
      failureReason = err instanceof Error ? err.message : 'Failed to send email';
    }

    await prisma.notification.create({
      data: {
        organizationId: BigInt(input.organizationId),
        userId: user.id,
        type: input.type,
        channel: 'EMAIL',
        status: sent ? 'SENT' : 'FAILED',
        title: input.title,
        body: input.body,
        actionUrl: input.actionUrl ?? null,
        sentAt: sent ? now : null,
        failedAt: sent ? null : now,
        failureReason,
        metadata: (input.metadata as Prisma.InputJsonValue | undefined) ?? undefined,
      },
    });
  }
}

export async function notifyOrgRoles(
  prisma: PrismaClient,
  config: AppConfig,
  input: {
    organizationId: number;
    roles: Role[];
    includeUserIds?: number[];
    type: NotificationType;
    title: string;
    body: string;
    actionUrl?: string | null;
    metadata?: Record<string, unknown>;
    sendEmail?: boolean;
    templateKey?: string;
    templateVariables?: Record<string, string | number | null | undefined>;
  },
): Promise<void> {
  const memberships = await prisma.membership.findMany({
    where: {
      organizationId: BigInt(input.organizationId),
      isActive: true,
      role: { in: input.roles },
      user: { deletedAt: null, isActive: true },
    },
    select: { userId: true },
  });

  const userIds = [
    ...(input.includeUserIds ?? []),
    ...memberships.map((m) => Number(m.userId)),
  ];

  await notifyUsers(prisma, config, {
    organizationId: input.organizationId,
    userIds,
    type: input.type,
    title: input.title,
    body: input.body,
    actionUrl: input.actionUrl,
    metadata: input.metadata,
    sendEmail: input.sendEmail ?? true,
    templateKey: input.templateKey,
    templateVariables: input.templateVariables,
  });
}

export async function notifyOrgMembersWithPermission(
  prisma: PrismaClient,
  config: AppConfig,
  input: {
    organizationId: number;
    permission: string;
    type: NotificationType;
    title: string;
    body: string;
    actionUrlForRole?: (role: Role) => string | null;
    defaultActionUrl?: string | null;
    metadata?: Record<string, unknown>;
    sendEmail?: boolean;
    templateKey?: string;
    templateVariables?: Record<string, string | number | null | undefined>;
  },
): Promise<void> {
  const { resolvePermissionsForMembership } = await import(
    '../modules/admin/admin-roles.service.js'
  );

  const memberships = await prisma.membership.findMany({
    where: {
      organizationId: BigInt(input.organizationId),
      isActive: true,
      user: { deletedAt: null, isActive: true },
    },
    select: { userId: true, role: true, platformRoleId: true },
  });

  const usersByActionUrl = new Map<string, number[]>();

  for (const membership of memberships) {
    const permissions = await resolvePermissionsForMembership(
      prisma,
      membership.role,
      membership.platformRoleId ? Number(membership.platformRoleId) : null,
    );
    if (!permissions.includes(input.permission)) continue;

    const actionUrl =
      input.actionUrlForRole?.(membership.role) ??
      input.defaultActionUrl ??
      null;
    const key = actionUrl ?? '';
    const existing = usersByActionUrl.get(key) ?? [];
    existing.push(Number(membership.userId));
    usersByActionUrl.set(key, existing);
  }

  for (const [actionUrl, userIds] of usersByActionUrl) {
    await notifyUsers(prisma, config, {
      organizationId: input.organizationId,
      userIds,
      type: input.type,
      title: input.title,
      body: input.body,
      actionUrl: actionUrl || null,
      metadata: input.metadata,
      sendEmail: input.sendEmail ?? true,
      templateKey: input.templateKey,
      templateVariables: input.templateVariables,
    });
  }
}

export interface EvaluationProcessedNotificationInput {
  organizationId: number;
  candidateId: number;
  candidateName: string;
  evaluationId: number;
  bestalScore: number | null;
  triggeredByUserId: number;
  webAppUrl: string;
}

export async function notifyEvaluationProcessed(
  prisma: PrismaClient,
  config: AppConfig,
  input: EvaluationProcessedNotificationInput,
): Promise<void> {
  const scoreLabel = input.bestalScore != null ? String(input.bestalScore) : 'pending';
  const body = `Evaluation for ${input.candidateName} was processed. BesTal score updated to ${scoreLabel}.`;

  await notifyOrgRoles(prisma, config, {
    organizationId: input.organizationId,
    roles: ['SUPER_ADMIN', 'ADMIN', 'RECRUITER'],
    includeUserIds: [input.triggeredByUserId],
    type: 'EVALUATION',
    title: 'Evaluation processed',
    body,
    actionUrl: `${input.webAppUrl.replace(/\/$/, '')}/recruiter/evaluations`,
    metadata: {
      evaluationId: input.evaluationId,
      candidateId: input.candidateId,
      bestalScore: input.bestalScore,
    },
    sendEmail: true,
    templateKey: 'evaluation.processed',
    templateVariables: {
      candidateName: input.candidateName,
      bestalScore: input.bestalScore != null ? String(input.bestalScore) : 'pending',
      actionUrl: `${input.webAppUrl.replace(/\/$/, '')}/recruiter/evaluations`,
    },
  });
}

export interface BgvAnalysisProcessedNotificationInput {
  organizationId: number;
  candidateId: number;
  candidateName: string;
  backgroundCheckId: number;
  bgvStatus: string;
  triggeredByUserId: number;
  webAppUrl: string;
}

export async function notifyBgvAnalysisProcessed(
  prisma: PrismaClient,
  config: AppConfig,
  input: BgvAnalysisProcessedNotificationInput,
): Promise<void> {
  const body = `BGV report for ${input.candidateName} was analyzed. Status: ${input.bgvStatus.replace(/_/g, ' ')}. Review check results and approve when ready.`;

  await notifyOrgRoles(prisma, config, {
    organizationId: input.organizationId,
    roles: ['SUPER_ADMIN', 'ADMIN'],
    includeUserIds: [input.triggeredByUserId],
    type: 'BACKGROUND_CHECK',
    title: 'BGV report analyzed',
    body,
    actionUrl: `${input.webAppUrl.replace(/\/$/, '')}/admin/background-checks`,
    metadata: {
      backgroundCheckId: input.backgroundCheckId,
      candidateId: input.candidateId,
      bgvStatus: input.bgvStatus,
    },
    sendEmail: true,
    templateKey: 'bgv.analyzed',
    templateVariables: {
      candidateName: input.candidateName,
      bgvStatus: input.bgvStatus.replace(/_/g, ' '),
      actionUrl: `${input.webAppUrl.replace(/\/$/, '')}/admin/background-checks`,
    },
  });
}

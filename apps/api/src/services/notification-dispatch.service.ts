import type { NotificationType, Prisma, PrismaClient, Role } from '@prisma/client';
import type { AppConfig } from '../config/index.js';
import { EmailService } from './email.service.js';

export type NotifyUsersInput = {
  organizationId: number;
  userIds: number[];
  type: NotificationType;
  title: string;
  body: string;
  actionUrl?: string | null;
  metadata?: Record<string, unknown>;
  /** Also send EMAIL channel notifications via FROM_MAIL SMTP when configured */
  sendEmail?: boolean;
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

  const email = new EmailService(config);
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
        body: input.body,
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
  });
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
  });
}

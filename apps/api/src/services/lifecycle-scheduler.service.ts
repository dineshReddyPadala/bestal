import type { FastifyInstance } from 'fastify';
import { notifyReminder } from './notification-events.js';
import { readNotificationsSettings } from './system-settings.reader.js';

const INTERVAL_MS = 30 * 60 * 1000;

function startOfUtcDay(d = new Date()): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function addDays(d: Date, days: number): Date {
  const next = new Date(d);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Periodic job: expire deployments/trials, restore candidate visibility, send reminders.
 */
export class LifecycleSchedulerService {
  private timer: ReturnType<typeof setInterval> | null = null;
  private running = false;

  constructor(private readonly fastify: FastifyInstance) {}

  start(): void {
    if (this.timer) return;
    void this.tick();
    this.timer = setInterval(() => {
      void this.tick();
    }, INTERVAL_MS);
    this.timer.unref?.();
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async tick(): Promise<void> {
    if (this.running) return;
    this.running = true;
    try {
      await this.completeExpiredDeployments();
      await this.completeExpiredTrials();
      await this.sendEndingSoonReminders();
    } catch (err) {
      this.fastify.log.error({ err }, 'Lifecycle scheduler tick failed');
    } finally {
      this.running = false;
    }
  }

  async hideCandidateForActiveDeployment(
    organizationId: number,
    candidateId: number,
  ): Promise<void> {
    await this.fastify.prisma.candidate.updateMany({
      where: {
        id: BigInt(candidateId),
        organizationId: BigInt(organizationId),
        deletedAt: null,
      },
      data: {
        visibility: 'HIDDEN',
        status: 'PLACED',
      },
    });
  }

  async restoreCandidateIfNotDeployed(
    organizationId: number,
    candidateId: number,
  ): Promise<void> {
    const active = await this.fastify.prisma.deployment.findFirst({
      where: {
        organizationId: BigInt(organizationId),
        candidateId: BigInt(candidateId),
        status: 'ACTIVE',
        deletedAt: null,
      },
      select: { id: true },
    });
    if (active) return;

    const candidate = await this.fastify.prisma.candidate.findFirst({
      where: {
        id: BigInt(candidateId),
        organizationId: BigInt(organizationId),
        deletedAt: null,
        visibility: 'HIDDEN',
      },
      select: {
        id: true,
        approvalStatus: true,
      },
    });
    if (!candidate) return;

    if (candidate.approvalStatus !== 'APPROVED') return;

    await this.fastify.prisma.candidate.update({
      where: { id: candidate.id },
      data: {
        visibility: 'CLIENT_VISIBLE',
        status: 'ACTIVE',
      },
    });
  }

  private async completeExpiredDeployments(): Promise<void> {
    const today = startOfUtcDay();
    const expired = await this.fastify.prisma.deployment.findMany({
      where: {
        status: 'ACTIVE',
        deletedAt: null,
        endDate: { lt: today },
      },
      include: {
        candidate: { select: { firstName: true, lastName: true } },
        client: { select: { name: true } },
      },
    });

    for (const deployment of expired) {
      await this.fastify.prisma.deployment.update({
        where: { id: deployment.id },
        data: { status: 'COMPLETED' },
      });

      const orgId = Number(deployment.organizationId);
      const candidateId = Number(deployment.candidateId);
      await this.restoreCandidateIfNotDeployed(orgId, candidateId);

      const reminderKey = `deploy-ended:${deployment.id}`;
      await notifyReminder(this.fastify.prisma, this.fastify.config, {
        organizationId: orgId,
        reminderKey,
        type: 'DEPLOYMENT',
        title: 'Deployment ended',
        body: `Deployment for ${deployment.candidate.firstName} ${deployment.candidate.lastName} (${deployment.roleTitle}) ended.`,
        actionUrl: `${this.fastify.config.webAppUrl.replace(/\/$/, '')}/admin/deployments`,
        roles: ['SUPER_ADMIN', 'ADMIN', 'SALES'],
        userIds: [
          Number(deployment.createdById),
          ...(deployment.requestedById ? [Number(deployment.requestedById)] : []),
        ],
      });
    }
  }

  private async completeExpiredTrials(): Promise<void> {
    const today = startOfUtcDay();
    const expired = await this.fastify.prisma.trialRequest.findMany({
      where: {
        deletedAt: null,
        status: { in: ['APPROVED', 'IN_PROGRESS'] },
        endDate: { lt: today },
      },
      include: {
        candidate: { select: { firstName: true, lastName: true } },
      },
    });

    for (const trial of expired) {
      await this.fastify.prisma.trialRequest.update({
        where: { id: trial.id },
        data: { status: 'COMPLETED' },
      });

      const reminderKey = `trial-expired:${trial.id}`;
      await notifyReminder(this.fastify.prisma, this.fastify.config, {
        organizationId: Number(trial.organizationId),
        reminderKey,
        type: 'TRIAL',
        title: 'Trial expired',
        body: `Trial for ${trial.candidate.firstName} ${trial.candidate.lastName} has ended.`,
        actionUrl: `${this.fastify.config.webAppUrl.replace(/\/$/, '')}/admin/trials`,
        roles: ['ADMIN', 'SALES'],
        userIds: [
          Number(trial.requestedById),
          ...(trial.assignedRecruiterId
            ? [Number(trial.assignedRecruiterId)]
            : []),
        ],
      });
    }
  }

  private async sendEndingSoonReminders(): Promise<void> {
    const settings = await readNotificationsSettings(this.fastify.prisma);
    const today = startOfUtcDay();

    if (settings.trialEndingSoonDays > 0) {
      const trialCutoff = addDays(today, settings.trialEndingSoonDays);
      const trials = await this.fastify.prisma.trialRequest.findMany({
        where: {
          deletedAt: null,
          status: { in: ['APPROVED', 'IN_PROGRESS'] },
          endDate: { gte: today, lte: trialCutoff },
        },
        include: {
          candidate: { select: { firstName: true, lastName: true } },
        },
      });

      for (const trial of trials) {
        if (!trial.endDate) continue;
        const reminderKey = `trial-ending:${trial.id}:${dateKey(trial.endDate)}`;
        await notifyReminder(this.fastify.prisma, this.fastify.config, {
          organizationId: Number(trial.organizationId),
          reminderKey,
          type: 'TRIAL',
          title: 'Trial ending soon',
          body: `Trial for ${trial.candidate.firstName} ${trial.candidate.lastName} ends on ${dateKey(trial.endDate)}.`,
          actionUrl: `${this.fastify.config.webAppUrl.replace(/\/$/, '')}/admin/trials`,
          roles: ['ADMIN', 'SALES'],
          userIds: [
            Number(trial.requestedById),
            ...(trial.assignedRecruiterId
              ? [Number(trial.assignedRecruiterId)]
              : []),
          ],
        });
      }
    }

    if (settings.deploymentEndingSoonDays > 0) {
      const deployCutoff = addDays(today, settings.deploymentEndingSoonDays);
      const deployments = await this.fastify.prisma.deployment.findMany({
        where: {
          deletedAt: null,
          status: 'ACTIVE',
          endDate: { gte: today, lte: deployCutoff },
        },
        include: {
          candidate: { select: { firstName: true, lastName: true } },
        },
      });

      for (const deployment of deployments) {
        if (!deployment.endDate) continue;
        const reminderKey = `deploy-ending:${deployment.id}:${dateKey(deployment.endDate)}`;

        const clientUsers = await this.fastify.prisma.membership.findMany({
          where: {
            organizationId: deployment.organizationId,
            clientId: deployment.clientId,
            isActive: true,
            role: 'CLIENT',
            user: { deletedAt: null, isActive: true },
          },
          select: { userId: true },
        });

        await notifyReminder(this.fastify.prisma, this.fastify.config, {
          organizationId: Number(deployment.organizationId),
          reminderKey,
          type: 'DEPLOYMENT',
          title: 'Deployment ending soon',
          body: `Deployment for ${deployment.candidate.firstName} ${deployment.candidate.lastName} (${deployment.roleTitle}) ends on ${dateKey(deployment.endDate)}.`,
          actionUrl: `${this.fastify.config.webAppUrl.replace(/\/$/, '')}/admin/deployments`,
          roles: ['SUPER_ADMIN', 'ADMIN', 'SALES'],
          userIds: [
            Number(deployment.createdById),
            ...(deployment.requestedById
              ? [Number(deployment.requestedById)]
              : []),
            ...clientUsers.map((m) => Number(m.userId)),
          ],
        });
      }
    }
  }
}

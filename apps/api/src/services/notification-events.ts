import type { NotificationType, PrismaClient, Role } from '@prisma/client';
import type { AppConfig } from '../config/index.js';
import { PERMISSIONS } from '../modules/auth/auth.permissions.js';
import { notifyOrgMembersWithPermission, notifyOrgRoles, notifyUsers } from './notification-dispatch.service.js';
import { readNotificationsSettings } from './system-settings.reader.js';

function webUrl(config: AppConfig, path: string): string {
  return `${config.webAppUrl.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
}

async function safeNotify(label: string, fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
  } catch (err) {
    console.error(`[notifications] ${label} failed`, err);
  }
}

export async function reminderAlreadySent(
  prisma: PrismaClient,
  reminderKey: string,
): Promise<boolean> {
  const existing = await prisma.notification.findFirst({
    where: {
      deletedAt: null,
      metadata: { path: ['reminderKey'], equals: reminderKey },
    },
    select: { id: true },
  });
  return Boolean(existing);
}

async function notifyWithEmailFlag(
  prisma: PrismaClient,
  config: AppConfig,
  input: {
    organizationId: number;
    roles?: Role[];
    userIds?: number[];
    type: NotificationType;
    title: string;
    body: string;
    actionUrl?: string | null;
    metadata?: Record<string, unknown>;
  },
): Promise<void> {
  const settings = await readNotificationsSettings(prisma);
  if (input.roles?.length) {
    await notifyOrgRoles(prisma, config, {
      organizationId: input.organizationId,
      roles: input.roles,
      includeUserIds: input.userIds,
      type: input.type,
      title: input.title,
      body: input.body,
      actionUrl: input.actionUrl,
      metadata: input.metadata,
      sendEmail: settings.emailEnabled,
    });
    return;
  }
  await notifyUsers(prisma, config, {
    organizationId: input.organizationId,
    userIds: input.userIds ?? [],
    type: input.type,
    title: input.title,
    body: input.body,
    actionUrl: input.actionUrl,
    metadata: input.metadata,
    sendEmail: settings.emailEnabled,
  });
}

export async function notifyTrialRequested(
  prisma: PrismaClient,
  config: AppConfig,
  input: {
    organizationId: number;
    trialId: number;
    candidateName: string;
    clientName: string;
    requestedById: number;
    count?: number;
  },
): Promise<void> {
  const count = input.count ?? 1;
  await safeNotify('trial-requested', async () => {
    const settings = await readNotificationsSettings(prisma);
    await notifyWithEmailFlag(prisma, config, {
      organizationId: input.organizationId,
      roles: ['SUPER_ADMIN', 'ADMIN', 'SALES', 'RECRUITER'],
      type: 'TRIAL',
      title: count > 1 ? `${count} free trial requests` : 'Free trial requested',
      body:
        count > 1
          ? `${input.clientName} requested free trials for ${count} candidates (including ${input.candidateName}).`
          : `${input.clientName} requested a free trial for ${input.candidateName}.`,
      actionUrl: webUrl(config, '/admin/trials'),
      metadata: { trialId: input.trialId, event: 'trial_requested' },
    });
    await notifyUsers(prisma, config, {
      organizationId: input.organizationId,
      userIds: [input.requestedById],
      type: 'TRIAL',
      title: 'Trial request submitted',
      body: `Your trial request for ${input.candidateName} was submitted. You'll be notified when it is reviewed.`,
      actionUrl: webUrl(config, '/client/trials'),
      sendEmail: settings.emailEnabled,
      metadata: { trialId: input.trialId, event: 'trial_requested_sender' },
    });
  });
}

export async function notifyJobRequestSubmitted(
  prisma: PrismaClient,
  config: AppConfig,
  input: {
    organizationId: number;
    jobRequestId: number;
    companyName: string;
    jobTitle: string;
  },
): Promise<void> {
  await safeNotify('job-request-submitted', () =>
    notifyWithEmailFlag(prisma, config, {
      organizationId: input.organizationId,
      roles: ['ADMIN', 'SALES', 'SUPER_ADMIN'],
      type: 'GENERAL',
      title: 'New client enquiry',
      body: `${input.companyName} submitted a client enquiry for ${input.jobTitle}.`,
      actionUrl: webUrl(config, `/super-admin/client-enquiries/${input.jobRequestId}`),
      metadata: { jobRequestId: input.jobRequestId, event: 'job_request_submitted' },
    }),
  );
}

export async function notifyTrialStatusChanged(
  prisma: PrismaClient,
  config: AppConfig,
  input: {
    organizationId: number;
    trialId: number;
    status: string;
    candidateName: string;
    requestedById: number;
    assignedRecruiterId?: number | null;
    actedById?: number | null;
    maxTrialHours?: number | null;
    approvedAndStarted?: boolean;
  },
): Promise<void> {
  const userIds = [
    input.requestedById,
    ...(input.assignedRecruiterId ? [input.assignedRecruiterId] : []),
    ...(input.actedById ? [input.actedById] : []),
  ];

  const isApproved = input.status === 'APPROVED';
  const isApprovedAndStarted =
    input.approvedAndStarted === true && input.status === 'IN_PROGRESS';
  const title = isApprovedAndStarted
    ? 'Trial period approved'
    : isApproved
      ? 'Trial period approved'
      : `Trial ${input.status.toLowerCase().replace(/_/g, ' ')}`;
  const body = isApprovedAndStarted
    ? input.maxTrialHours != null
      ? `Trial for ${input.candidateName} has been approved and started for up to ${input.maxTrialHours} hours.`
      : `Trial for ${input.candidateName} has been approved and started.`
    : isApproved
      ? input.maxTrialHours != null
        ? `Trial for ${input.candidateName} has been approved for up to ${input.maxTrialHours} hours.`
        : `Trial for ${input.candidateName} has been approved.`
      : `Trial for ${input.candidateName} is now ${input.status.replace(/_/g, ' ').toLowerCase()}.`;

  await safeNotify('trial-status', () =>
    notifyWithEmailFlag(prisma, config, {
      organizationId: input.organizationId,
      userIds,
      roles: ['SUPER_ADMIN', 'ADMIN', 'SALES', 'RECRUITER'],
      type: 'TRIAL',
      title,
      body,
      actionUrl: webUrl(config, '/client/trials'),
      metadata: {
        trialId: input.trialId,
        event: 'trial_status',
        status: input.status,
        ...(input.maxTrialHours != null ? { maxTrialHours: input.maxTrialHours } : {}),
      },
    }),
  );
}

export async function notifyDeploymentRequested(
  prisma: PrismaClient,
  config: AppConfig,
  input: {
    organizationId: number;
    deploymentId: number;
    candidateName: string;
    clientName: string;
    roleTitle: string;
    requestedById: number;
  },
): Promise<void> {
  await safeNotify('deployment-requested', async () => {
    const settings = await readNotificationsSettings(prisma);
    await notifyWithEmailFlag(prisma, config, {
      organizationId: input.organizationId,
      roles: ['SUPER_ADMIN', 'ADMIN', 'SALES', 'RECRUITER'],
      type: 'DEPLOYMENT',
      title: 'Deployment request pending',
      body: `${input.clientName} requested deployment of ${input.candidateName} as ${input.roleTitle}.`,
      actionUrl: webUrl(config, '/admin/deployments'),
      metadata: { deploymentId: input.deploymentId, event: 'deployment_requested' },
    });
    await notifyUsers(prisma, config, {
      organizationId: input.organizationId,
      userIds: [input.requestedById],
      type: 'DEPLOYMENT',
      title: 'Deployment request submitted',
      body: `Your deployment request for ${input.candidateName} (${input.roleTitle}) was submitted.`,
      actionUrl: webUrl(config, '/client/deployments'),
      sendEmail: settings.emailEnabled,
      metadata: { deploymentId: input.deploymentId, event: 'deployment_requested_sender' },
    });
  });
}

export async function notifyDeploymentStatusChanged(
  prisma: PrismaClient,
  config: AppConfig,
  input: {
    organizationId: number;
    deploymentId: number;
    status: string;
    candidateName: string;
    roleTitle: string;
    createdById: number;
    requestedById?: number | null;
    clientId: number;
    actedById?: number | null;
  },
): Promise<void> {
  const memberships = await prisma.membership.findMany({
    where: {
      organizationId: BigInt(input.organizationId),
      clientId: BigInt(input.clientId),
      isActive: true,
      role: 'CLIENT',
      user: { deletedAt: null, isActive: true },
    },
    select: { userId: true },
  });
  const userIds = [
    input.createdById,
    ...(input.requestedById ? [input.requestedById] : []),
    ...(input.actedById ? [input.actedById] : []),
    ...memberships.map((m) => Number(m.userId)),
  ];

  await safeNotify('deployment-status', () =>
    notifyWithEmailFlag(prisma, config, {
      organizationId: input.organizationId,
      userIds,
      roles: ['SUPER_ADMIN', 'ADMIN', 'SALES', 'RECRUITER'],
      type: 'DEPLOYMENT',
      title: `Deployment ${input.status.toLowerCase().replace(/_/g, ' ')}`,
      body: `Deployment for ${input.candidateName} (${input.roleTitle}) is now ${input.status.replace(/_/g, ' ').toLowerCase()}.`,
      actionUrl: webUrl(config, '/client/deployments'),
      metadata: {
        deploymentId: input.deploymentId,
        event: 'deployment_status',
        status: input.status,
      },
    }),
  );
}

export async function notifyCandidatePendingApproval(
  prisma: PrismaClient,
  config: AppConfig,
  input: {
    organizationId: number;
    candidateId: number;
    candidateName: string;
    submittedById?: number | null;
  },
): Promise<void> {
  await safeNotify('candidate-pending', async () => {
    const settings = await readNotificationsSettings(prisma);
    await notifyOrgRoles(prisma, config, {
      organizationId: input.organizationId,
      roles: ['SUPER_ADMIN'],
      type: 'SYSTEM',
      title: 'Candidate pending approval',
      body: `${input.candidateName} was submitted for approval.`,
      actionUrl: webUrl(config, '/super-admin/candidates'),
      metadata: { candidateId: input.candidateId, event: 'candidate_pending_approval' },
      sendEmail: settings.emailEnabled,
    });
    await notifyOrgRoles(prisma, config, {
      organizationId: input.organizationId,
      roles: ['ADMIN'],
      type: 'SYSTEM',
      title: 'Candidate pending approval',
      body: `${input.candidateName} was submitted for approval.`,
      actionUrl: webUrl(config, '/admin/candidate-approvals'),
      metadata: { candidateId: input.candidateId, event: 'candidate_pending_approval' },
      sendEmail: settings.emailEnabled,
    });
    await notifyOrgRoles(prisma, config, {
      organizationId: input.organizationId,
      roles: ['RECRUITER'],
      type: 'SYSTEM',
      title: 'Candidate submitted for approval',
      body: `${input.candidateName} was submitted for approval.`,
      actionUrl: webUrl(config, `/recruiter/candidates/${input.candidateId}`),
      metadata: { candidateId: input.candidateId, event: 'candidate_pending_approval_recruiter' },
      sendEmail: settings.emailEnabled,
    });
    if (input.submittedById) {
      await notifyUsers(prisma, config, {
        organizationId: input.organizationId,
        userIds: [input.submittedById],
        type: 'SYSTEM',
        title: 'Candidate submitted for approval',
        body: `${input.candidateName} was submitted for approval. You'll be notified when reviewed.`,
        actionUrl: webUrl(config, `/recruiter/candidates/${input.candidateId}`),
        sendEmail: settings.emailEnabled,
        metadata: {
          candidateId: input.candidateId,
          event: 'candidate_pending_approval_sender',
        },
      });
    }
  });
}

export async function notifyCandidateApproved(
  prisma: PrismaClient,
  config: AppConfig,
  input: {
    organizationId: number;
    candidateId: number;
    candidateName: string;
    approvedById: number;
    createdById?: number | null;
  },
): Promise<void> {
  await safeNotify('candidate-approved', async () => {
    const settings = await readNotificationsSettings(prisma);
    const receiverIds = [
      ...(input.createdById ? [input.createdById] : []),
    ];
    if (receiverIds.length > 0) {
      await notifyUsers(prisma, config, {
        organizationId: input.organizationId,
        userIds: receiverIds,
        type: 'SYSTEM',
        title: 'Candidate approved',
        body: `${input.candidateName} was approved and is ready for the next step.`,
        actionUrl: webUrl(config, `/recruiter/candidates/${input.candidateId}`),
        sendEmail: settings.emailEnabled,
        metadata: { candidateId: input.candidateId, event: 'candidate_approved' },
      });
    }
    await notifyUsers(prisma, config, {
      organizationId: input.organizationId,
      userIds: [input.approvedById],
      type: 'SYSTEM',
      title: 'Approval recorded',
      body: `You approved ${input.candidateName}.`,
      actionUrl: webUrl(config, `/super-admin/candidates/${input.candidateId}`),
      sendEmail: settings.emailEnabled,
      metadata: { candidateId: input.candidateId, event: 'candidate_approved_by' },
    });
    await notifyOrgMembersWithPermission(prisma, config, {
      organizationId: input.organizationId,
      permission: PERMISSIONS.CANDIDATES_APPROVE,
      type: 'SYSTEM',
      title: 'Candidate approved',
      body: `${input.candidateName} was approved.`,
      actionUrlForRole: (role) =>
        role === 'SUPER_ADMIN'
          ? webUrl(config, `/super-admin/candidates/${input.candidateId}`)
          : webUrl(config, '/admin/candidate-approvals'),
      metadata: { candidateId: input.candidateId, event: 'candidate_approved_staff' },
      sendEmail: settings.emailEnabled,
    });
  });
}

export async function notifyCandidateSentBack(
  prisma: PrismaClient,
  config: AppConfig,
  input: {
    organizationId: number;
    candidateId: number;
    candidateName: string;
    createdById?: number | null;
    reason?: string | null;
  },
): Promise<void> {
  const reasonNote = input.reason?.trim()
    ? ` Reason: ${input.reason.trim()}`
    : '';
  await safeNotify('candidate-sent-back', () =>
    notifyWithEmailFlag(prisma, config, {
      organizationId: input.organizationId,
      roles: ['RECRUITER'],
      userIds: input.createdById ? [input.createdById] : undefined,
      type: 'SYSTEM',
      title: 'Candidate sent back for updates',
      body: `${input.candidateName} was sent back to you for updates.${reasonNote}`,
      actionUrl: webUrl(config, `/recruiter/candidates/${input.candidateId}/edit`),
      metadata: {
        candidateId: input.candidateId,
        event: 'candidate_sent_back',
        reason: input.reason ?? null,
      },
    }),
  );
}

export async function notifyImportBatchFinished(
  prisma: PrismaClient,
  config: AppConfig,
  input: {
    organizationId: number;
    batchId: number;
    status: 'COMPLETED' | 'FAILED';
    uploadedById: number;
    successCount: number;
    failCount: number;
    skipCount: number;
  },
): Promise<void> {
  const settings = await readNotificationsSettings(prisma);
  await safeNotify('import-finished', () =>
    notifyWithEmailFlag(prisma, config, {
      organizationId: input.organizationId,
      roles: settings.importNotifyRoles,
      userIds: [input.uploadedById],
      type: 'SYSTEM',
      title:
        input.status === 'COMPLETED'
          ? 'Candidate import completed'
          : 'Candidate import failed',
      body: `Import #${input.batchId}: ${input.successCount} success, ${input.failCount} failed, ${input.skipCount} skipped.`,
      actionUrl: webUrl(config, '/admin/candidates/import'),
      metadata: {
        batchId: input.batchId,
        event: 'import_finished',
        status: input.status,
      },
    }),
  );
}

export async function notifyClientOnboarded(
  prisma: PrismaClient,
  config: AppConfig,
  input: {
    organizationId: number;
    clientId: number;
    clientName: string;
    kind: 'created' | 'user_linked';
    userEmail?: string;
    title?: string;
    body?: string;
  },
): Promise<void> {
  const defaultTitle =
    input.kind === 'created' ? 'New client onboarded' : 'Client user linked';
  const defaultBody =
    input.kind === 'created'
      ? `${input.clientName} was created.`
      : `${input.userEmail ?? 'A user'} was linked to ${input.clientName}.`;

  await safeNotify('client-onboard', () =>
    notifyWithEmailFlag(prisma, config, {
      organizationId: input.organizationId,
      roles: ['SUPER_ADMIN', 'ADMIN', 'SALES'],
      type: 'SYSTEM',
      title: input.title ?? defaultTitle,
      body: input.body ?? defaultBody,
      actionUrl: webUrl(config, `/super-admin/clients/${input.clientId}`),
      metadata: {
        clientId: input.clientId,
        event: 'client_onboard',
        kind: input.kind,
      },
    }),
  );
}

export async function notifyReminder(
  prisma: PrismaClient,
  config: AppConfig,
  input: {
    organizationId: number;
    reminderKey: string;
    type: NotificationType;
    title: string;
    body: string;
    actionUrl: string;
    roles?: Role[];
    userIds?: number[];
  },
): Promise<boolean> {
  if (await reminderAlreadySent(prisma, input.reminderKey)) {
    return false;
  }
  await safeNotify(`reminder:${input.reminderKey}`, () =>
    notifyWithEmailFlag(prisma, config, {
      organizationId: input.organizationId,
      roles: input.roles,
      userIds: input.userIds,
      type: input.type,
      title: input.title,
      body: input.body,
      actionUrl: input.actionUrl,
      metadata: { reminderKey: input.reminderKey, event: 'reminder' },
    }),
  );
  return true;
}

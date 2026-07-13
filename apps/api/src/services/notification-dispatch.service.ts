import type { PrismaClient } from '@prisma/client';

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
  input: EvaluationProcessedNotificationInput,
): Promise<void> {
  const memberships = await prisma.membership.findMany({
    where: {
      organizationId: BigInt(input.organizationId),
      isActive: true,
      role: { in: ['SUPER_ADMIN', 'ADMIN', 'RECRUITER'] },
      user: { deletedAt: null, isActive: true },
    },
    select: { userId: true },
  });

  const recipientIds = new Set<number>([
    input.triggeredByUserId,
    ...memberships.map((m) => Number(m.userId)),
  ]);

  const scoreLabel = input.bestalScore != null ? String(input.bestalScore) : 'pending';
  const body = `Evaluation for ${input.candidateName} was processed. BesTal score updated to ${scoreLabel}.`;

  await prisma.notification.createMany({
    data: [...recipientIds].map((userId) => ({
      organizationId: BigInt(input.organizationId),
      userId: BigInt(userId),
      type: 'EVALUATION' as const,
      channel: 'IN_APP' as const,
      status: 'SENT' as const,
      title: 'Evaluation processed',
      body,
      actionUrl: `${input.webAppUrl.replace(/\/$/, '')}/recruiter/evaluations`,
      sentAt: new Date(),
      metadata: {
        evaluationId: input.evaluationId,
        candidateId: input.candidateId,
        bestalScore: input.bestalScore,
      },
    })),
  });
}

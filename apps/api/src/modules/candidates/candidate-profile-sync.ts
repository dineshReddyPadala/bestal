import type { CandidateProfileStatus, PrismaClient } from '@prisma/client';
import {
  deriveProfileStatusFromEvidence,
  isClearBgvStatus,
} from './candidate-import-status.js';
import {
  isSuperAdminPipelineComplete,
  type PipelineCandidateSnapshot,
} from './candidate-pipeline.js';
import { notifyCandidatePendingApproval } from '../../services/notification-events.js';
import type { AppConfig } from '../../config/index.js';

export async function syncImportedCandidateProfileStatus(
  prisma: PrismaClient,
  organizationId: number,
  candidateId: number,
): Promise<CandidateProfileStatus | null> {
  const candidate = await prisma.candidate.findFirst({
    where: {
      id: BigInt(candidateId),
      organizationId: BigInt(organizationId),
      deletedAt: null,
    },
    select: {
      sourceCandidateId: true,
      profileStatus: true,
      submittedForApprovalAt: true,
      bgvStatus: true,
      clientBillRate: true,
      availabilityStatus: true,
      availableFrom: true,
    },
  });

  if (!candidate?.sourceCandidateId?.trim()) {
    return null;
  }
  if (candidate.submittedForApprovalAt) {
    return candidate.profileStatus;
  }

  const evaluationCount = await prisma.evaluation.count({
    where: {
      organizationId: BigInt(organizationId),
      candidateId: BigInt(candidateId),
      deletedAt: null,
    },
  });

  const nextStatus = deriveProfileStatusFromEvidence({
    hasEvaluations: evaluationCount > 0,
    bgvStatus: candidate.bgvStatus,
    billRate:
      candidate.clientBillRate != null ? Number(candidate.clientBillRate) : null,
    availabilityStatus: candidate.availabilityStatus,
    availableFrom: candidate.availableFrom?.toISOString().slice(0, 10) ?? null,
  });

  if (nextStatus !== candidate.profileStatus) {
    await prisma.candidate.update({
      where: {
        id: BigInt(candidateId),
        organizationId: BigInt(organizationId),
      },
      data: { profileStatus: nextStatus },
    });
  }

  return nextStatus;
}

export async function maybeAutoSubmitSuperAdminCandidate(
  prisma: PrismaClient,
  config: AppConfig,
  organizationId: number,
  candidateId: number,
  submittedById?: number | null,
): Promise<boolean> {
  const candidate = await prisma.candidate.findFirst({
    where: {
      id: BigInt(candidateId),
      organizationId: BigInt(organizationId),
      deletedAt: null,
    },
    select: {
      sourceCandidateId: true,
      submittedForApprovalAt: true,
      approvalStatus: true,
      profileStatus: true,
      visibility: true,
      resumeDocumentId: true,
      evaluationStatus: true,
      bgvStatus: true,
      aiSummary: true,
      aiScreeningStatus: true,
      clientBillRate: true,
      availabilityStatus: true,
      availableFrom: true,
      firstName: true,
      lastName: true,
    },
  });

  if (!candidate) return false;
  if (candidate.sourceCandidateId?.trim()) return false;
  if (candidate.submittedForApprovalAt) return false;
  if (candidate.profileStatus === 'PENDING_APPROVAL') return false;

  const snapshot: PipelineCandidateSnapshot = {
    profileStatus: candidate.profileStatus,
    approvalStatus: candidate.approvalStatus,
    visibility: candidate.visibility,
    resumeDocumentId: candidate.resumeDocumentId,
    evaluationStatus: candidate.evaluationStatus,
    bgvStatus: candidate.bgvStatus,
    aiSummary: candidate.aiSummary,
    aiScreeningStatus: candidate.aiScreeningStatus,
    sourceCandidateId: candidate.sourceCandidateId,
    clientBillRate: candidate.clientBillRate,
    availabilityStatus: candidate.availabilityStatus,
    availableFrom: candidate.availableFrom,
    submittedForApprovalAt: candidate.submittedForApprovalAt,
  };

  if (!isSuperAdminPipelineComplete(snapshot)) {
    return false;
  }

  await prisma.candidate.update({
    where: {
      id: BigInt(candidateId),
      organizationId: BigInt(organizationId),
    },
    data: {
      approvalStatus: 'PENDING',
      profileStatus: 'PENDING_APPROVAL',
      submittedForApprovalAt: new Date(),
    },
  });

  await notifyCandidatePendingApproval(prisma, config, {
    organizationId,
    candidateId,
    candidateName: `${candidate.firstName} ${candidate.lastName}`.trim(),
    submittedById: submittedById ?? undefined,
  });

  return true;
}

export function mapBgvStatusToCandidateBgv(status: string | null | undefined): string {
  if (!status) return 'NOT_STARTED';
  if (isClearBgvStatus(status)) return 'CLEAR';
  if (status === 'FAILED' || status === 'REJECTED') return 'FAILED';
  return 'IN_PROGRESS';
}

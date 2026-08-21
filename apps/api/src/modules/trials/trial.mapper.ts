import type { Prisma } from '@prisma/client';
import { bigintToNumber } from '../../utils/index.js';
import type { TrialDto, TrialListItemDto } from './trial.types.js';
import type { TrialRecord } from './trial.repository.js';

function formatPersonName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`;
}

export function mapTrialToDto(trial: TrialRecord): TrialDto {
  return {
    id: bigintToNumber(trial.id),
    organizationId: bigintToNumber(trial.organizationId),
    candidateId: bigintToNumber(trial.candidateId),
    candidateName: formatPersonName(
      trial.candidate.firstName,
      trial.candidate.lastName,
    ),
    clientId: bigintToNumber(trial.clientId),
    clientName: trial.client.name,
    deploymentId: trial.deploymentId ? bigintToNumber(trial.deploymentId) : null,
    requestedById: bigintToNumber(trial.requestedById),
    requestedByName: formatPersonName(
      trial.requestedBy.firstName,
      trial.requestedBy.lastName,
    ),
    assignedRecruiterId: trial.assignedRecruiterId
      ? bigintToNumber(trial.assignedRecruiterId)
      : null,
    assignedRecruiterName: trial.assignedRecruiter
      ? formatPersonName(
          trial.assignedRecruiter.firstName,
          trial.assignedRecruiter.lastName,
        )
      : null,
    status: trial.status,
    roleTitle: trial.roleTitle,
    startDate: trial.startDate?.toISOString().slice(0, 10) ?? null,
    endDate: trial.endDate?.toISOString().slice(0, 10) ?? null,
    durationDays: trial.durationDays,
    trialType: trial.trialType,
    maxTrialHours: trial.maxTrialHours,
    taskDescription: trial.taskDescription,
    successCriteria: trial.successCriteria,
    feedback: trial.feedback,
    clientRating: trial.clientRating,
    convertedToPaid: trial.convertedToPaid,
    outcome: trial.outcome,
    approvedAt: trial.approvedAt?.toISOString() ?? null,
    candidateConfirmedAt: trial.candidateConfirmedAt?.toISOString() ?? null,
    rejectedAt: trial.rejectedAt?.toISOString() ?? null,
    rejectReason: trial.rejectReason,
    createdAt: trial.createdAt.toISOString(),
    updatedAt: trial.updatedAt.toISOString(),
  };
}

export function mapTrialToListItem(trial: TrialRecord): TrialListItemDto {
  return {
    id: bigintToNumber(trial.id),
    candidateId: bigintToNumber(trial.candidateId),
    candidateName: formatPersonName(
      trial.candidate.firstName,
      trial.candidate.lastName,
    ),
    candidateEmail: trial.candidate.email ?? null,
    clientId: bigintToNumber(trial.clientId),
    clientName: trial.client.name,
    clientContactName: trial.client.contactName ?? null,
    clientContactEmail: trial.client.contactEmail ?? null,
    clientContactPhone: trial.client.contactPhone ?? null,
    status: trial.status,
    roleTitle: trial.roleTitle,
    startDate: trial.startDate?.toISOString().slice(0, 10) ?? null,
    endDate: trial.endDate?.toISOString().slice(0, 10) ?? null,
    assignedRecruiterId: trial.assignedRecruiterId
      ? bigintToNumber(trial.assignedRecruiterId)
      : null,
    assignedRecruiterName: trial.assignedRecruiter
      ? formatPersonName(
          trial.assignedRecruiter.firstName,
          trial.assignedRecruiter.lastName,
        )
      : null,
    candidateConfirmedAt: trial.candidateConfirmedAt?.toISOString() ?? null,
    feedback: trial.feedback,
    clientRating: trial.clientRating,
    outcome: trial.outcome,
    createdAt: trial.createdAt.toISOString(),
    updatedAt: trial.updatedAt.toISOString(),
  };
}

export function parseSortParam(
  sort: string | undefined,
): Prisma.TrialRequestOrderByWithRelationInput[] {
  if (!sort) {
    return [{ updatedAt: 'desc' }];
  }

  return sort.split(',').map((field) => {
    const desc = field.startsWith('-');
    const key = desc ? field.slice(1) : field;
    const direction = desc ? 'desc' : 'asc';

    switch (key) {
      case 'status':
      case 'startDate':
      case 'endDate':
      case 'createdAt':
      case 'updatedAt':
        return { [key]: direction };
      default:
        return { updatedAt: 'desc' as const };
    }
  });
}

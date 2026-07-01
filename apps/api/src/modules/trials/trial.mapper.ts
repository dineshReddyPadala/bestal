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
    status: trial.status,
    roleTitle: trial.roleTitle,
    startDate: trial.startDate?.toISOString().slice(0, 10) ?? null,
    endDate: trial.endDate?.toISOString().slice(0, 10) ?? null,
    durationDays: trial.durationDays,
    feedback: trial.feedback,
    outcome: trial.outcome,
    approvedAt: trial.approvedAt?.toISOString() ?? null,
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
    clientId: bigintToNumber(trial.clientId),
    clientName: trial.client.name,
    status: trial.status,
    roleTitle: trial.roleTitle,
    startDate: trial.startDate?.toISOString().slice(0, 10) ?? null,
    endDate: trial.endDate?.toISOString().slice(0, 10) ?? null,
    createdAt: trial.createdAt.toISOString(),
    updatedAt: trial.updatedAt.toISOString(),
  };
}

export function parseSortParam(
  sort: string | undefined,
): Prisma.TrialRequestOrderByWithRelationInput[] {
  if (!sort) {
    return [{ createdAt: 'desc' }];
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
        return { createdAt: 'desc' as const };
    }
  });
}

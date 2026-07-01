import type { Prisma } from '@prisma/client';
import { bigintToNumber } from '../../utils/index.js';
import type {
  BackgroundCheckDto,
  BackgroundCheckListItemDto,
} from './background-check.types.js';
import type { BackgroundCheckRecord } from './background-check.repository.js';

function formatPersonName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`;
}

export function mapBackgroundCheckToDto(
  record: BackgroundCheckRecord,
): BackgroundCheckDto {
  return {
    id: bigintToNumber(record.id),
    organizationId: bigintToNumber(record.organizationId),
    candidateId: bigintToNumber(record.candidateId),
    candidateName: formatPersonName(
      record.candidate.firstName,
      record.candidate.lastName,
    ),
    requestedById: bigintToNumber(record.requestedById),
    requestedByName: formatPersonName(
      record.requestedBy.firstName,
      record.requestedBy.lastName,
    ),
    type: record.type,
    status: record.status,
    provider: record.provider,
    externalReferenceId: record.externalReferenceId,
    resultSummary: record.resultSummary,
    initiatedAt: record.initiatedAt?.toISOString() ?? null,
    completedAt: record.completedAt?.toISOString() ?? null,
    expiresAt: record.expiresAt?.toISOString() ?? null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export function mapBackgroundCheckToListItem(
  record: BackgroundCheckRecord,
): BackgroundCheckListItemDto {
  return {
    id: bigintToNumber(record.id),
    candidateId: bigintToNumber(record.candidateId),
    candidateName: formatPersonName(
      record.candidate.firstName,
      record.candidate.lastName,
    ),
    type: record.type,
    status: record.status,
    provider: record.provider,
    initiatedAt: record.initiatedAt?.toISOString() ?? null,
    completedAt: record.completedAt?.toISOString() ?? null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export function parseSortParam(
  sort: string | undefined,
): Prisma.BackgroundCheckOrderByWithRelationInput[] {
  if (!sort) {
    return [{ createdAt: 'desc' }];
  }

  return sort.split(',').map((field) => {
    const desc = field.startsWith('-');
    const key = desc ? field.slice(1) : field;
    const direction = desc ? 'desc' : 'asc';

    switch (key) {
      case 'status':
      case 'type':
      case 'initiatedAt':
      case 'completedAt':
      case 'createdAt':
      case 'updatedAt':
        return { [key]: direction };
      default:
        return { createdAt: 'desc' as const };
    }
  });
}

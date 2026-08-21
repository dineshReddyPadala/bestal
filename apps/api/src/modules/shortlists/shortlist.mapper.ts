import type { Prisma } from '@prisma/client';
import { bigintToNumber } from '../../utils/index.js';
import type {
  ShortlistCandidateDto,
  ShortlistDto,
  ShortlistListItemDto,
  ShortlistWithCandidatesDto,
} from './shortlist.types.js';
import type {
  ShortlistCandidateRecord,
  ShortlistRecord,
  ShortlistWithCandidatesRecord,
} from './shortlist.repository.js';

function formatPersonName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`;
}

export function mapShortlistCandidateToDto(
  entry: ShortlistCandidateRecord,
): ShortlistCandidateDto {
  return {
    id: bigintToNumber(entry.id),
    shortlistId: bigintToNumber(entry.shortlistId),
    candidateId: bigintToNumber(entry.candidateId),
    candidateName: formatPersonName(
      entry.candidate.firstName,
      entry.candidate.lastName,
    ),
    addedById: bigintToNumber(entry.addedById),
    addedByName: formatPersonName(
      entry.addedBy.firstName,
      entry.addedBy.lastName,
    ),
    rank: entry.rank,
    status: entry.status,
    notes: entry.notes,
    clientNotes: entry.clientNotes,
    isApproved: entry.isApproved,
    approvedAt: entry.approvedAt?.toISOString() ?? null,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
  };
}

export function mapShortlistToDto(shortlist: ShortlistRecord): ShortlistDto {
  return {
    id: bigintToNumber(shortlist.id),
    organizationId: bigintToNumber(shortlist.organizationId),
    clientId: bigintToNumber(shortlist.clientId),
    clientName: shortlist.client.name,
    createdById: bigintToNumber(shortlist.createdById),
    createdByName: formatPersonName(
      shortlist.createdBy.firstName,
      shortlist.createdBy.lastName,
    ),
    title: shortlist.title,
    description: shortlist.description,
    status: shortlist.status,
    roleTitle: shortlist.roleTitle,
    dueDate: shortlist.dueDate?.toISOString().slice(0, 10) ?? null,
    closedAt: shortlist.closedAt?.toISOString() ?? null,
    createdAt: shortlist.createdAt.toISOString(),
    updatedAt: shortlist.updatedAt.toISOString(),
  };
}

export function mapShortlistWithCandidatesToDto(
  shortlist: ShortlistWithCandidatesRecord,
): ShortlistWithCandidatesDto {
  return {
    ...mapShortlistToDto(shortlist),
    candidates: shortlist.candidates.map(mapShortlistCandidateToDto),
  };
}

export function mapShortlistToListItem(
  shortlist: ShortlistRecord & { _count: { candidates: number } },
): ShortlistListItemDto {
  return {
    id: bigintToNumber(shortlist.id),
    clientId: bigintToNumber(shortlist.clientId),
    clientName: shortlist.client.name,
    title: shortlist.title,
    status: shortlist.status,
    roleTitle: shortlist.roleTitle,
    dueDate: shortlist.dueDate?.toISOString().slice(0, 10) ?? null,
    candidateCount: shortlist._count.candidates,
    createdAt: shortlist.createdAt.toISOString(),
    updatedAt: shortlist.updatedAt.toISOString(),
  };
}

export function parseSortParam(
  sort: string | undefined,
): Prisma.ShortlistOrderByWithRelationInput[] {
  if (!sort) {
    return [{ updatedAt: 'desc' }];
  }

  return sort.split(',').map((field) => {
    const desc = field.startsWith('-');
    const key = desc ? field.slice(1) : field;
    const direction = desc ? 'desc' : 'asc';

    switch (key) {
      case 'status':
      case 'dueDate':
      case 'title':
      case 'createdAt':
      case 'updatedAt':
        return { [key]: direction };
      default:
        return { updatedAt: 'desc' as const };
    }
  });
}

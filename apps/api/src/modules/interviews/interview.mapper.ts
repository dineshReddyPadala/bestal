import type { Prisma } from '@prisma/client';
import { bigintToNumber } from '../../utils/index.js';
import type { InterviewDto, InterviewListItemDto } from './interview.types.js';
import type { InterviewRecord } from './interview.repository.js';

function formatPersonName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`;
}

export function mapInterviewToDto(interview: InterviewRecord): InterviewDto {
  return {
    id: bigintToNumber(interview.id),
    organizationId: bigintToNumber(interview.organizationId),
    candidateId: bigintToNumber(interview.candidateId),
    candidateName: formatPersonName(
      interview.candidate.firstName,
      interview.candidate.lastName,
    ),
    clientId: bigintToNumber(interview.clientId),
    clientName: interview.client.name,
    shortlistId: interview.shortlistId
      ? bigintToNumber(interview.shortlistId)
      : null,
    requestedById: bigintToNumber(interview.requestedById),
    requestedByName: formatPersonName(
      interview.requestedBy.firstName,
      interview.requestedBy.lastName,
    ),
    assignedToId: interview.assignedToId
      ? bigintToNumber(interview.assignedToId)
      : null,
    assignedToName: interview.assignedTo
      ? formatPersonName(
          interview.assignedTo.firstName,
          interview.assignedTo.lastName,
        )
      : null,
    type: interview.type,
    status: interview.status,
    scheduledAt: interview.scheduledAt?.toISOString() ?? null,
    durationMinutes: interview.durationMinutes,
    timezone: interview.timezone,
    location: interview.location,
    meetingLink: interview.meetingLink,
    notes: interview.notes,
    feedback: interview.feedback,
    completedAt: interview.completedAt?.toISOString() ?? null,
    cancelledAt: interview.cancelledAt?.toISOString() ?? null,
    cancelReason: interview.cancelReason,
    createdAt: interview.createdAt.toISOString(),
    updatedAt: interview.updatedAt.toISOString(),
  };
}

export function mapInterviewToListItem(
  interview: InterviewRecord,
): InterviewListItemDto {
  return {
    id: bigintToNumber(interview.id),
    candidateId: bigintToNumber(interview.candidateId),
    candidateName: formatPersonName(
      interview.candidate.firstName,
      interview.candidate.lastName,
    ),
    clientId: bigintToNumber(interview.clientId),
    clientName: interview.client.name,
    type: interview.type,
    status: interview.status,
    scheduledAt: interview.scheduledAt?.toISOString() ?? null,
    durationMinutes: interview.durationMinutes,
    createdAt: interview.createdAt.toISOString(),
    updatedAt: interview.updatedAt.toISOString(),
  };
}

export function parseSortParam(
  sort: string | undefined,
): Prisma.InterviewRequestOrderByWithRelationInput[] {
  if (!sort) {
    return [{ createdAt: 'desc' }];
  }

  return sort.split(',').map((field) => {
    const desc = field.startsWith('-');
    const key = desc ? field.slice(1) : field;
    const direction = desc ? 'desc' : 'asc';

    switch (key) {
      case 'status':
      case 'scheduledAt':
      case 'type':
      case 'createdAt':
      case 'updatedAt':
        return { [key]: direction };
      default:
        return { createdAt: 'desc' as const };
    }
  });
}

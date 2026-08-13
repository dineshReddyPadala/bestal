import type { Prisma } from '@prisma/client';
import { bigintToNumber } from '../../utils/index.js';
import type { JobRequestDto, JobRequestListItemDto } from './job-request.types.js';
import type { JobRequestRecord } from './job-request.repository.js';

function formatPersonName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

function parseRequiredSkills(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

export function mapJobRequestToDto(record: JobRequestRecord): JobRequestDto {
  return {
    id: bigintToNumber(record.id),
    organizationId: bigintToNumber(record.organizationId),
    jobTitle: record.jobTitle,
    jobDescription: record.jobDescription,
    requiredSkills: parseRequiredSkills(record.requiredSkills),
    experienceRequired: record.experienceRequired,
    numberOfResources: record.numberOfResources,
    companyName: record.companyName,
    website: record.website,
    contactName: record.contactName,
    contactEmail: record.contactEmail,
    contactPhone: record.contactPhone,
    status: record.status,
    source: record.source,
    assignedToId: record.assignedToId ? bigintToNumber(record.assignedToId) : null,
    assignedToName: record.assignedTo
      ? formatPersonName(record.assignedTo.firstName, record.assignedTo.lastName)
      : null,
    internalNotes: record.internalNotes,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export function mapJobRequestToListItem(record: JobRequestRecord): JobRequestListItemDto {
  return {
    id: bigintToNumber(record.id),
    jobTitle: record.jobTitle,
    companyName: record.companyName,
    contactName: record.contactName,
    contactEmail: record.contactEmail,
    contactPhone: record.contactPhone,
    experienceRequired: record.experienceRequired,
    numberOfResources: record.numberOfResources,
    status: record.status,
    assignedToId: record.assignedToId ? bigintToNumber(record.assignedToId) : null,
    assignedToName: record.assignedTo
      ? formatPersonName(record.assignedTo.firstName, record.assignedTo.lastName)
      : null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export function parseSortParam(
  sort: string | undefined,
): Prisma.JobRequestOrderByWithRelationInput[] {
  if (!sort) {
    return [{ createdAt: 'desc' }];
  }

  return sort.split(',').map((field) => {
    const desc = field.startsWith('-');
    const key = desc ? field.slice(1) : field;
    const direction = desc ? 'desc' : 'asc';

    switch (key) {
      case 'status':
      case 'companyName':
      case 'jobTitle':
      case 'createdAt':
      case 'updatedAt':
        return { [key]: direction };
      default:
        return { createdAt: 'desc' as const };
    }
  });
}

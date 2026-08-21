import type { Prisma } from '@prisma/client';
import { bigintToNumber } from '../../utils/index.js';
import type {
  ClientEnquiryAttachment,
  ClientEnquiryJobEntry,
  JobRequestDto,
  JobRequestListItemDto,
} from './job-request.types.js';
import type { JobRequestRecord } from './job-request.repository.js';

function formatPersonName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

function parseRequiredSkills(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

function parseJobs(value: unknown): ClientEnquiryJobEntry[] | null {
  if (!Array.isArray(value)) return null;
  const jobs = value
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
    .map((item) => ({
      jobTitle: String(item.jobTitle ?? ''),
      jobDescription: String(item.jobDescription ?? ''),
      requiredSkills: parseRequiredSkills(item.requiredSkills),
      experienceRequired: String(item.experienceRequired ?? ''),
      numberOfResources: String(item.numberOfResources ?? ''),
    }))
    .filter((job) => job.jobTitle.length > 0);
  return jobs.length > 0 ? jobs : null;
}

function parseAttachments(value: unknown): ClientEnquiryAttachment[] | null {
  if (!Array.isArray(value)) return null;
  const attachments = value
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
    .map((item) => ({
      fileName: String(item.fileName ?? ''),
      fileSize: Number(item.fileSize ?? 0),
      mimeType: String(item.mimeType ?? ''),
      storageKey: String(item.storageKey ?? ''),
      bucket: String(item.bucket ?? ''),
      ...(item.downloadUrl != null ? { downloadUrl: String(item.downloadUrl) } : {}),
    }))
    .filter((attachment) => attachment.fileName.length > 0 && attachment.storageKey.length > 0);
  return attachments.length > 0 ? attachments : null;
}

function countRoles(record: JobRequestRecord): number {
  const jobs = parseJobs(record.jobs);
  return jobs?.length ?? 1;
}

export function mapJobRequestToDto(record: JobRequestRecord): JobRequestDto {
  return {
    id: bigintToNumber(record.id),
    organizationId: bigintToNumber(record.organizationId),
    referenceCode: record.referenceCode,
    jobTitle: record.jobTitle,
    jobDescription: record.jobDescription,
    requiredSkills: parseRequiredSkills(record.requiredSkills),
    experienceRequired: record.experienceRequired,
    numberOfResources: record.numberOfResources,
    companyName: record.companyName,
    companyDomain: record.companyDomain,
    location: record.location,
    timezone: record.timezone,
    website: record.website,
    contactName: record.contactName,
    contactEmail: record.contactEmail,
    contactPhone: record.contactPhone,
    additionalRequirements: record.additionalRequirements,
    jobs: parseJobs(record.jobs),
    attachments: parseAttachments(record.attachments),
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
    referenceCode: record.referenceCode,
    jobTitle: record.jobTitle,
    companyName: record.companyName,
    contactName: record.contactName,
    contactEmail: record.contactEmail,
    contactPhone: record.contactPhone,
    experienceRequired: record.experienceRequired,
    numberOfResources: record.numberOfResources,
    rolesCount: countRoles(record),
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
      case 'referenceCode':
      case 'createdAt':
      case 'updatedAt':
        return { [key]: direction };
      default:
        return { createdAt: 'desc' as const };
    }
  });
}

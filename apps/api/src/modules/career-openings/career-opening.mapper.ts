import type { Prisma } from '@prisma/client';
import { bigintToNumber } from '../../utils/index.js';
import type {
  CareerOpeningDto,
  CareerOpeningListItemDto,
  CareerOpeningPublicDto,
} from './career-opening.types.js';

export type CareerOpeningRecord = {
  id: bigint;
  organizationId: bigint;
  title: string;
  slug: string;
  skillCommunity: string;
  location: string;
  remote: boolean;
  jobLevel: string;
  experience: string;
  aboutRole: string;
  responsibilities: Prisma.JsonValue;
  requirements: Prisma.JsonValue;
  status: CareerOpeningDto['status'];
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export function parseSortParam(sort?: string): Array<{ field: string; direction: 'asc' | 'desc' }> {
  if (!sort?.trim()) return [{ field: 'updatedAt', direction: 'desc' }];
  return sort.split(',').map((part) => {
    const direction = part.startsWith('-') ? 'desc' : 'asc';
    const field = part.replace(/^-/, '');
    return { field, direction };
  });
}

export function asStringArray(value: Prisma.JsonValue): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
}

export function mapCareerOpeningToDto(record: CareerOpeningRecord): CareerOpeningDto {
  return {
    id: bigintToNumber(record.id),
    organizationId: bigintToNumber(record.organizationId),
    title: record.title,
    slug: record.slug,
    skillCommunity: record.skillCommunity,
    location: record.location,
    remote: record.remote,
    jobLevel: record.jobLevel,
    experience: record.experience,
    aboutRole: record.aboutRole,
    responsibilities: asStringArray(record.responsibilities),
    requirements: asStringArray(record.requirements),
    status: record.status,
    publishedAt: record.publishedAt?.toISOString() ?? null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export function mapCareerOpeningToListItem(record: CareerOpeningRecord): CareerOpeningListItemDto {
  return {
    id: bigintToNumber(record.id),
    title: record.title,
    slug: record.slug,
    skillCommunity: record.skillCommunity,
    location: record.location,
    remote: record.remote,
    jobLevel: record.jobLevel,
    status: record.status,
    publishedAt: record.publishedAt?.toISOString() ?? null,
    updatedAt: record.updatedAt.toISOString(),
  };
}

export function mapCareerOpeningToPublicDto(record: CareerOpeningRecord): CareerOpeningPublicDto {
  return {
    id: bigintToNumber(record.id),
    title: record.title,
    slug: record.slug,
    skillCommunity: record.skillCommunity,
    location: record.location,
    remote: record.remote,
    jobLevel: record.jobLevel,
    experience: record.experience,
    aboutRole: record.aboutRole,
    responsibilities: asStringArray(record.responsibilities),
    requirements: asStringArray(record.requirements),
    publishedAt: record.publishedAt?.toISOString() ?? null,
  };
}

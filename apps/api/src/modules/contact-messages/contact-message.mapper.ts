import type { ContactMessage } from '@prisma/client';
import { bigintToNumber } from '../../utils/index.js';
import type { ContactMessageDto, ContactMessageListItemDto } from './contact-message.types.js';

export function parseSortParam(sort?: string): Array<{ field: string; direction: 'asc' | 'desc' }> {
  if (!sort?.trim()) return [{ field: 'createdAt', direction: 'desc' }];
  return sort.split(',').map((part) => {
    const direction = part.startsWith('-') ? 'desc' : 'asc';
    const field = part.replace(/^-/, '');
    return { field, direction };
  });
}

export function mapContactMessageToDto(record: ContactMessage): ContactMessageDto {
  return {
    id: bigintToNumber(record.id),
    organizationId: bigintToNumber(record.organizationId),
    referenceCode: record.referenceCode,
    fullName: record.fullName,
    email: record.email,
    topic: record.topic,
    message: record.message,
    status: record.status,
    internalNotes: record.internalNotes,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export function mapContactMessageToListItem(record: ContactMessage): ContactMessageListItemDto {
  return {
    id: bigintToNumber(record.id),
    referenceCode: record.referenceCode,
    fullName: record.fullName,
    email: record.email,
    topic: record.topic,
    status: record.status,
    createdAt: record.createdAt.toISOString(),
  };
}

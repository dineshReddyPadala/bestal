import type { Prisma } from '@prisma/client';
import { bigintToNumber } from '../../utils/index.js';
import type { ClientDto, ClientListItemDto } from './client.types.js';
import type { ClientRecord } from './client.repository.js';

export function mapClientToDto(client: ClientRecord): ClientDto {
  const accountManager = client.accountManager;

  return {
    id: bigintToNumber(client.id),
    organizationId: bigintToNumber(client.organizationId),
    accountManagerId: client.accountManagerId
      ? bigintToNumber(client.accountManagerId)
      : null,
    accountManagerName: accountManager
      ? `${accountManager.firstName} ${accountManager.lastName}`
      : null,
    name: client.name,
    slug: client.slug,
    status: client.status,
    industry: client.industry,
    website: client.website,
    contactEmail: client.contactEmail,
    contactPhone: client.contactPhone,
    addressLine1: client.addressLine1,
    addressLine2: client.addressLine2,
    city: client.city,
    state: client.state,
    postalCode: client.postalCode,
    country: client.country,
    notes: client.notes,
    createdAt: client.createdAt.toISOString(),
    updatedAt: client.updatedAt.toISOString(),
  };
}

export function mapClientToListItem(client: ClientRecord): ClientListItemDto {
  const accountManager = client.accountManager;

  return {
    id: bigintToNumber(client.id),
    name: client.name,
    slug: client.slug,
    status: client.status,
    industry: client.industry,
    contactEmail: client.contactEmail,
    accountManagerId: client.accountManagerId
      ? bigintToNumber(client.accountManagerId)
      : null,
    accountManagerName: accountManager
      ? `${accountManager.firstName} ${accountManager.lastName}`
      : null,
    createdAt: client.createdAt.toISOString(),
    updatedAt: client.updatedAt.toISOString(),
  };
}

export function parseSortParam(
  sort: string | undefined,
): Prisma.ClientOrderByWithRelationInput[] {
  if (!sort) {
    return [{ createdAt: 'desc' }];
  }

  return sort.split(',').map((field) => {
    const desc = field.startsWith('-');
    const key = desc ? field.slice(1) : field;
    const direction = desc ? 'desc' : 'asc';

    switch (key) {
      case 'name':
      case 'status':
      case 'industry':
      case 'createdAt':
      case 'updatedAt':
        return { [key]: direction };
      default:
        return { createdAt: 'desc' as const };
    }
  });
}

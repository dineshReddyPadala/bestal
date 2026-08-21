import type { Prisma, Role } from '@prisma/client';
import { bigintToNumber } from '../../utils/index.js';
import type { UserDto, UserListItemDto } from './user.types.js';

type UserWithMembership = {
  id: bigint;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  memberships: Array<{
    role: Role;
    organizationId: bigint;
    isActive: boolean;
    clientId?: bigint | null;
    organization: { id: bigint; name: string };
    client?: { id: bigint; name: string } | null;
  }>;
};

export function findOrgMembership(
  memberships: UserWithMembership['memberships'],
  organizationId: number,
) {
  const orgMemberships = memberships.filter(
    (membership) => bigintToNumber(membership.organizationId) === organizationId,
  );
  return orgMemberships.find((membership) => membership.isActive) ?? orgMemberships[0];
}

export function mapUserToListItem(
  user: UserWithMembership,
  organizationId: number,
): UserListItemDto {
  const membership = findOrgMembership(user.memberships, organizationId);

  return {
    id: bigintToNumber(user.id),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    role: membership?.role ?? null,
    clientId: membership?.clientId != null ? bigintToNumber(membership.clientId) : null,
    clientName: membership?.client?.name ?? null,
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export function mapUserToDto(
  user: UserWithMembership,
  organizationId: number,
  organizationName: string,
  emailSent: boolean,
): UserDto {
  return {
    ...mapUserToListItem(user, organizationId),
    organizationId,
    organizationName,
    emailSent,
  };
}

export function parseSortParam(
  sort: string | undefined,
): Prisma.UserOrderByWithRelationInput[] {
  if (!sort) {
    return [{ updatedAt: 'desc' }];
  }

  return sort.split(',').map((field) => {
    const desc = field.startsWith('-');
    const key = desc ? field.slice(1) : field;
    const direction = desc ? 'desc' : 'asc';

    switch (key) {
      case 'email':
      case 'firstName':
      case 'lastName':
      case 'createdAt':
      case 'updatedAt':
        return { [key]: direction };
      default:
        return { updatedAt: 'desc' as const };
    }
  });
}

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
    organization: { id: bigint; name: string };
  }>;
};

export function mapUserToListItem(
  user: UserWithMembership,
  organizationId: number,
): UserListItemDto {
  const membership = user.memberships.find(
    (m) => bigintToNumber(m.organizationId) === organizationId,
  );

  return {
    id: bigintToNumber(user.id),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    role: membership?.role ?? null,
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
    return [{ createdAt: 'desc' }];
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
        return { createdAt: 'desc' as const };
    }
  });
}

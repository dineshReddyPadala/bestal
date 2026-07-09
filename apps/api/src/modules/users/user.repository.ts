import type { Prisma, PrismaClient, Role } from '@prisma/client';
import { BaseRepository } from '../../repositories/base.repository.js';
import { parseSortParam } from './user.mapper.js';
import type { CreateUserInput, UserListFilters } from './user.types.js';

const userInclude = {
  memberships: {
    where: { isActive: true },
    include: {
      organization: { select: { id: true, name: true } },
    },
  },
} satisfies Prisma.UserInclude;

export type UserRecord = Prisma.UserGetPayload<{ include: typeof userInclude }>;

export class UserRepository extends BaseRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  findOrganizationById(id: number): Promise<{ id: bigint; name: string; slug: string } | null> {
    return this.prisma.organization.findFirst({
      where: { id: BigInt(id), deletedAt: null },
      select: { id: true, name: true, slug: true },
    });
  }

  findByEmail(email: string): Promise<UserRecord | null> {
    return this.prisma.user.findFirst({
      where: { email: email.toLowerCase(), deletedAt: null },
      include: userInclude,
    });
  }

  async createWithMembership(
    organizationId: number,
    passwordHash: string,
    input: CreateUserInput,
  ): Promise<UserRecord> {
    const user = await this.prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        passwordHash,
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        phone: input.phone?.trim() || null,
        isActive: true,
        memberships: {
          create: {
            organizationId: BigInt(organizationId),
            role: input.role as Role,
            isActive: true,
          },
        },
      },
      include: userInclude,
    });

    return user;
  }

  async findMany(filters: UserListFilters): Promise<{ items: UserRecord[]; total: number }> {
    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      memberships: {
        some: {
          organizationId: BigInt(filters.organizationId),
          isActive: true,
          ...(filters.role ? { role: filters.role } : {}),
        },
      },
      ...(filters.isActive !== undefined ? { isActive: filters.isActive } : {}),
      ...(filters.search
        ? {
            OR: [
              { email: { contains: filters.search, mode: 'insensitive' } },
              { firstName: { contains: filters.search, mode: 'insensitive' } },
              { lastName: { contains: filters.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: userInclude,
        orderBy: parseSortParam(filters.sort),
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { items, total };
  }
}

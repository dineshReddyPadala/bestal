import type { PrismaClient } from '@prisma/client';
import { BaseRepository } from '../../repositories/base.repository.js';

export class SkillCommunityRepository extends BaseRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  listActive(organizationId: number) {
    return this.prisma.skillCommunity.findMany({
      where: {
        organizationId: BigInt(organizationId),
        isActive: true,
        deletedAt: null,
      },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
      },
    });
  }
}

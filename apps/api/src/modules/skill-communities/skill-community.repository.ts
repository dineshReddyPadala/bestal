import type { PrismaClient } from '@prisma/client';
import { BaseRepository } from '../../repositories/base.repository.js';

export class SkillCommunityRepository extends BaseRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  listActive() {
    return (this.prisma.skillCommunity as any).findMany({
      where: {
        isActive: true,
        deletedAt: null,
      },
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        iconUrl: true,
        displayOrder: true,
        icon: { select: { url: true, deletedAt: true } },
      },
    }) as Promise<
      Array<{
        id: bigint;
        name: string;
        slug: string;
        description: string | null;
        iconUrl: string | null;
        displayOrder: number;
        icon: { url: string; deletedAt: Date | null } | null;
      }>
    >;
  }
}

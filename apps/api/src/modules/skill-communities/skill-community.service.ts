import type { FastifyInstance } from 'fastify';
import { SkillCommunityRepository } from './skill-community.repository.js';
import type { SkillCommunityListItemDto } from './skill-community.types.js';

function resolveCommunityIconUrl(row: {
  iconUrl: string | null;
  icon: { url: string; deletedAt: Date | null } | null;
}): string | null {
  if (row.icon && !row.icon.deletedAt && row.icon.url && row.icon.url !== 'pending') {
    return row.icon.url;
  }
  if (row.iconUrl && row.iconUrl !== 'pending') {
    return row.iconUrl;
  }
  return null;
}

export class SkillCommunityService {
  private readonly repository: SkillCommunityRepository;

  constructor(fastify: FastifyInstance, repository?: SkillCommunityRepository) {
    this.repository = repository ?? new SkillCommunityRepository(fastify.prisma);
  }

  async list(): Promise<SkillCommunityListItemDto[]> {
    const rows = await this.repository.listActive();
    return rows.map((row) => ({
      id: Number(row.id),
      name: row.name,
      slug: row.slug,
      description: row.description,
      iconUrl: resolveCommunityIconUrl(row),
      displayOrder: row.displayOrder,
    }));
  }
}

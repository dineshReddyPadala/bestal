import type { FastifyInstance } from 'fastify';
import { SkillCommunityRepository } from './skill-community.repository.js';
import type { SkillCommunityListItemDto } from './skill-community.types.js';

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
    }));
  }
}

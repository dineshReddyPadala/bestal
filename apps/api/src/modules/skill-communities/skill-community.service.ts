import type { FastifyInstance } from 'fastify';
import type { AuthenticatedUser } from '../../types/index.js';
import { requireOrganization } from '../../utils/index.js';
import { SkillCommunityRepository } from './skill-community.repository.js';
import type { SkillCommunityListItemDto } from './skill-community.types.js';

export class SkillCommunityService {
  private readonly repository: SkillCommunityRepository;

  constructor(fastify: FastifyInstance, repository?: SkillCommunityRepository) {
    this.repository = repository ?? new SkillCommunityRepository(fastify.prisma);
  }

  async list(authUser: AuthenticatedUser): Promise<SkillCommunityListItemDto[]> {
    const organizationId = requireOrganization(authUser);
    const rows = await this.repository.listActive(organizationId);
    return rows.map((row) => ({
      id: Number(row.id),
      name: row.name,
      slug: row.slug,
      description: row.description,
    }));
  }
}

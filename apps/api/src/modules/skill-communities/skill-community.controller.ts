import type { FastifyReply, FastifyRequest } from 'fastify';
import { SkillCommunityService } from './skill-community.service.js';

export class SkillCommunityController {
  constructor(private readonly skillCommunityService: SkillCommunityService) {}

  list = async (_request: FastifyRequest, reply: FastifyReply) => {
    const data = await this.skillCommunityService.list();
    return reply.status(200).send({ data });
  };
}

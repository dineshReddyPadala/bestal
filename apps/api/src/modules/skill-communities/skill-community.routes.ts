import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { authenticate } from '../../middleware/authenticate.middleware.js';
import { requirePermission } from '../../middleware/permission.middleware.js';
import { errorResponses } from '../../validators/api-responses.validator.js';
import { PERMISSIONS } from '../auth/auth.permissions.js';
import { SkillCommunityController } from './skill-community.controller.js';
import { SkillCommunityService } from './skill-community.service.js';
import { skillCommunityListResponseSchema } from './skill-community.validator.js';

export async function skillCommunityRoutes(fastify: FastifyInstance): Promise<void> {
  const service = new SkillCommunityService(fastify);
  const controller = new SkillCommunityController(service);
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.get(
    '/',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.SKILLS_READ)],
      schema: {
        tags: ['Skill Communities'],
        summary: 'List active skill communities for the organization',
        security: [{ bearerAuth: [] }],
        response: {
          200: skillCommunityListResponseSchema,
          401: errorResponses[401],
        },
      },
    },
    controller.list,
  );
}

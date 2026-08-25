import type { FastifyInstance } from 'fastify';
import { authenticate } from '../../middleware/index.js';
import {
  readOrgDisplaySettings,
  readTrialsSettings,
} from '../../services/system-settings.reader.js';

async function sendTrialPolicy(fastify: FastifyInstance, reply: { send: (payload: unknown) => unknown }) {
  const data = await readTrialsSettings(fastify.prisma);
  return reply.send({ data: { freeTrialHours: data.freeTrialHours } });
}

/** Public marketing + unauthenticated clients — trial hours only (non-sensitive). */
export async function settingsPublicRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get(
    '/trial-policy',
    {
      schema: {
        tags: ['Settings'],
        summary: 'Public trial policy (free trial hours from platform settings)',
      },
    },
    async (_request, reply) => sendTrialPolicy(fastify, reply),
  );
}

export async function settingsRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get(
    '/trial-policy',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Settings'],
        summary: 'Trial policy settings (free trial hours)',
        security: [{ bearerAuth: [] }],
      },
    },
    async (_request, reply) => sendTrialPolicy(fastify, reply),
  );

  fastify.get(
    '/org-display',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Settings'],
        summary: 'Organization display settings (currency, date format)',
        security: [{ bearerAuth: [] }],
      },
    },
    async (_request, reply) => {
      const data = await readOrgDisplaySettings(fastify.prisma);
      return reply.send({ data });
    },
  );
}

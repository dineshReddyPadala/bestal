import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { HealthController } from '../controllers/health.controller.js';

const healthResponseSchema = z.object({
  data: z.object({
    status: z.enum(['ok', 'degraded', 'error']),
    timestamp: z.string(),
    uptime: z.number(),
    version: z.string(),
    services: z.object({
      database: z.enum(['up', 'down']),
    }),
  }),
});

export async function healthRoutes(fastify: FastifyInstance): Promise<void> {
  const healthController = new HealthController();
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.get(
    '/',
    {
      schema: {
        tags: ['Health'],
        summary: 'Health check endpoint',
        response: {
          200: healthResponseSchema,
          503: healthResponseSchema,
        },
      },
    },
    healthController.check,
  );
}

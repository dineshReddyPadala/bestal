import type { FastifyReply, FastifyRequest } from 'fastify';
import type { HealthCheckResponse } from '../types/index.js';

export class HealthController {
  check = async (request: FastifyRequest, reply: FastifyReply) => {
    let databaseStatus: 'up' | 'down' = 'down';

    try {
      await request.server.prisma.$queryRaw`SELECT 1`;
      databaseStatus = 'up';
    } catch {
      databaseStatus = 'down';
    }

    const status: HealthCheckResponse['status'] =
      databaseStatus === 'up' ? 'ok' : 'degraded';

    const response: { data: HealthCheckResponse } = {
      data: {
        status,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '1.0.0',
        services: {
          database: databaseStatus,
        },
      },
    };

    const statusCode = status === 'ok' ? 200 : 503;
    return reply.status(statusCode).send(response);
  };
}

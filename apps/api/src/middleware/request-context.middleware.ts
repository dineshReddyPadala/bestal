import type { FastifyReply, FastifyRequest } from 'fastify';
import { createRequestId } from '../utils/index.js';

export async function requestContext(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  const requestId =
    (request.headers['x-request-id'] as string | undefined) ?? createRequestId();

  request.id = requestId;
  request.log = request.log.child({ requestId });
}

export async function requestLogger(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const start = Date.now();

  reply.header('X-Request-Id', request.id);

  reply.raw.on('finish', () => {
    request.log.info(
      {
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        responseTime: Date.now() - start,
      },
      'Request completed',
    );
  });
}

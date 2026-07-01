import multipart from '@fastify/multipart';
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

async function multipartPlugin(fastify: FastifyInstance): Promise<void> {
  await fastify.register(multipart, {
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB max (intro video)
      files: 1,
    },
  });
}

export default fp(multipartPlugin, {
  name: 'multipart',
});

import { PrismaClient } from '@prisma/client';
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

async function prismaPlugin(fastify: FastifyInstance): Promise<void> {
  const prismaLog = fastify.log.child({ module: 'prisma' });

  const prisma = new PrismaClient({
    log: [
      { emit: 'event', level: 'warn' },
      { emit: 'event', level: 'error' },
      // Query/info logs disabled — too noisy in dev; enable below if needed for debugging.
      // ...(fastify.config.isDevelopment
      //   ? [
      //       { emit: 'event', level: 'query' },
      //       { emit: 'event', level: 'info' },
      //     ]
      //   : []),
    ],
  });

  // if (fastify.config.isDevelopment) {
  //   prisma.$on('query', (event) => {
  //     prismaLog.debug(
  //       { query: event.query, params: event.params, durationMs: event.duration },
  //       'prisma query',
  //     );
  //   });
  //   prisma.$on('info', (event) => {
  //     prismaLog.info({ message: event.message }, 'prisma info');
  //   });
  // }

  prisma.$on('warn', (event) => {
    prismaLog.warn({ message: event.message }, 'prisma warn');
  });

  prisma.$on('error', (event) => {
    prismaLog.error({ message: event.message }, 'prisma error');
  });

  await prisma.$connect();

  fastify.decorate('prisma', prisma);

  fastify.addHook('onClose', async (instance) => {
    await instance.prisma.$disconnect();
  });
}

export default fp(prismaPlugin, {
  name: 'prisma',
  dependencies: ['config'],
});

import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import type { AppConfig } from '../config/index.js';

declare module 'fastify' {
  interface FastifyInstance {
    config: AppConfig;
  }
}

async function configPlugin(fastify: FastifyInstance): Promise<void> {
  if (!fastify.config) {
    throw new Error('App config must be attached before registering config plugin');
  }
}

export default fp(configPlugin, {
  name: 'config',
});

export function attachConfig(fastify: FastifyInstance, config: AppConfig): void {
  fastify.decorate('config', config);
}

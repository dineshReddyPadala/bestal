import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { jsonSchemaTransform } from 'fastify-type-provider-zod';
import { API_PREFIX } from '../constants/index.js';

async function swaggerPlugin(fastify: FastifyInstance): Promise<void> {
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'BesTal API',
        description: 'BesTal SaaS Platform REST API',
        version: '1.0.0',
      },
      servers: [
        {
          url: `${fastify.config.appUrl}${API_PREFIX}`,
          description: 'API Server',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      tags: [
        { name: 'Health', description: 'Health check endpoints' },
        { name: 'Auth', description: 'Authentication endpoints' },
        { name: 'Candidates', description: 'Candidate management endpoints' },
        { name: 'Clients', description: 'Client management endpoints' },
        { name: 'Evaluations', description: 'Evaluation management endpoints' },
        { name: 'Background Checks', description: 'Background check endpoints' },
        { name: 'Deployments', description: 'Deployment management endpoints' },
        { name: 'Trials', description: 'Trial request endpoints' },
        { name: 'Search', description: 'Cross-entity search endpoints' },
        { name: 'Notifications', description: 'User notification endpoints' },
      ],
    },
    transform: jsonSchemaTransform,
  });

  await fastify.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
  });
}

export default fp(swaggerPlugin, {
  name: 'swagger',
  dependencies: ['config'],
});

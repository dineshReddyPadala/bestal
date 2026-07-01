import type { FastifyInstance } from 'fastify';
import { API_PREFIX } from '../constants/index.js';
import { authRoutes } from '../modules/auth/auth.routes.js';
import { backgroundCheckRoutes } from '../modules/background-checks/background-check.routes.js';
import { candidateRoutes } from '../modules/candidates/candidate.routes.js';
import { clientRoutes } from '../modules/clients/client.routes.js';
import { deploymentRoutes } from '../modules/deployments/deployment.routes.js';
import { evaluationRoutes } from '../modules/evaluations/evaluation.routes.js';
import { notificationRoutes } from '../modules/notifications/notification.routes.js';
import { searchRoutes } from '../modules/search/search.routes.js';
import { trialRoutes } from '../modules/trials/trial.routes.js';
import { healthRoutes } from './health.routes.js';

export async function registerRoutes(fastify: FastifyInstance): Promise<void> {
  await fastify.register(healthRoutes, { prefix: '/health' });

  await fastify.register(
    async (api) => {
      await api.register(healthRoutes, { prefix: '/health' });
      await api.register(authRoutes, { prefix: '/auth' });
      await api.register(candidateRoutes, { prefix: '/candidates' });
      await api.register(clientRoutes, { prefix: '/clients' });
      await api.register(evaluationRoutes, { prefix: '/evaluations' });
      await api.register(backgroundCheckRoutes, { prefix: '/background-checks' });
      await api.register(deploymentRoutes, { prefix: '/deployments' });
      await api.register(trialRoutes, { prefix: '/trials' });
      await api.register(searchRoutes, { prefix: '/search' });
      await api.register(notificationRoutes, { prefix: '/notifications' });
    },
    { prefix: API_PREFIX },
  );
}

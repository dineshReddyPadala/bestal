import type { FastifyInstance } from 'fastify';
import { API_PREFIX } from '../constants/index.js';
import { adminRoutes } from '../modules/admin/index.js';
import { automationRoutes } from '../modules/automation/index.js';
import { internalAutomationRoutes } from '../modules/automation/internal-automation.routes.js';
import { authRoutes } from '../modules/auth/auth.routes.js';
import { backgroundCheckRoutes } from '../modules/background-checks/background-check.routes.js';
import { candidateRoutes, candidatePublicRoutes } from '../modules/candidates/candidate.routes.js';
import { clientRoutes } from '../modules/clients/client.routes.js';
import { clientRegistrationPublicRoutes } from '../modules/clients/client-registration.routes.js';
import { deploymentRoutes } from '../modules/deployments/deployment.routes.js';
import { evaluationRoutes } from '../modules/evaluations/evaluation.routes.js';
import { notificationRoutes } from '../modules/notifications/notification.routes.js';
import { searchRoutes } from '../modules/search/search.routes.js';
import { shortlistRoutes } from '../modules/shortlists/shortlist.routes.js';
import { trialRoutes } from '../modules/trials/trial.routes.js';
import { jobRequestRoutes, jobRequestPublicRoutes, clientEnquiryPublicRoutes } from '../modules/job-requests/index.js';
import { contactMessageRoutes, contactMessagePublicRoutes } from '../modules/contact-messages/index.js';
import { userRoutes } from '../modules/users/user.routes.js';
import { skillCommunityRoutes, skillCommunityPublicRoutes } from '../modules/skill-communities/skill-community.routes.js';
import { settingsRoutes, settingsPublicRoutes } from '../modules/settings/settings.routes.js';
import { healthRoutes } from './health.routes.js';

export async function registerRoutes(fastify: FastifyInstance): Promise<void> {
  await fastify.register(healthRoutes, { prefix: '/health' });

  // Service-to-service callbacks (n8n). Not part of the user JWT API surface.
  await fastify.register(internalAutomationRoutes, {
    prefix: '/internal/automation',
  });

  await fastify.register(
    async (api) => {
      await api.register(healthRoutes, { prefix: '/health' });
      await api.register(authRoutes, { prefix: '/auth' });
      await api.register(adminRoutes, { prefix: '/admin' });
      await api.register(userRoutes, { prefix: '/users' });
      await api.register(skillCommunityRoutes, { prefix: '/skill-communities' });
      await api.register(skillCommunityPublicRoutes, { prefix: '/public/skill-communities' });
      await api.register(candidateRoutes, { prefix: '/candidates' });
      await api.register(candidatePublicRoutes, { prefix: '/public/candidates' });
      await api.register(clientRoutes, { prefix: '/clients' });
      await api.register(evaluationRoutes, { prefix: '/evaluations' });
      await api.register(backgroundCheckRoutes, { prefix: '/background-checks' });
      await api.register(deploymentRoutes, { prefix: '/deployments' });
      await api.register(trialRoutes, { prefix: '/trials' });
      await api.register(jobRequestRoutes, { prefix: '/job-requests' });
      await api.register(jobRequestPublicRoutes, { prefix: '/public/job-requests' });
      await api.register(clientEnquiryPublicRoutes, { prefix: '/public/client-enquiries' });
      await api.register(contactMessageRoutes, { prefix: '/contact-messages' });
      await api.register(contactMessagePublicRoutes, { prefix: '/public/contact-messages' });
      await api.register(clientRegistrationPublicRoutes, { prefix: '/public/clients' });
      await api.register(shortlistRoutes, { prefix: '/shortlists' });
      await api.register(searchRoutes, { prefix: '/search' });
      await api.register(notificationRoutes, { prefix: '/notifications' });
      await api.register(settingsRoutes, { prefix: '/settings' });
      await api.register(settingsPublicRoutes, { prefix: '/public/settings' });
      await api.register(automationRoutes, { prefix: '/automation' });
    },
    { prefix: API_PREFIX },
  );
}

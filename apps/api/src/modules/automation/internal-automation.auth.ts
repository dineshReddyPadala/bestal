import type { FastifyReply, FastifyRequest } from 'fastify';
import { AuthenticationError } from '../../utils/index.js';
import type { AutomationService } from './automation.service.js';

/**
 * Service-to-service auth for n8n callbacks.
 * Expects: Authorization: Bearer <AUTOMATION_CALLBACK_SECRET>
 * Never logs the secret value.
 */
export function requireAutomationCallbackBearer(automationService: AutomationService) {
  return async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
    if (!automationService.isCallbackSecretConfigured()) {
      request.log.error(
        { path: request.url },
        'AUTOMATION_CALLBACK_SECRET is not configured — rejecting internal callback',
      );
      throw new AuthenticationError('Automation callback authentication is not configured');
    }

    const header = request.headers.authorization;
    if (!header || typeof header !== 'string') {
      throw new AuthenticationError('Missing Authorization header');
    }

    const [scheme, token] = header.split(/\s+/);
    if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) {
      throw new AuthenticationError('Authorization must be Bearer token');
    }

    if (!automationService.verifyCallbackSecret(token)) {
      // Do not include token/secret in logs.
      request.log.warn(
        { path: request.url, remoteAddress: request.ip },
        'Rejected automation callback with invalid Authorization bearer',
      );
      throw new AuthenticationError('Invalid automation callback credentials');
    }
  };
}

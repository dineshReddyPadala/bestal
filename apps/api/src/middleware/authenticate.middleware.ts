import type { FastifyReply, FastifyRequest } from 'fastify';
import { AuthenticationError } from '../utils/index.js';
import type { JwtAccessPayload } from '../interfaces/index.js';
import type { AuthenticatedUser } from '../types/index.js';

function toAuthenticatedUser(payload: JwtAccessPayload): AuthenticatedUser {
  return {
    id: payload.sub,
    email: payload.email,
    organizationId: payload.organizationId,
    role: payload.role,
    portal: payload.portal,
  };
}

export async function authenticate(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  try {
    const payload = await request.jwtVerify<JwtAccessPayload>();
    request.authUser = toAuthenticatedUser(payload);
  } catch {
    throw new AuthenticationError('Invalid or expired access token');
  }
}

export async function optionalAuthenticate(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const authHeader = request.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return;
  }

  await authenticate(request, reply);
}

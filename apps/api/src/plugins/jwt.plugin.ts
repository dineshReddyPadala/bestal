import jwt from '@fastify/jwt';
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import type {
  JwtAccessPayload,
  JwtRefreshPayload,
} from '../interfaces/index.js';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JwtAccessPayload;
    user: JwtAccessPayload;
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    signAccessToken: (payload: JwtAccessPayload) => string;
    signRefreshToken: (payload: JwtRefreshPayload) => string;
    verifyRefreshToken: (token: string) => JwtRefreshPayload;
  }
}

async function jwtPlugin(fastify: FastifyInstance): Promise<void> {
  await fastify.register(jwt, {
    secret: fastify.config.jwt.secret,
    sign: {
      expiresIn: fastify.config.jwt.accessExpiry,
    },
  });

  fastify.decorate('signAccessToken', (payload: JwtAccessPayload) => {
    return fastify.jwt.sign(payload);
  });

  fastify.decorate('signRefreshToken', (payload: JwtRefreshPayload) => {
    return fastify.jwt.sign(
      payload as unknown as JwtAccessPayload,
      { expiresIn: fastify.config.jwt.refreshExpiry },
    );
  });

  fastify.decorate('verifyRefreshToken', (token: string) => {
    const decoded = fastify.jwt.verify<JwtRefreshPayload>(token);

    if (decoded.type !== 'refresh') {
      throw new Error('Invalid refresh token');
    }

    return decoded;
  });
}

export default fp(jwtPlugin, {
  name: 'jwt-auth',
  dependencies: ['config'],
});

export type { JwtAccessPayload, JwtRefreshPayload };

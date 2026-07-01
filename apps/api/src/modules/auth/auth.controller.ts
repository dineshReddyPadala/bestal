import type { FastifyReply, FastifyRequest } from 'fastify';
import { AuthenticationError } from '../../utils/index.js';
import { AuthService } from './auth.service.js';
import type {
  ChangePasswordBody,
  ForgotPasswordBody,
  LoginBody,
  LogoutBody,
  RefreshTokenBody,
  ResetPasswordBody,
} from './auth.validator.js';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  login = async (request: FastifyRequest, reply: FastifyReply) => {
    const tokens = await this.authService.login(request.body as LoginBody);
    return reply.status(200).send({ data: tokens });
  };

  refresh = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as RefreshTokenBody;
    const tokens = await this.authService.refresh(body.refreshToken);
    return reply.status(200).send({ data: tokens });
  };

  logout = async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.authUser) {
      throw new AuthenticationError('User context not found');
    }

    const body = request.body as LogoutBody | undefined;
    await this.authService.logout(request.authUser.id, body?.refreshToken);
    return reply.status(200).send({
      data: { message: 'Logged out successfully' },
    });
  };

  me = async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.authUser) {
      throw new AuthenticationError('User context not found');
    }

    const profile = await this.authService.getProfile(request.authUser);
    return reply.status(200).send({ data: profile });
  };

  permissions = async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.authUser) {
      throw new AuthenticationError('User context not found');
    }

    const permissions = this.authService.getPermissionsForRole(request.authUser.role);
    return reply.status(200).send({
      data: {
        role: request.authUser.role,
        permissions,
      },
    });
  };

  forgotPassword = async (request: FastifyRequest, reply: FastifyReply) => {
    const result = await this.authService.forgotPassword(
      request.body as ForgotPasswordBody,
    );
    return reply.status(200).send({ data: result });
  };

  resetPassword = async (request: FastifyRequest, reply: FastifyReply) => {
    const result = await this.authService.resetPassword(
      request.body as ResetPasswordBody,
    );
    return reply.status(200).send({ data: result });
  };

  changePassword = async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.authUser) {
      throw new AuthenticationError('User context not found');
    }

    const result = await this.authService.changePassword(
      request.authUser.id,
      request.body as ChangePasswordBody,
    );
    return reply.status(200).send({ data: result });
  };
}

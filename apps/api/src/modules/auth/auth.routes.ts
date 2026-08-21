import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { authenticate } from '../../middleware/authenticate.middleware.js';
import { requirePermission } from '../../middleware/permission.middleware.js';
import { PERMISSIONS } from './auth.permissions.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import {
  changePasswordBodySchema,
  clientLoginRequestOtpBodySchema,
  clientLoginRequestOtpResponseSchema,
  clientLoginVerifyOtpBodySchema,
  forgotPasswordBodySchema,
  forgotPasswordResponseSchema,
  loginBodySchema,
  logoutBodySchema,
  meResponseSchema,
  messageResponseSchema,
  permissionsResponseSchema,
  refreshTokenBodySchema,
  resetPasswordBodySchema,
  tokenResponseSchema,
} from './auth.validator.js';

export async function authRoutes(fastify: FastifyInstance): Promise<void> {
  const authService = new AuthService(fastify);
  const authController = new AuthController(authService);

  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.post(
    '/login',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Authenticate user and issue JWT tokens',
        body: loginBodySchema,
        response: { 200: tokenResponseSchema },
      },
    },
    authController.login,
  );

  app.post(
    '/login/client/request-otp',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Send a one-time code for client portal sign-in',
        body: clientLoginRequestOtpBodySchema,
        response: { 200: clientLoginRequestOtpResponseSchema },
      },
    },
    authController.requestClientLoginOtp,
  );

  app.post(
    '/login/client/verify-otp',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Verify client login OTP and issue JWT tokens',
        body: clientLoginVerifyOtpBodySchema,
        response: { 200: tokenResponseSchema },
      },
    },
    authController.verifyClientLoginOtp,
  );

  app.post(
    '/refresh',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Refresh access token using a valid refresh token',
        body: refreshTokenBodySchema,
        response: { 200: tokenResponseSchema },
      },
    },
    authController.refresh,
  );

  app.post(
    '/logout',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Auth'],
        summary: 'Logout and revoke refresh token(s)',
        security: [{ bearerAuth: [] }],
        body: logoutBodySchema,
        response: { 200: messageResponseSchema },
      },
    },
    authController.logout,
  );

  app.get(
    '/me',
    {
      preHandler: [authenticate, requirePermission(PERMISSIONS.AUTH_ME)],
      schema: {
        tags: ['Auth'],
        summary: 'Get current authenticated user profile and permissions',
        security: [{ bearerAuth: [] }],
        response: { 200: meResponseSchema },
      },
    },
    authController.me,
  );

  app.get(
    '/permissions',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Auth'],
        summary: 'Get permissions for the current user role',
        security: [{ bearerAuth: [] }],
        response: { 200: permissionsResponseSchema },
      },
    },
    authController.permissions,
  );

  app.post(
    '/forgot-password',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Request a password reset email',
        body: forgotPasswordBodySchema,
        response: { 200: forgotPasswordResponseSchema },
      },
    },
    authController.forgotPassword,
  );

  app.post(
    '/reset-password',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Reset password using a valid reset token',
        body: resetPasswordBodySchema,
        response: { 200: messageResponseSchema },
      },
    },
    authController.resetPassword,
  );

  app.post(
    '/change-password',
    {
      preHandler: [
        authenticate,
        requirePermission(PERMISSIONS.AUTH_CHANGE_PASSWORD),
      ],
      schema: {
        tags: ['Auth'],
        summary: 'Change password for the authenticated user',
        security: [{ bearerAuth: [] }],
        body: changePasswordBodySchema,
        response: { 200: messageResponseSchema },
      },
    },
    authController.changePassword,
  );
}

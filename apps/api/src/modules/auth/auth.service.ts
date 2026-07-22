import argon2 from 'argon2';
import type { FastifyInstance } from 'fastify';
import {
  PORTAL_ALLOWED_ROLES,
  PORTALS,
  type Portal,
  type Role,
} from '../../constants/index.js';
import {
  AuthenticationError,
  AuthorizationError,
  BadRequestError,
  bigintToNumber,
  hashToken,
  parseDurationToMs,
} from '../../utils/index.js';
import { EmailService } from '../../services/email.service.js';
import {
  getPermissionsForRole as staticPermissionsForRole,
  type Permission,
} from './auth.permissions.js';
import { resolvePermissionsForMembership } from '../admin/admin-roles.service.js';
import type {
  AuthTokenResponse,
  AuthUserProfile,
  ForgotPasswordResult,
  SessionContext,
} from './auth.types.js';
import type {
  ChangePasswordBody,
  ForgotPasswordBody,
  LoginBody,
  ResetPasswordBody,
} from './auth.validator.js';
import { AuthRepository, type UserWithMemberships } from './auth.repository.js';

const FORGOT_PASSWORD_MESSAGE =
  'If an account with that email exists, a password reset link has been sent.';

const PORTAL_RESET_PATH: Record<
  typeof PORTALS.RECRUITER | typeof PORTALS.SALES | typeof PORTALS.CLIENT,
  string
> = {
  [PORTALS.RECRUITER]: '/recruiter/reset-password',
  [PORTALS.SALES]: '/sales/reset-password',
  [PORTALS.CLIENT]: '/client/reset-password',
};

const PORTAL_LABEL: Record<
  typeof PORTALS.RECRUITER | typeof PORTALS.SALES | typeof PORTALS.CLIENT,
  string
> = {
  [PORTALS.RECRUITER]: 'Recruiter Portal',
  [PORTALS.SALES]: 'Sales Portal',
  [PORTALS.CLIENT]: 'Client Portal',
};

export class AuthService {
  private readonly authRepository: AuthRepository;
  private readonly emailService: EmailService;

  constructor(
    private readonly fastify: FastifyInstance,
    authRepository?: AuthRepository,
    emailService?: EmailService,
  ) {
    this.authRepository =
      authRepository ?? new AuthRepository(fastify.prisma);
    this.emailService = emailService ?? new EmailService(fastify.config);
  }

  async login(input: LoginBody): Promise<AuthTokenResponse> {
    const user = await this.authRepository.findUserByEmail(input.email);

    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    const isValidPassword = await argon2.verify(user.passwordHash, input.password);

    if (!isValidPassword) {
      throw new AuthenticationError('Invalid email or password');
    }

    const session = this.resolveSession(user, input.portal, input.organizationId);

    await this.authRepository.updateLastLogin(session.id);

    return this.issueTokenPair(session);
  }

  async refresh(refreshToken: string): Promise<AuthTokenResponse> {
    let payload;

    try {
      payload = this.fastify.verifyRefreshToken(refreshToken);
    } catch {
      throw new AuthenticationError('Invalid or expired refresh token');
    }

    const tokenHash = await hashToken(refreshToken);
    const storedToken = await this.authRepository.findRefreshTokenByHash(tokenHash);

    if (!storedToken) {
      throw new AuthenticationError('Refresh token has been revoked or expired');
    }

    const tokenId = bigintToNumber(storedToken.id);

    if (tokenId !== payload.tokenId) {
      await this.authRepository.revokeAllUserRefreshTokens(payload.sub);
      throw new AuthenticationError('Refresh token reuse detected');
    }

    const user = await this.authRepository.findUserById(payload.sub);

    if (!user) {
      throw new AuthenticationError('User not found or inactive');
    }

    await this.authRepository.revokeRefreshToken(tokenId);

    return this.issueTokenPair({
      id: payload.sub,
      email: user.email,
      organizationId: payload.organizationId,
      role: payload.role,
      portal: payload.portal,
    });
  }

  async logout(userId: number, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      try {
        const payload = this.fastify.verifyRefreshToken(refreshToken);

        if (payload.sub !== userId) {
          throw new AuthenticationError('Refresh token does not belong to this user');
        }

        const tokenHash = await hashToken(refreshToken);
        const storedToken = await this.authRepository.findRefreshTokenByHash(tokenHash);

        if (storedToken) {
          await this.authRepository.revokeRefreshToken(bigintToNumber(storedToken.id));
        }
      } catch (error) {
        if (error instanceof AuthenticationError) {
          throw error;
        }
      }
    } else {
      await this.authRepository.revokeAllUserRefreshTokens(userId);
    }
  }

  async forgotPassword(input: ForgotPasswordBody): Promise<ForgotPasswordResult> {
    const user = await this.authRepository.findUserByEmailForPasswordReset(input.email);

    if (!user || !user.isActive) {
      return { message: FORGOT_PASSWORD_MESSAGE };
    }

    const allowedRoles = PORTAL_ALLOWED_ROLES[input.portal];
    const hasPortalAccess = user.memberships.some((membership) =>
      allowedRoles.includes(membership.role as (typeof allowedRoles)[number]),
    );

    if (!hasPortalAccess) {
      return { message: FORGOT_PASSWORD_MESSAGE };
    }

    await this.authRepository.invalidatePasswordResetTokens(bigintToNumber(user.id));

    const rawToken = crypto.randomUUID();
    const tokenHash = await hashToken(rawToken);
    const expiresAt = new Date(
      Date.now() + parseDurationToMs(this.fastify.config.passwordResetExpiry),
    );

    await this.authRepository.createPasswordResetToken({
      userId: bigintToNumber(user.id),
      tokenHash,
      expiresAt,
    });

    const resetUrl = `${this.fastify.config.webAppUrl}${PORTAL_RESET_PATH[input.portal]}?token=${encodeURIComponent(rawToken)}`;

    await this.emailService.sendPasswordResetEmail({
      to: user.email,
      firstName: user.firstName,
      resetUrl,
      portalLabel: PORTAL_LABEL[input.portal],
      expiresIn: this.fastify.config.passwordResetExpiry,
    });

    this.fastify.log.info(
      { userId: user.id.toString(), email: user.email, portal: input.portal },
      'Password reset token created',
    );

    if (this.fastify.config.isDevelopment) {
      this.fastify.log.debug({ resetToken: rawToken, resetUrl }, 'Dev password reset token');
    }

    return {
      message: FORGOT_PASSWORD_MESSAGE,
      ...(this.fastify.config.isDevelopment ? { resetToken: rawToken } : {}),
    };
  }

  async resetPassword(input: ResetPasswordBody): Promise<{ message: string }> {
    const tokenHash = await hashToken(input.token);
    const resetToken = await this.authRepository.findValidPasswordResetToken(tokenHash);

    if (!resetToken) {
      throw new BadRequestError('Invalid or expired password reset token');
    }

    const userId = bigintToNumber(resetToken.userId);
    const passwordHash = await this.hashPassword(input.password);

    await this.authRepository.updatePassword(userId, passwordHash);
    await this.authRepository.markPasswordResetTokenUsed(bigintToNumber(resetToken.id));
    await this.authRepository.invalidatePasswordResetTokens(userId);
    await this.authRepository.revokeAllUserRefreshTokens(userId);

    return { message: 'Password has been reset successfully' };
  }

  async changePassword(
    userId: number,
    input: ChangePasswordBody,
  ): Promise<{ message: string }> {
    const user = await this.authRepository.findUserById(userId);

    if (!user) {
      throw new AuthenticationError('User not found or inactive');
    }

    const isValidPassword = await argon2.verify(
      user.passwordHash,
      input.currentPassword,
    );

    if (!isValidPassword) {
      throw new AuthenticationError('Current password is incorrect');
    }

    const passwordHash = await this.hashPassword(input.newPassword);

    await this.authRepository.updatePassword(userId, passwordHash);
    await this.authRepository.revokeAllUserRefreshTokens(userId);

    return { message: 'Password changed successfully' };
  }

  async getProfile(session: SessionContext): Promise<AuthUserProfile> {
    const user = await this.authRepository.findUserById(session.id);

    if (!user) {
      throw new AuthenticationError('User not found or inactive');
    }

    const membership = user.memberships.find(
      (m) =>
        session.organizationId !== null &&
        bigintToNumber(m.organizationId) === session.organizationId,
    );

    const permissions = await resolvePermissionsForMembership(
      this.fastify.prisma,
      session.role,
      null,
    );

    let clientId: number | null = null;
    let clientName: string | null = null;
    if (session.role === 'CLIENT' && session.organizationId !== null) {
      const client = await this.authRepository.findClientByContactEmail(
        session.organizationId,
        user.email,
      );
      if (client) {
        clientId = bigintToNumber(client.id);
        clientName = client.name;
      }
    }

    return {
      id: session.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      organizationId: session.organizationId,
      organizationName: membership?.organization.name ?? null,
      clientId,
      clientName,
      role: session.role,
      portal: session.portal,
      permissions: permissions as Permission[],
      lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    };
  }

  getPermissionsForRole(role: Role): Permission[] {
    return [...staticPermissionsForRole(role)];
  }

  private resolveSession(
    user: UserWithMemberships,
    portal: Portal,
    organizationId?: number,
  ): SessionContext {
    const allowedRoles = PORTAL_ALLOWED_ROLES[portal];

    const eligibleMemberships = user.memberships.filter((membership) =>
      allowedRoles.includes(membership.role as (typeof allowedRoles)[number]),
    );

    if (eligibleMemberships.length === 0) {
      throw new AuthorizationError(
        `No active membership found for portal '${portal}'`,
      );
    }

    if (organizationId !== undefined) {
      const membership = eligibleMemberships.find(
        (m) => bigintToNumber(m.organizationId) === organizationId,
      );

      if (!membership) {
        throw new AuthorizationError(
          'No active membership found for the specified organization',
        );
      }

      return {
        id: bigintToNumber(user.id),
        email: user.email,
        organizationId: bigintToNumber(membership.organizationId),
        role: membership.role as Role,
        portal,
      };
    }

    if (portal !== PORTALS.ADMIN && eligibleMemberships.length > 1) {
      throw new BadRequestError(
        'organizationId is required when user belongs to multiple organizations',
      );
    }

    const membership = eligibleMemberships[0]!;

    return {
      id: bigintToNumber(user.id),
      email: user.email,
      organizationId: bigintToNumber(membership.organizationId),
      role: membership.role as Role,
      portal,
    };
  }

  private async issueTokenPair(session: SessionContext): Promise<AuthTokenResponse> {
    const accessToken = this.fastify.signAccessToken({
      sub: session.id,
      email: session.email,
      organizationId: session.organizationId,
      role: session.role,
      portal: session.portal,
    });

    const refreshTokenRecord = await this.createRefreshTokenRecord(session.id);
    const tokenId = bigintToNumber(refreshTokenRecord.id);

    const refreshToken = this.fastify.signRefreshToken({
      sub: session.id,
      tokenId,
      type: 'refresh',
      organizationId: session.organizationId,
      role: session.role,
      portal: session.portal,
    });

    const tokenHash = await hashToken(refreshToken);

    await this.authRepository.updateRefreshTokenHash(
      refreshTokenRecord.id,
      tokenHash,
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: this.fastify.config.jwt.accessExpiry,
      tokenType: 'Bearer',
    };
  }

  private async createRefreshTokenRecord(userId: number) {
    const expiresAt = new Date(
      Date.now() + parseDurationToMs(this.fastify.config.jwt.refreshExpiry),
    );

    return this.authRepository.createRefreshToken({
      userId,
      tokenHash: `pending-${crypto.randomUUID()}`,
      expiresAt,
    });
  }

  private hashPassword(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });
  }
}

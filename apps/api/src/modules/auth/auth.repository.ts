import type {
  Membership,
  PasswordResetToken,
  PrismaClient,
  RefreshToken,
  User,
} from '@prisma/client';
import { BaseRepository } from '../../repositories/base.repository.js';

export interface UserWithMemberships extends User {
  memberships: Array<
    Membership & {
      organization: { id: bigint; name: string; slug: string };
    }
  >;
}

export class AuthRepository extends BaseRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  findUserByEmail(email: string): Promise<UserWithMemberships | null> {
    return this.prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        deletedAt: null,
        isActive: true,
      },
      include: {
        memberships: {
          where: { isActive: true },
          include: {
            organization: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
      },
    });
  }

  findUserById(id: number): Promise<UserWithMemberships | null> {
    return this.prisma.user.findFirst({
      where: {
        id: BigInt(id),
        deletedAt: null,
        isActive: true,
      },
      include: {
        memberships: {
          where: { isActive: true },
          include: {
            organization: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
      },
    });
  }

  findUserByEmailIncludingInactive(email: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        deletedAt: null,
      },
    });
  }

  findUserByEmailForPasswordReset(email: string): Promise<UserWithMemberships | null> {
    return this.prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        deletedAt: null,
      },
      include: {
        memberships: {
          where: { isActive: true },
          include: {
            organization: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
      },
    });
  }

  updatePassword(userId: number, passwordHash: string): Promise<User> {
    return this.prisma.user.update({
      where: { id: BigInt(userId) },
      data: { passwordHash },
    });
  }

  updateLastLogin(userId: number): Promise<User> {
    return this.prisma.user.update({
      where: { id: BigInt(userId) },
      data: { lastLoginAt: new Date() },
    });
  }

  createRefreshToken(data: {
    userId: number;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<RefreshToken> {
    return this.prisma.refreshToken.create({
      data: {
        userId: BigInt(data.userId),
        tokenHash: data.tokenHash,
        expiresAt: data.expiresAt,
      },
    });
  }

  updateRefreshTokenHash(id: bigint, tokenHash: string): Promise<RefreshToken> {
    return this.prisma.refreshToken.update({
      where: { id },
      data: { tokenHash },
    });
  }

  findRefreshTokenByHash(tokenHash: string): Promise<RefreshToken | null> {
    return this.prisma.refreshToken.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
  }

  revokeRefreshToken(id: number): Promise<RefreshToken> {
    return this.prisma.refreshToken.update({
      where: { id: BigInt(id) },
      data: { revokedAt: new Date() },
    });
  }

  revokeAllUserRefreshTokens(userId: number): Promise<{ count: number }> {
    return this.prisma.refreshToken.updateMany({
      where: {
        userId: BigInt(userId),
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
  }

  invalidatePasswordResetTokens(userId: number): Promise<{ count: number }> {
    return this.prisma.passwordResetToken.updateMany({
      where: {
        userId: BigInt(userId),
        usedAt: null,
      },
      data: { usedAt: new Date() },
    });
  }

  createPasswordResetToken(data: {
    userId: number;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<PasswordResetToken> {
    return this.prisma.passwordResetToken.create({
      data: {
        userId: BigInt(data.userId),
        tokenHash: data.tokenHash,
        expiresAt: data.expiresAt,
      },
    });
  }

  findValidPasswordResetToken(tokenHash: string): Promise<PasswordResetToken | null> {
    return this.prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
  }

  markPasswordResetTokenUsed(id: number): Promise<PasswordResetToken> {
    return this.prisma.passwordResetToken.update({
      where: { id: BigInt(id) },
      data: { usedAt: new Date() },
    });
  }

  findClientByContactEmail(
    organizationId: number,
    email: string,
  ): Promise<{ id: bigint; name: string } | null> {
    return this.prisma.client.findFirst({
      where: {
        organizationId: BigInt(organizationId),
        contactEmail: email.toLowerCase(),
        deletedAt: null,
      },
      select: { id: true, name: true },
    });
  }
}

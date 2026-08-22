import argon2 from 'argon2';
import crypto from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import { BadRequestError, ConflictError, NotFoundError } from '../../utils/index.js';
import { hashToken } from '../../utils/index.js';
import { EmailService } from '../../services/email.service.js';
import { notifyClientOnboarded } from '../../services/notification-events.js';
import { slugify } from '../../utils/slug.js';
import type {
  ClientSignupRequestOtpBody,
  ClientSignupVerifyBody,
  PublicClientRegistrationBody,
} from './client-registration.validator.js';

const OTP_EXPIRY_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;

type SignupPayload = {
  companyName: string;
  contactName: string;
  contactPhone: string;
  contactDesignation: string;
  website?: string | null;
};

function splitContactName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { firstName: 'Client', lastName: 'User' };
  }
  if (parts.length === 1) {
    return { firstName: parts[0]!, lastName: 'User' };
  }
  return {
    firstName: parts[0]!,
    lastName: parts.slice(1).join(' '),
  };
}

function generateOtp(): string {
  return String(crypto.randomInt(100_000, 1_000_000));
}

export class ClientRegistrationService {
  private readonly emailService: EmailService;

  constructor(private readonly fastify: FastifyInstance) {
    this.emailService = new EmailService(fastify.config, fastify.prisma);
  }

  private async resolveDefaultOrganizationId(): Promise<number> {
    const configured = process.env.DEFAULT_ORG_ID?.trim();
    if (configured) {
      const org = await this.fastify.prisma.organization.findFirst({
        where: { id: BigInt(configured), deletedAt: null, isActive: true },
        select: { id: true },
      });
      if (org) {
        return Number(org.id);
      }
    }

    const org = await this.fastify.prisma.organization.findFirst({
      where: { deletedAt: null, isActive: true },
      orderBy: { id: 'asc' },
      select: { id: true },
    });

    if (!org) {
      throw new NotFoundError('No organization is configured for client registration');
    }

    return Number(org.id);
  }

  private async slugTaken(
    organizationId: number,
    slug: string,
    excludeClientId?: number,
  ): Promise<boolean> {
    const existing = await this.fastify.prisma.client.findFirst({
      where: {
        organizationId: BigInt(organizationId),
        slug,
        ...(excludeClientId != null ? { NOT: { id: BigInt(excludeClientId) } } : {}),
      },
      select: { id: true },
    });
    return Boolean(existing);
  }

  private async generateUniqueSlug(
    organizationId: number,
    name: string,
    excludeClientId?: number,
  ): Promise<string> {
    const base = slugify(name) || 'client';
    let slug = base;
    let suffix = 0;

    while (await this.slugTaken(organizationId, slug, excludeClientId)) {
      suffix += 1;
      slug = `${base}-${suffix}`;
    }

    return slug;
  }

  private getClientSignupOtpDelegate() {
    const delegate = this.fastify.prisma.clientSignupOtp;
    if (!delegate) {
      throw new BadRequestError(
        'Client signup verification is temporarily unavailable. Please restart the API server and try again.',
      );
    }
    return delegate;
  }

  private async assertEmailAvailable(email: string): Promise<void> {
    const existingUser = await this.fastify.prisma.user.findFirst({
      where: { email, deletedAt: null },
      select: { id: true },
    });

    if (existingUser) {
      throw new ConflictError('An account with this email already exists');
    }
  }

  async requestOtp(
    input: ClientSignupRequestOtpBody,
  ): Promise<{ message: string; expiresInMinutes: number }> {
    const email = input.contactEmail.toLowerCase().trim();
    await this.assertEmailAvailable(email);

    const otp = generateOtp();
    const otpHash = await hashToken(otp);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60_000);

    const payload: SignupPayload = {
      companyName: input.companyName.trim(),
      contactName: input.contactName.trim(),
      contactPhone: input.contactPhone.trim(),
      contactDesignation: input.contactDesignation.trim(),
      website: input.website?.trim() || null,
    };

    const clientSignupOtp = this.getClientSignupOtpDelegate();
    await clientSignupOtp.updateMany({
      where: { email, usedAt: null },
      data: { usedAt: new Date() },
    });

    await clientSignupOtp.create({
      data: {
        email,
        otpHash,
        payload,
        expiresAt,
      },
    });

    await this.emailService.sendClientSignupOtpEmail({
      to: email,
      contactName: payload.contactName,
      otp,
      expiresInMinutes: OTP_EXPIRY_MINUTES,
    });

    if (this.fastify.config.isDevelopment) {
      this.fastify.log.debug({ email, otp }, 'Dev client signup OTP');
    }

    return {
      message: 'Verification code sent to your email.',
      expiresInMinutes: OTP_EXPIRY_MINUTES,
    };
  }

  async verifyAndCreate(
    input: ClientSignupVerifyBody,
  ): Promise<{ message: string; clientId: number }> {
    const email = input.contactEmail.toLowerCase().trim();
    await this.assertEmailAvailable(email);

    const clientSignupOtp = this.getClientSignupOtpDelegate();
    const record = await clientSignupOtp.findFirst({
      where: {
        email,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) {
      throw new BadRequestError('Verification code expired or not found. Please request a new code.');
    }

    if (record.attempts >= MAX_OTP_ATTEMPTS) {
      throw new BadRequestError('Too many failed attempts. Please request a new verification code.');
    }

    const otpHash = await hashToken(input.otp.trim());
    const valid = otpHash === record.otpHash;

    if (!valid) {
      await clientSignupOtp.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } },
      });
      throw new BadRequestError('Invalid verification code. Please try again.');
    }

    const signupPayload = record.payload as SignupPayload;
    await clientSignupOtp.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    });

    return this.createClientAccount(email, signupPayload);
  }

  /** @deprecated Password-based registration */
  async register(input: PublicClientRegistrationBody): Promise<{ message: string; clientId: number }> {
    const email = input.contactEmail.toLowerCase().trim();
    await this.assertEmailAvailable(email);

    return this.createClientAccount(email, {
      companyName: input.companyName.trim(),
      contactName: input.contactName.trim(),
      contactPhone: input.contactPhone.trim(),
      contactDesignation: input.contactDesignation?.trim() ?? '',
      website: input.website?.trim() || null,
    }, input.password);
  }

  private async createClientAccount(
    email: string,
    input: SignupPayload,
    password?: string,
  ): Promise<{ message: string; clientId: number }> {
    const organizationId = await this.resolveDefaultOrganizationId();
    const organization = await this.fastify.prisma.organization.findFirst({
      where: { id: BigInt(organizationId), deletedAt: null },
      select: { name: true },
    });

    if (!organization) {
      throw new NotFoundError('Organization not found');
    }

    const { firstName, lastName } = splitContactName(input.contactName);
    const passwordHash = password
      ? await argon2.hash(password)
      : await argon2.hash(crypto.randomBytes(32).toString('hex'));

    const deletedUser = await this.fastify.prisma.user.findFirst({
      where: { email, deletedAt: { not: null } },
      include: {
        memberships: {
          where: {
            organizationId: BigInt(organizationId),
            role: 'CLIENT',
          },
        },
      },
    });

    const result = await this.fastify.prisma.$transaction(async (tx) => {
      if (deletedUser) {
        const membership = deletedUser.memberships[0];
        let linkedClient =
          membership?.clientId != null
            ? await tx.client.findFirst({
                where: {
                  id: membership.clientId,
                  organizationId: BigInt(organizationId),
                },
              })
            : null;

        if (!linkedClient) {
          linkedClient = await tx.client.findFirst({
            where: {
              organizationId: BigInt(organizationId),
              contactEmail: email,
              deletedAt: { not: null },
            },
            orderBy: { id: 'desc' },
          });
        }

        const restoreClientId =
          linkedClient != null ? Number(linkedClient.id) : undefined;
        const slug =
          linkedClient?.slug ??
          (await this.generateUniqueSlug(organizationId, input.companyName, restoreClientId));

        let client;
        if (linkedClient) {
          client = await tx.client.update({
            where: { id: linkedClient.id },
            data: {
              deletedAt: null,
              slug,
              name: input.companyName,
              status: 'INACTIVE',
              industry: 'Pending',
              contactName: input.contactName,
              contactDesignation: input.contactDesignation || null,
              website: input.website?.trim() || null,
              contactEmail: email,
              contactPhone: input.contactPhone,
            },
          });
        } else {
          client = await tx.client.create({
            data: {
              organizationId: BigInt(organizationId),
              slug,
              name: input.companyName,
              status: 'INACTIVE',
              industry: 'Pending',
              contactName: input.contactName,
              contactDesignation: input.contactDesignation || null,
              website: input.website?.trim() || null,
              contactEmail: email,
              contactPhone: input.contactPhone,
            },
          });
        }

        const user = await tx.user.update({
          where: { id: deletedUser.id },
          data: {
            deletedAt: null,
            isActive: false,
            mustChangePassword: false,
            passwordHash,
            firstName,
            lastName,
            phone: input.contactPhone,
          },
        });

        if (membership) {
          await tx.membership.update({
            where: { id: membership.id },
            data: {
              clientId: client.id,
              isActive: false,
            },
          });
        } else {
          await tx.membership.create({
            data: {
              userId: user.id,
              organizationId: BigInt(organizationId),
              role: 'CLIENT',
              clientId: client.id,
              isActive: false,
            },
          });
        }

        return { client, user };
      }

      const slug = await this.generateUniqueSlug(organizationId, input.companyName);

      const client = await tx.client.create({
        data: {
          organizationId: BigInt(organizationId),
          slug,
          name: input.companyName,
          status: 'INACTIVE',
          industry: 'Pending',
          contactName: input.contactName,
          contactDesignation: input.contactDesignation || null,
          website: input.website?.trim() || null,
          contactEmail: email,
          contactPhone: input.contactPhone,
        },
      });

      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          firstName,
          lastName,
          phone: input.contactPhone,
          isActive: false,
          memberships: {
            create: {
              organizationId: BigInt(organizationId),
              role: 'CLIENT',
              clientId: client.id,
              isActive: false,
            },
          },
        },
      });

      return { client, user };
    });

    const clientId = Number(result.client.id);
    const loginUrl = `${this.fastify.config.webAppUrl}/login/client`;

    void this.emailService.sendClientRegistrationAcknowledgement({
      to: email,
      contactName: input.contactName,
      companyName: input.companyName,
      loginUrl,
    });

    void notifyClientOnboarded(this.fastify.prisma, this.fastify.config, {
      organizationId,
      clientId,
      clientName: input.companyName,
      kind: 'created',
      userEmail: email,
      title: 'New client registration (pending activation)',
      body: `${input.companyName} registered via the public signup form and is pending activation.`,
    });

    return {
      message:
        'Registration received. Your account is pending activation. We will email you when you can sign in.',
      clientId,
    };
  }
}

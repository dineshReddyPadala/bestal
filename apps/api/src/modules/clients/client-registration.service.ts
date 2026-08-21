import argon2 from 'argon2';
import type { FastifyInstance } from 'fastify';
import { ConflictError, NotFoundError } from '../../utils/index.js';
import { EmailService } from '../../services/email.service.js';
import { notifyClientOnboarded } from '../../services/notification-events.js';
import { ClientRepository } from './client.repository.js';
import { slugify } from '../../utils/slug.js';
import type { PublicClientRegistrationBody } from './client-registration.validator.js';

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

export class ClientRegistrationService {
  private readonly clientRepository: ClientRepository;
  private readonly emailService: EmailService;

  constructor(private readonly fastify: FastifyInstance) {
    this.clientRepository = new ClientRepository(fastify.prisma);
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

  private async generateUniqueSlug(organizationId: number, name: string): Promise<string> {
    const base = slugify(name) || 'client';
    let slug = base;
    let suffix = 0;

    while (await this.clientRepository.findBySlug(organizationId, slug)) {
      suffix += 1;
      slug = `${base}-${suffix}`;
    }

    return slug;
  }

  async register(input: PublicClientRegistrationBody): Promise<{ message: string; clientId: number }> {
    const email = input.contactEmail.toLowerCase().trim();
    const existingUser = await this.fastify.prisma.user.findFirst({
      where: { email, deletedAt: null },
      select: { id: true },
    });

    if (existingUser) {
      throw new ConflictError('An account with this email already exists');
    }

    const organizationId = await this.resolveDefaultOrganizationId();
    const organization = await this.fastify.prisma.organization.findFirst({
      where: { id: BigInt(organizationId), deletedAt: null },
      select: { name: true },
    });

    if (!organization) {
      throw new NotFoundError('Organization not found');
    }

    const slug = await this.generateUniqueSlug(organizationId, input.companyName);
    const { firstName, lastName } = splitContactName(input.contactName);
    const passwordHash = await argon2.hash(input.password);

    const result = await this.fastify.prisma.$transaction(async (tx) => {
      const client = await tx.client.create({
        data: {
          organizationId: BigInt(organizationId),
          slug,
          name: input.companyName.trim(),
          status: 'INACTIVE',
          industry: 'Pending',
          contactName: input.contactName.trim(),
          contactEmail: email,
          contactPhone: input.contactPhone.trim(),
        },
      });

      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          firstName,
          lastName,
          phone: input.contactPhone.trim(),
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
      contactName: input.contactName.trim(),
      companyName: input.companyName.trim(),
      loginUrl,
    });

    void notifyClientOnboarded(this.fastify.prisma, this.fastify.config, {
      organizationId,
      clientId,
      clientName: input.companyName.trim(),
      kind: 'created',
      userEmail: email,
      title: 'New client registration (pending activation)',
      body: `${input.companyName.trim()} registered via the public signup form and is pending activation.`,
    });

    return {
      message:
        'Registration received. Your account is pending activation. We will email you when you can sign in.',
      clientId,
    };
  }
}

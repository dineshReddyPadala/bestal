import { randomBytes } from 'node:crypto';
import argon2 from 'argon2';
import type { FastifyInstance } from 'fastify';
import type { AuthenticatedUser } from '../../types/index.js';
import type { Role } from '../../constants/index.js';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  requireOrganization,
} from '../../utils/index.js';
import { rolePortalLoginPath } from '../../utils/role-portal-paths.js';
import { EmailService } from '../../services/email.service.js';
import { buildPaginationMeta } from '../../validators/common.validator.js';
import { mapUserToDto, mapUserToListItem } from './user.mapper.js';
import { UserRepository } from './user.repository.js';
import type {
  BulkInviteResult,
  CreateUserInput,
  UserDto,
  UserListItemDto,
} from './user.types.js';
import type { ListUsersQuery } from './user.validator.js';

function generateTemporaryPassword(length = 12): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$';
  const bytes = randomBytes(length);
  let result = '';
  for (let i = 0; i < length; i += 1) {
    result += alphabet[bytes[i]! % alphabet.length];
  }
  return result;
}

export class UserService {
  private readonly userRepository: UserRepository;
  private readonly emailService: EmailService;

  constructor(private readonly fastify: FastifyInstance, userRepository?: UserRepository) {
    this.userRepository = userRepository ?? new UserRepository(fastify.prisma);
    this.emailService = new EmailService(fastify.config, fastify.prisma);
  }

  private async assertClientLink(
    organizationId: number,
    role: Role,
    clientId?: number,
  ): Promise<number | undefined> {
    if (role === 'CLIENT') {
      if (clientId == null) {
        throw new BadRequestError('clientId is required for CLIENT users');
      }
      const exists = await this.userRepository.clientExists(organizationId, clientId);
      if (!exists) {
        throw new BadRequestError('Client not found');
      }
      return clientId;
    }
    if (clientId != null) {
      throw new BadRequestError('clientId is only allowed for CLIENT users');
    }
    return undefined;
  }

  async invite(authUser: AuthenticatedUser, input: CreateUserInput): Promise<UserDto> {
    const organizationId = requireOrganization(authUser);
    const organization = await this.userRepository.findOrganizationById(organizationId);
    if (!organization) {
      throw new NotFoundError('Organization not found');
    }

    const linkedClientId = await this.assertClientLink(
      organizationId,
      input.role,
      input.clientId,
    );

    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError('A user with this email already exists');
    }

    const temporaryPassword = generateTemporaryPassword();
    const passwordHash = await argon2.hash(temporaryPassword);

    const user = await this.userRepository.createWithMembership(
      organizationId,
      passwordHash,
      { ...input, clientId: linkedClientId },
    );

    if (linkedClientId != null) {
      const client = await this.fastify.prisma.client.findFirst({
        where: {
          id: BigInt(linkedClientId),
          organizationId: BigInt(organizationId),
          deletedAt: null,
        },
        select: { name: true },
      });
      const { notifyClientOnboarded } = await import(
        '../../services/notification-events.js'
      );
      void notifyClientOnboarded(this.fastify.prisma, this.fastify.config, {
        organizationId,
        clientId: linkedClientId,
        clientName: client?.name ?? `Client #${linkedClientId}`,
        kind: 'user_linked',
        userEmail: input.email,
      });
    }

    const portalLoginUrl = `${this.fastify.config.webAppUrl}${rolePortalLoginPath(input.role)}`;

    const emailResult = await this.emailService.sendInviteCredentials({
      to: input.email.toLowerCase(),
      firstName: input.firstName,
      lastName: input.lastName,
      role: input.role as Role,
      organizationName: organization.name,
      temporaryPassword,
      portalLoginUrl,
    });

    return mapUserToDto(
      user,
      organizationId,
      organization.name,
      emailResult.sent,
    );
  }

  async inviteBulk(
    authUser: AuthenticatedUser,
    users: CreateUserInput[],
  ): Promise<BulkInviteResult> {
    const results: BulkInviteResult['results'] = [];
    let created = 0;
    let failed = 0;

    for (const entry of users) {
      try {
        const user = await this.invite(authUser, entry);
        created += 1;
        results.push({
          email: entry.email.toLowerCase(),
          status: 'created',
          userId: user.id,
          emailSent: user.emailSent,
        });
      } catch (error) {
        failed += 1;
        results.push({
          email: entry.email.toLowerCase(),
          status: 'failed',
          error: error instanceof Error ? error.message : 'Invite failed',
        });
      }
    }

    return { created, failed, results };
  }

  async list(
    authUser: AuthenticatedUser,
    query: ListUsersQuery,
  ): Promise<{
    data: UserListItemDto[];
    meta: ReturnType<typeof buildPaginationMeta>;
  }> {
    const organizationId = requireOrganization(authUser);

    const { items, total } = await this.userRepository.findMany({
      organizationId,
      page: query.page,
      limit: query.limit,
      sort: query.sort,
      search: query.search,
      role: query.role as Role | undefined,
      isActive: query.isActive,
    });

    return {
      data: items.map((item) => mapUserToListItem(item, organizationId)),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }
}

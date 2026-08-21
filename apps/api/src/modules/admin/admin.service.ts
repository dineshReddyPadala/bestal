import argon2 from 'argon2';
import { randomBytes, randomUUID } from 'node:crypto';
import type { AuditAction, ClientStatus, Prisma, PrismaClient } from '@prisma/client';
import type { FastifyInstance } from 'fastify';
import { ROLES, type Role } from '../../constants/index.js';
import type { AuthenticatedUser } from '../../types/index.js';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  bigintToNumber,
  hashToken,
  parseDurationToMs,
  requireOrganization,
} from '../../utils/index.js';
import { rolePasswordResetPath, rolePortalEmailLabel, rolePortalLoginPath } from '../../utils/role-portal-paths.js';
import { EmailService } from '../../services/email.service.js';
import { StorageService } from '../../services/storage.service.js';
import { UPLOAD_CATEGORIES } from '../../services/storage/storage.constants.js';
import { buildS3ObjectReference } from '../../services/storage/upload.utils.js';
import { notifyCandidateApproved, notifyCandidateSentBack } from '../../services/notification-events.js';
import { buildPaginationMeta } from '../../validators/common.validator.js';
import { AuthRepository } from '../auth/auth.repository.js';
import { CandidateService } from '../candidates/candidate.service.js';
import { ClientService } from '../clients/client.service.js';
import { UserRepository } from '../users/user.repository.js';
import { mapUserToDto, mapUserToListItem } from '../users/user.mapper.js';
import { AuditService } from './audit.service.js';

const ADMIN_INVITE_ROLES = ['ADMIN', 'RECRUITER', 'SALES', 'VIEWER', 'CLIENT'] as const;
type AdminInviteRole = (typeof ADMIN_INVITE_ROLES)[number];

function tempPassword(length = 12): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$';
  const bytes = randomBytes(length);
  let result = '';
  for (let i = 0; i < length; i += 1) {
    result += alphabet[bytes[i]! % alphabet.length];
  }
  return result;
}

export class AdminService {
  private readonly prisma: PrismaClient;
  private readonly audit: AuditService;
  private readonly users: UserRepository;
  private readonly email: EmailService;
  private readonly candidates: CandidateService;
  private readonly clients: ClientService;
  private readonly storageService: StorageService;

  constructor(private readonly fastify: FastifyInstance) {
    this.prisma = fastify.prisma;
    this.audit = new AuditService(fastify.prisma);
    this.users = new UserRepository(fastify.prisma);
    this.email = new EmailService(fastify.config, fastify.prisma);
    this.candidates = new CandidateService(fastify);
    this.clients = new ClientService(fastify);
    this.storageService = new StorageService(fastify.config, fastify.prisma);
  }

  private async auditWrite(
    authUser: AuthenticatedUser,
    action: AuditAction,
    resourceType: string,
    resourceId: number | null,
    description: string,
    metadata?: Prisma.InputJsonValue,
    ctx?: { ipAddress?: string | null; userAgent?: string | null },
  ) {
    await this.audit.write({
      organizationId: authUser.organizationId,
      actorId: authUser.id,
      action,
      resourceType,
      resourceId,
      description,
      metadata,
      ipAddress: ctx?.ipAddress,
      userAgent: ctx?.userAgent,
    });
  }

  // ── Dashboard ────────────────────────────────────────────────────────────

  async dashboard(authUser: AuthenticatedUser) {
    const organizationId = requireOrganization(authUser);
    const org = BigInt(organizationId);

    const [
      totalCandidates,
      clientVisibleCandidates,
      pendingApprovals,
      activeClients,
      activeTrials,
      activeDeployments,
      deployments,
      recentCandidates,
      recentApprovals,
      recentTrials,
      recentDeployments,
    ] = await Promise.all([
      this.prisma.candidate.count({ where: { organizationId: org, deletedAt: null } }),
      this.prisma.candidate.count({
        where: { organizationId: org, deletedAt: null, visibility: 'CLIENT_VISIBLE' },
      }),
      this.prisma.candidate.count({
        where: {
          organizationId: org,
          deletedAt: null,
          approvalStatus: 'PENDING',
          submittedForApprovalAt: { not: null },
          profileStatus: 'PENDING_APPROVAL',
        },
      }),
      this.prisma.client.count({
        where: { organizationId: org, deletedAt: null, status: 'ACTIVE' },
      }),
      this.prisma.trialRequest.count({
        where: {
          organizationId: org,
          deletedAt: null,
          status: { in: ['REQUESTED', 'APPROVED', 'IN_PROGRESS'] },
        },
      }),
      this.prisma.deployment.count({
        where: { organizationId: org, deletedAt: null, status: 'ACTIVE' },
      }),
      this.prisma.deployment.findMany({
        where: { organizationId: org, deletedAt: null, status: 'ACTIVE' },
        select: { billingRate: true, candidatePayRate: true, expectedHoursPerWeek: true },
      }),
      this.prisma.candidate.findMany({
        where: { organizationId: org, deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          primaryRole: true,
          createdAt: true,
          profileStatus: true,
        },
      }),
      this.prisma.candidate.findMany({
        where: {
          organizationId: org,
          deletedAt: null,
          approvalStatus: 'APPROVED',
          approvedAt: { not: null },
        },
        orderBy: { approvedAt: 'desc' },
        take: 5,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          approvedAt: true,
          profileStatus: true,
        },
      }),
      this.prisma.trialRequest.findMany({
        where: { organizationId: org, deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          candidate: { select: { firstName: true, lastName: true } },
          client: { select: { name: true } },
        },
      }),
      this.prisma.deployment.findMany({
        where: { organizationId: org, deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          candidate: { select: { firstName: true, lastName: true } },
          client: { select: { name: true } },
        },
      }),
    ]);

    let estimatedMonthlyRevenue = 0;
    let estimatedMonthlyMargin = 0;
    for (const d of deployments) {
      const hours = d.expectedHoursPerWeek ? Number(d.expectedHoursPerWeek) * 4.33 : 160;
      const bill = d.billingRate ? Number(d.billingRate) : 0;
      const pay = d.candidatePayRate ? Number(d.candidatePayRate) : 0;
      estimatedMonthlyRevenue += bill * hours;
      estimatedMonthlyMargin += (bill - pay) * hours;
    }

    return {
      totalCandidates,
      clientVisibleCandidates,
      pendingApprovals,
      activeClients,
      activeTrials,
      activeDeployments,
      estimatedMonthlyRevenue: Math.round(estimatedMonthlyRevenue),
      estimatedMonthlyMargin: Math.round(estimatedMonthlyMargin),
      recentCandidates: recentCandidates.map((c) => ({
        id: bigintToNumber(c.id),
        name: `${c.firstName} ${c.lastName}`,
        role: c.primaryRole,
        profileStatus: c.profileStatus,
        createdAt: c.createdAt.toISOString(),
      })),
      recentApprovals: recentApprovals.map((c) => ({
        id: bigintToNumber(c.id),
        name: `${c.firstName} ${c.lastName}`,
        profileStatus: c.profileStatus,
        approvedAt: c.approvedAt?.toISOString() ?? null,
      })),
      recentTrials: recentTrials.map((t) => ({
        id: bigintToNumber(t.id),
        candidateName: `${t.candidate.firstName} ${t.candidate.lastName}`,
        clientName: t.client.name,
        status: t.status,
        createdAt: t.createdAt.toISOString(),
      })),
      recentDeployments: recentDeployments.map((d) => ({
        id: bigintToNumber(d.id),
        candidateName: `${d.candidate.firstName} ${d.candidate.lastName}`,
        clientName: d.client.name,
        status: d.status,
        createdAt: d.createdAt.toISOString(),
      })),
    };
  }

  // ── Users ────────────────────────────────────────────────────────────────

  async listUsers(
    authUser: AuthenticatedUser,
    query: { page: number; limit: number; search?: string; role?: string; isActive?: boolean },
  ) {
    const organizationId = requireOrganization(authUser);
    const { items, total } = await this.users.findMany({
      organizationId,
      page: query.page,
      limit: query.limit,
      search: query.search,
      role: query.role as Role | undefined,
      isActive: query.isActive,
    });
    return {
      data: items.map((item) => mapUserToListItem(item, organizationId)),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async getUser(authUser: AuthenticatedUser, id: number) {
    const organizationId = requireOrganization(authUser);
    const user = await this.prisma.user.findFirst({
      where: {
        id: BigInt(id),
        deletedAt: null,
        memberships: { some: { organizationId: BigInt(organizationId) } },
      },
      include: {
        memberships: {
          include: {
            organization: { select: { id: true, name: true } },
            client: { select: { id: true, name: true } },
          },
        },
      },
    });
    if (!user) throw new NotFoundError('User not found');
    const org = user.memberships.find(
      (membership) => bigintToNumber(membership.organizationId) === organizationId,
    )?.organization;
    return mapUserToDto(user, organizationId, org?.name ?? '', false);
  }

  private async syncClientPortalAccess(
    organizationId: number,
    userId: number,
    isActive: boolean,
    clientId?: number | null,
  ) {
    await this.prisma.membership.updateMany({
      where: {
        userId: BigInt(userId),
        organizationId: BigInt(organizationId),
      },
      data: { isActive },
    });

    if (isActive && clientId != null) {
      await this.prisma.client.updateMany({
        where: {
          id: BigInt(clientId),
          organizationId: BigInt(organizationId),
          deletedAt: null,
        },
        data: { status: 'ACTIVE' },
      });
    }
  }

  private async syncClientUsersOnClientActivation(organizationId: number, clientId: number) {
    const memberships = await this.prisma.membership.findMany({
      where: {
        organizationId: BigInt(organizationId),
        clientId: BigInt(clientId),
        role: 'CLIENT',
      },
      select: { userId: true },
    });

    if (memberships.length === 0) {
      return;
    }

    const userIds = memberships.map((membership) => membership.userId);

    await this.prisma.user.updateMany({
      where: { id: { in: userIds }, deletedAt: null },
      data: { isActive: true },
    });

    await this.prisma.membership.updateMany({
      where: {
        organizationId: BigInt(organizationId),
        clientId: BigInt(clientId),
        role: 'CLIENT',
      },
      data: { isActive: true },
    });
  }

  private async sendClientActivationWelcomeEmails(organizationId: number, clientId: number) {
    const client = await this.prisma.client.findFirst({
      where: {
        id: BigInt(clientId),
        organizationId: BigInt(organizationId),
        deletedAt: null,
      },
      select: { name: true },
    });
    if (!client) return;

    const memberships = await this.prisma.membership.findMany({
      where: {
        organizationId: BigInt(organizationId),
        clientId: BigInt(clientId),
        role: 'CLIENT',
        isActive: true,
      },
      select: {
        user: {
          select: {
            email: true,
            firstName: true,
            deletedAt: true,
            isActive: true,
          },
        },
      },
    });

    const loginUrl = `${this.fastify.config.webAppUrl}${rolePortalLoginPath('CLIENT')}`;

    for (const membership of memberships) {
      const user = membership.user;
      if (!user?.email || user.deletedAt || !user.isActive) continue;

      void this.email.sendClientWelcomeEmail({
        to: user.email,
        firstName: user.firstName?.trim() || 'there',
        companyName: client.name,
        loginUrl,
      });
    }
  }

  private async resolvePlatformRoleId(roleCode: string): Promise<number | null> {
    const row = await this.prisma.platformRole.findFirst({
      where: { code: roleCode.toUpperCase(), deletedAt: null, isActive: true },
      select: { id: true },
    });
    return row ? bigintToNumber(row.id) : null;
  }

  private async assertAdminClientLink(
    organizationId: number,
    role: AdminInviteRole,
    clientId?: number | null,
  ): Promise<number | null> {
    if (role === 'CLIENT') {
      if (clientId == null) {
        throw new BadRequestError('clientId is required for CLIENT users');
      }
      const exists = await this.users.clientExists(organizationId, clientId);
      if (!exists) {
        throw new BadRequestError('Client not found');
      }
      return clientId;
    }
    if (clientId != null) {
      throw new BadRequestError('clientId is only allowed for CLIENT users');
    }
    return null;
  }

  async createUser(
    authUser: AuthenticatedUser,
    input: {
      email: string;
      firstName: string;
      lastName: string;
      phone?: string;
      role: AdminInviteRole;
      clientId?: number;
      temporaryPassword?: string;
      isActive?: boolean;
    },
    ctx?: { ipAddress?: string | null; userAgent?: string | null },
  ) {
    if (!ADMIN_INVITE_ROLES.includes(input.role)) {
      throw new BadRequestError(
        'Role must be ADMIN, RECRUITER, SALES, VIEWER, or CLIENT',
      );
    }
    const organizationId = requireOrganization(authUser);
    const organization = await this.users.findOrganizationById(organizationId);
    if (!organization) throw new NotFoundError('Organization not found');
    const linkedClientId = await this.assertAdminClientLink(
      organizationId,
      input.role,
      input.clientId,
    );
    const existing = await this.users.findByEmail(input.email);
    if (existing) throw new ConflictError('A user with this email already exists');

    const temporaryPassword = input.temporaryPassword?.trim() || tempPassword();
    const passwordHash = await argon2.hash(temporaryPassword);
    const platformRoleId = await this.resolvePlatformRoleId(input.role);
    const user = await this.users.createWithMembership(organizationId, passwordHash, {
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      role: input.role as Role,
      clientId: linkedClientId ?? undefined,
      platformRoleId,
    });

    if (input.isActive === false) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { isActive: false },
      });
    }

    const portalPath = rolePortalLoginPath(input.role);
    const emailResult = await this.email.sendInviteCredentials({
      to: input.email.toLowerCase(),
      firstName: input.firstName,
      lastName: input.lastName,
      role: input.role as Role,
      temporaryPassword,
      portalLoginUrl: `${this.fastify.config.webAppUrl}${portalPath}`,
    });

    await this.auditWrite(
      authUser,
      'CREATE',
      'User',
      bigintToNumber(user.id),
      `Created user ${input.email}`,
      { role: input.role, clientId: linkedClientId },
      ctx,
    );

    return mapUserToDto(user, organizationId, organization.name, emailResult.sent);
  }

  async updateUser(
    authUser: AuthenticatedUser,
    id: number,
    input: {
      firstName?: string;
      lastName?: string;
      phone?: string | null;
      role?: AdminInviteRole;
      clientId?: number | null;
      isActive?: boolean;
    },
    ctx?: { ipAddress?: string | null; userAgent?: string | null },
  ) {
    const organizationId = requireOrganization(authUser);
    const existing = await this.getUser(authUser, id);

    await this.prisma.user.update({
      where: { id: BigInt(id) },
      data: {
        ...(input.firstName !== undefined ? { firstName: input.firstName } : {}),
        ...(input.lastName !== undefined ? { lastName: input.lastName } : {}),
        ...(input.phone !== undefined ? { phone: input.phone } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      },
    });

    const nextRole = (input.role ?? existing.role ?? 'VIEWER') as AdminInviteRole;
    let linkedClientId = existing.clientId;
    if (input.role || input.clientId !== undefined) {
      if (input.role && !ADMIN_INVITE_ROLES.includes(input.role)) {
        throw new BadRequestError(
          'Role must be ADMIN, RECRUITER, SALES, VIEWER, or CLIENT',
        );
      }
      linkedClientId = await this.assertAdminClientLink(
        organizationId,
        nextRole,
        input.clientId !== undefined ? input.clientId : existing.clientId,
      );
      const platformRoleId = input.role
        ? await this.resolvePlatformRoleId(input.role)
        : undefined;
      await this.users.updateMembershipClient(organizationId, id, {
        ...(input.role ? { role: input.role as Role } : {}),
        ...(platformRoleId !== undefined ? { platformRoleId } : {}),
        clientId: linkedClientId,
      });
    }

    if (input.isActive !== undefined && nextRole === 'CLIENT') {
      await this.syncClientPortalAccess(organizationId, id, input.isActive, linkedClientId);
    } else if (input.isActive !== undefined) {
      await this.prisma.membership.updateMany({
        where: {
          userId: BigInt(id),
          organizationId: BigInt(organizationId),
        },
        data: { isActive: input.isActive },
      });
    }

    await this.auditWrite(authUser, 'UPDATE', 'User', id, `Updated user ${id}`, input, ctx);
    return this.getUser(authUser, id);
  }

  async setUserStatus(
    authUser: AuthenticatedUser,
    id: number,
    isActive: boolean,
    ctx?: { ipAddress?: string | null; userAgent?: string | null },
  ) {
    return this.updateUser(authUser, id, { isActive }, ctx);
  }

  async resetUserPassword(
    authUser: AuthenticatedUser,
    id: number,
    ctx?: { ipAddress?: string | null; userAgent?: string | null },
  ) {
    const user = await this.getUser(authUser, id);
    if (!user.isActive) {
      throw new BadRequestError('Cannot reset password for an inactive user');
    }

    const authRepository = new AuthRepository(this.prisma);
    await authRepository.invalidatePasswordResetTokens(id);

    const rawToken = randomUUID();
    const tokenHash = await hashToken(rawToken);
    const expiresAt = new Date(
      Date.now() + parseDurationToMs(this.fastify.config.passwordResetExpiry),
    );

    await authRepository.createPasswordResetToken({
      userId: id,
      tokenHash,
      expiresAt,
    });

    const role = (user.role ?? ROLES.VIEWER) as Role;
    const resetPath = rolePasswordResetPath(role);
    const resetUrl = `${this.fastify.config.webAppUrl}${resetPath}?token=${encodeURIComponent(rawToken)}`;

    const emailResult = await this.email.sendPasswordResetEmail({
      to: user.email,
      firstName: user.firstName,
      resetUrl,
      portalLabel: rolePortalEmailLabel(role),
      expiresIn: this.fastify.config.passwordResetExpiry,
    });

    await this.auditWrite(
      authUser,
      'UPDATE',
      'User',
      id,
      `Sent password reset email to ${user.email}`,
      undefined,
      ctx,
    );

    if (this.fastify.config.isDevelopment) {
      this.fastify.log.debug({ resetToken: rawToken, resetUrl, userId: id }, 'Dev admin password reset');
    }

    return {
      message: emailResult.sent
        ? 'Password reset email sent'
        : 'Password reset link created (email not sent — check SMTP settings)',
      email: user.email,
      emailSent: emailResult.sent,
    };
  }

  async resendInvite(
    authUser: AuthenticatedUser,
    id: number,
    ctx?: { ipAddress?: string | null; userAgent?: string | null },
  ) {
    const user = await this.getUser(authUser, id);
    if (!user.isActive) {
      throw new BadRequestError('Cannot resend invitation to an inactive user');
    }

    const temporaryPassword = tempPassword();
    await this.prisma.user.update({
      where: { id: BigInt(id) },
      data: { passwordHash: await argon2.hash(temporaryPassword) },
    });

    const role = (user.role ?? ROLES.VIEWER) as Role;
    const emailResult = await this.email.sendInviteCredentials({
      to: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role,
      temporaryPassword,
      portalLoginUrl: `${this.fastify.config.webAppUrl}${rolePortalLoginPath(role)}`,
    });

    await this.auditWrite(
      authUser,
      'UPDATE',
      'User',
      id,
      `Resent invitation email to ${user.email}`,
      undefined,
      ctx,
    );

    return {
      message: emailResult.sent
        ? 'Invitation email sent'
        : 'Invitation not sent — check SMTP settings',
      email: user.email,
      emailSent: emailResult.sent,
    };
  }

  async deleteUser(
    authUser: AuthenticatedUser,
    id: number,
    ctx?: { ipAddress?: string | null; userAgent?: string | null },
  ) {
    if (authUser.id === id) throw new BadRequestError('Cannot delete yourself');
    await this.getUser(authUser, id);
    await this.prisma.user.update({
      where: { id: BigInt(id) },
      data: { deletedAt: new Date(), isActive: false },
    });
    await this.auditWrite(authUser, 'DELETE', 'User', id, `Deleted user ${id}`, undefined, ctx);
    return { message: 'User deleted' };
  }

  // ── Clients ──────────────────────────────────────────────────────────────

  async listClients(authUser: AuthenticatedUser, query: Record<string, unknown>) {
    return this.clients.list(authUser, {
      page: Number(query.page ?? 1),
      limit: Number(query.limit ?? 20),
      search: query.search as string | undefined,
      status: query.status as ClientStatus | undefined,
      sort: query.sort as string | undefined,
    });
  }

  async getClient(authUser: AuthenticatedUser, id: number) {
    return this.clients.getById(authUser, id);
  }

  async createClient(
    authUser: AuthenticatedUser,
    body: Record<string, unknown>,
    ctx?: { ipAddress?: string | null; userAgent?: string | null },
  ) {
    const mapped = {
      name: String(body.companyName ?? body.name ?? ''),
      website: body.website as string | undefined,
      industry: body.industry as string | undefined,
      companySize: body.companySize as string | undefined,
      headquarters: body.headquarters as string | undefined,
      contactName: (body.primaryContactName ?? body.contactName) as string | undefined,
      contactEmail: (body.primaryContactEmail ?? body.contactEmail) as string | undefined,
      contactPhone: (body.primaryContactPhone ?? body.contactPhone) as string | undefined,
      accountManagerId: body.accountManagerId as number | undefined,
      status: body.status as ClientStatus | undefined,
      paymentTerms: body.paymentTerms as string | undefined,
      notes: body.notes as string | undefined,
    };
    if (!mapped.name.trim()) throw new BadRequestError('Company name is required');
    if (!String(mapped.website ?? '').trim()) throw new BadRequestError('Website is required');
    if (!String(mapped.industry ?? '').trim()) throw new BadRequestError('Industry is required');
    if (!String(mapped.contactName ?? '').trim()) {
      throw new BadRequestError('Primary contact name is required');
    }
    if (!String(mapped.contactEmail ?? '').trim()) {
      throw new BadRequestError('Primary contact email is required');
    }
    if (!String(mapped.contactPhone ?? '').trim()) {
      throw new BadRequestError('Primary contact phone is required');
    }
    const created = await this.clients.create(authUser, {
      name: mapped.name.trim(),
      website: String(mapped.website ?? '').trim(),
      industry: String(mapped.industry ?? '').trim(),
      companySize: mapped.companySize,
      headquarters: mapped.headquarters,
      contactName: String(mapped.contactName ?? '').trim(),
      contactEmail: String(mapped.contactEmail ?? '').trim(),
      contactPhone: String(mapped.contactPhone ?? '').trim(),
      accountManagerId: mapped.accountManagerId,
      status: mapped.status,
      paymentTerms: mapped.paymentTerms,
      notes: mapped.notes,
    });
    await this.auditWrite(authUser, 'CREATE', 'Client', created.id, `Created client ${created.name}`, undefined, ctx);
    return created;
  }

  async updateClient(
    authUser: AuthenticatedUser,
    id: number,
    body: Record<string, unknown>,
    ctx?: { ipAddress?: string | null; userAgent?: string | null },
  ) {
    const mapped: Record<string, unknown> = { ...body };
    if (body.companyName !== undefined) mapped.name = body.companyName;
    if (body.primaryContactName !== undefined) mapped.contactName = body.primaryContactName;
    if (body.primaryContactEmail !== undefined) mapped.contactEmail = body.primaryContactEmail;
    if (body.primaryContactPhone !== undefined) mapped.contactPhone = body.primaryContactPhone;
    const updated = await this.clients.update(authUser, id, mapped as never);
    await this.auditWrite(authUser, 'UPDATE', 'Client', id, `Updated client ${id}`, undefined, ctx);
    return updated;
  }

  async setClientStatus(
    authUser: AuthenticatedUser,
    id: number,
    status: ClientStatus,
    ctx?: { ipAddress?: string | null; userAgent?: string | null },
  ) {
    const organizationId = requireOrganization(authUser);
    const existing = await this.prisma.client.findFirst({
      where: {
        id: BigInt(id),
        organizationId: BigInt(organizationId),
        deletedAt: null,
      },
      select: { status: true },
    });
    if (!existing) {
      throw new NotFoundError('Client not found');
    }

    const updated = await this.updateClient(authUser, id, { status }, ctx);
    if (status === 'ACTIVE') {
      await this.syncClientUsersOnClientActivation(organizationId, id);
      if (existing.status !== 'ACTIVE') {
        void this.sendClientActivationWelcomeEmails(organizationId, id);
      }
    }
    return updated;
  }

  async assignAccountManager(
    authUser: AuthenticatedUser,
    id: number,
    accountManagerId: number | null,
    ctx?: { ipAddress?: string | null; userAgent?: string | null },
  ) {
    await this.clients.update(authUser, id, {
      accountManagerId: accountManagerId ?? null,
    } as never);
    await this.auditWrite(
      authUser,
      'UPDATE',
      'Client',
      id,
      accountManagerId
        ? `Assigned account manager ${accountManagerId}`
        : 'Cleared account manager',
      { accountManagerId },
      ctx,
    );
    return this.getClient(authUser, id);
  }

  // ── Candidates ───────────────────────────────────────────────────────────

  async listCandidates(authUser: AuthenticatedUser, query: Record<string, unknown>) {
    const organizationId = requireOrganization(authUser);
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);
    const where: Prisma.CandidateWhereInput = {
      organizationId: BigInt(organizationId),
      deletedAt: null,
    };

    if (query.pendingOnly === true || query.pendingOnly === 'true') {
      where.approvalStatus = 'PENDING';
    }
    if (query.communityId) where.primarySkillCommunityId = BigInt(Number(query.communityId));
    if (query.minExperience || query.maxExperience) {
      where.yearsExperience = {};
      if (query.minExperience) where.yearsExperience.gte = Number(query.minExperience);
      if (query.maxExperience) where.yearsExperience.lte = Number(query.maxExperience);
    }
    if (query.minRate || query.maxRate) {
      where.clientBillRate = {};
      if (query.minRate) where.clientBillRate.gte = Number(query.minRate);
      if (query.maxRate) where.clientBillRate.lte = Number(query.maxRate);
    }
    if (query.availabilityStatus) {
      where.availabilityStatus = query.availabilityStatus as never;
    }
    if (query.minScore || query.maxScore) {
      where.bestalScore = {};
      if (query.minScore) where.bestalScore.gte = Number(query.minScore);
      if (query.maxScore) where.bestalScore.lte = Number(query.maxScore);
    }
    if (query.evaluationStatus) where.evaluationStatus = String(query.evaluationStatus);
    if (query.bgvStatus) where.bgvStatus = String(query.bgvStatus);
    if (query.profileStatus) where.profileStatus = query.profileStatus as never;
    if (query.archived === true || query.archived === 'true') {
      where.profileStatus = 'INACTIVE';
      where.status = 'INACTIVE';
    } else if (query.archived === false || query.archived === 'false') {
      where.NOT = { profileStatus: 'INACTIVE' };
    }
    if (query.visibilityStatus) where.visibility = query.visibilityStatus as never;
    if (query.search) {
      const q = String(query.search);
      where.OR = [
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { primaryRole: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.candidate.count({ where }),
      this.prisma.candidate.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          primarySkillCommunity: { select: { id: true, name: true } },
          skills: {
            take: 5,
            include: { skillCommunity: { select: { name: true } } },
          },
        },
      }),
    ]);

    return {
      data: items.map((c) => ({
        id: bigintToNumber(c.id),
        name: `${c.firstName} ${c.lastName}`,
        email: c.email,
        role: c.primaryRole,
        community: c.primarySkillCommunity?.name ?? null,
        communityId: c.primarySkillCommunityId
          ? bigintToNumber(c.primarySkillCommunityId)
          : null,
        yearsExperience: c.yearsExperience,
        clientBillRate: c.clientBillRate ? Number(c.clientBillRate) : null,
        availabilityStatus: c.availabilityStatus,
        bestalScore: c.bestalScore,
        evaluationStatus: c.evaluationStatus,
        bgvStatus: c.bgvStatus,
        profileStatus: c.profileStatus,
        visibilityStatus: c.visibility,
        approvalStatus: c.approvalStatus,
        submittedForApprovalAt: c.submittedForApprovalAt?.toISOString() ?? null,
        topSkills: c.skills.map((s) => s.skillCommunity?.name ?? s.skillName ?? 'Skill'),
        updatedAt: c.updatedAt.toISOString(),
      })),
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  async listPendingCandidates(authUser: AuthenticatedUser, query: Record<string, unknown>) {
    return this.listCandidates(authUser, { ...query, pendingOnly: true });
  }

  async getCandidateDetail(authUser: AuthenticatedUser, id: number) {
    const organizationId = requireOrganization(authUser);
    const candidate = await this.prisma.candidate.findFirst({
      where: { id: BigInt(id), organizationId: BigInt(organizationId), deletedAt: null },
      include: {
        primarySkillCommunity: true,
        skills: { include: { skillCommunity: true } },
        evaluations: { orderBy: { createdAt: 'desc' }, take: 20 },
        backgroundChecks: { orderBy: { createdAt: 'desc' }, take: 20 },
        createdBy: { select: { firstName: true, lastName: true, email: true } },
        approvedBy: { select: { firstName: true, lastName: true } },
        rejectedBy: { select: { firstName: true, lastName: true } },
      },
    });
    if (!candidate) throw new NotFoundError('Candidate not found');

    const documents = await this.prisma.document.findMany({
      where: {
        organizationId: BigInt(organizationId),
        entityType: 'CANDIDATE',
        entityId: BigInt(id),
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const activity = await this.prisma.auditLog.findMany({
      where: {
        organizationId: BigInt(organizationId),
        resourceType: 'Candidate',
        resourceId: BigInt(id),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { actor: { select: { firstName: true, lastName: true, email: true } } },
    });

    return {
      candidate: {
        id: bigintToNumber(candidate.id),
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        email: candidate.email,
        phone: candidate.phone,
        primaryRole: candidate.primaryRole,
        summary: candidate.summary,
        aiSummary: candidate.aiSummary,
        yearsExperience: candidate.yearsExperience,
        location: candidate.location,
        clientBillRate: candidate.clientBillRate ? Number(candidate.clientBillRate) : null,
        candidatePayRate: candidate.candidatePayRate ? Number(candidate.candidatePayRate) : null,
        grossMargin: candidate.grossMargin ? Number(candidate.grossMargin) : null,
        expectedRate: candidate.expectedRate ? Number(candidate.expectedRate) : null,
        availabilityStatus: candidate.availabilityStatus,
        bestalScore: candidate.bestalScore,
        evaluationStatus: candidate.evaluationStatus,
        bgvStatus: candidate.bgvStatus,
        profileStatus: candidate.profileStatus,
        visibilityStatus: candidate.visibility,
        approvalStatus: candidate.approvalStatus,
        strengths: candidate.strengths,
        weaknesses: candidate.weaknesses,
        riskFlags: candidate.riskFlags,
        education: candidate.education,
        currentCompany: candidate.currentCompany,
        community: candidate.primarySkillCommunity?.name ?? null,
        notes: null as string | null,
      },
      skills: candidate.skills.map((s) => ({
        id: bigintToNumber(s.id),
        name: s.skillCommunity?.name ?? s.skillName ?? 'Skill',
        proficiencyLevel: s.proficiencyLevel,
        isPrimary: s.isPrimary,
      })),
      evaluations: candidate.evaluations.map((e) => ({
        id: bigintToNumber(e.id),
        evaluatorName: e.evaluatorName,
        technicalScore: e.technicalScore,
        communicationScore: e.communicationScore,
        recommendation: e.recommendation,
        createdAt: e.createdAt.toISOString(),
      })),
      backgroundChecks: candidate.backgroundChecks.map((b) => ({
        id: bigintToNumber(b.id),
        status: b.status,
        type: b.type,
        createdAt: b.createdAt.toISOString(),
      })),
      documents: await Promise.all(
        documents.map(async (d) => ({
          id: bigintToNumber(d.id),
          originalName: d.originalName,
          kind: d.kind,
          mimeType: d.mimeType,
          createdAt: d.createdAt.toISOString(),
          downloadUrl:
            (await this.storageService.resolveFileUrl(d.s3Key, d.s3Bucket, d.mimeType)) ?? null,
        })),
      ),
      activityTimeline: activity.map((a) => ({
        id: bigintToNumber(a.id),
        action: a.action,
        description: a.description,
        actorName: a.actor ? `${a.actor.firstName} ${a.actor.lastName}` : null,
        createdAt: a.createdAt.toISOString(),
      })),
    };
  }

  async approveCandidate(
    authUser: AuthenticatedUser,
    id: number,
    mode: 'internal' | 'publish' = 'internal',
    ctx?: { ipAddress?: string | null; userAgent?: string | null },
  ) {
    const organizationId = requireOrganization(authUser);
    const result =
      mode === 'internal'
        ? await this.candidates.approveInternal(authUser, id)
        : await this.candidates.approveAndPublish(authUser, id);
    await this.auditWrite(authUser, 'APPROVE', 'Candidate', id, `Approved candidate ${id} (${mode})`, { mode }, ctx);
    void notifyCandidateApproved(this.prisma, this.fastify.config, {
      organizationId,
      candidateId: id,
      candidateName: `${result.firstName} ${result.lastName}`.trim(),
      approvedById: authUser.id,
      createdById: result.createdById,
    });
    return result;
  }

  async rejectCandidate(
    authUser: AuthenticatedUser,
    id: number,
    reason: string,
    ctx?: { ipAddress?: string | null; userAgent?: string | null },
  ) {
    const organizationId = requireOrganization(authUser);
    const rejected = await this.candidates.reject(authUser, id, { reason });
    await this.auditWrite(authUser, 'REJECT', 'Candidate', id, reason, { reason }, ctx);
    await this.notifyStaff(
      organizationId,
      authUser.id,
      'Candidate rejected',
      `Candidate #${id} was rejected.`,
      `/super-admin/candidates/${id}`,
    );
    return rejected;
  }

  async hideCandidate(authUser: AuthenticatedUser, id: number, ctx?: { ipAddress?: string | null; userAgent?: string | null }) {
    const result = await this.candidates.hide(authUser, id);
    await this.auditWrite(authUser, 'UPDATE', 'Candidate', id, 'Hidden candidate', undefined, ctx);
    return result;
  }

  async publishCandidate(authUser: AuthenticatedUser, id: number, ctx?: { ipAddress?: string | null; userAgent?: string | null }) {
    const result = await this.candidates.publish(authUser, id);
    await this.auditWrite(authUser, 'UPDATE', 'Candidate', id, 'Published candidate', undefined, ctx);
    return result;
  }

  async archiveCandidate(authUser: AuthenticatedUser, id: number, ctx?: { ipAddress?: string | null; userAgent?: string | null }) {
    const organizationId = requireOrganization(authUser);
    await this.prisma.candidate.updateMany({
      where: { id: BigInt(id), organizationId: BigInt(organizationId), deletedAt: null },
      data: { status: 'INACTIVE', visibility: 'HIDDEN', profileStatus: 'INACTIVE' },
    });
    await this.auditWrite(authUser, 'UPDATE', 'Candidate', id, 'Archived candidate', undefined, ctx);
    return this.getCandidateDetail(authUser, id);
  }

  async unarchiveCandidate(authUser: AuthenticatedUser, id: number, ctx?: { ipAddress?: string | null; userAgent?: string | null }) {
    const organizationId = requireOrganization(authUser);
    const existing = await this.prisma.candidate.findFirst({
      where: { id: BigInt(id), organizationId: BigInt(organizationId), deletedAt: null },
      select: { profileStatus: true },
    });
    if (!existing) {
      throw new NotFoundError('Candidate not found');
    }
    if (existing.profileStatus !== 'INACTIVE') {
      throw new BadRequestError('Candidate is not archived');
    }
    await this.prisma.candidate.updateMany({
      where: { id: BigInt(id), organizationId: BigInt(organizationId), deletedAt: null },
      data: {
        status: 'ACTIVE',
        visibility: 'INTERNAL_ONLY',
        profileStatus: 'RECRUITER_SCREENED',
      },
    });
    await this.auditWrite(authUser, 'UPDATE', 'Candidate', id, 'Unarchived candidate', undefined, ctx);
    return this.getCandidateDetail(authUser, id);
  }

  async updateCandidatePricing(
    authUser: AuthenticatedUser,
    id: number,
    body: { clientBillRate?: number; candidatePayRate?: number },
    ctx?: { ipAddress?: string | null; userAgent?: string | null },
  ) {
    const organizationId = requireOrganization(authUser);
    const bill = body.clientBillRate;
    const pay = body.candidatePayRate;
    const margin =
      bill != null && pay != null ? bill - pay : undefined;
    await this.prisma.candidate.updateMany({
      where: { id: BigInt(id), organizationId: BigInt(organizationId), deletedAt: null },
      data: {
        ...(bill !== undefined ? { clientBillRate: bill } : {}),
        ...(pay !== undefined ? { candidatePayRate: pay } : {}),
        ...(margin !== undefined ? { grossMargin: margin } : {}),
      },
    });
    await this.auditWrite(authUser, 'UPDATE', 'Candidate', id, 'Updated pricing', body, ctx);
    return this.getCandidateDetail(authUser, id);
  }

  async sendBackToRecruiter(
    authUser: AuthenticatedUser,
    id: number,
    reason?: string,
    ctx?: { ipAddress?: string | null; userAgent?: string | null },
  ) {
    const organizationId = requireOrganization(authUser);
    const existing = await this.prisma.candidate.findFirst({
      where: { id: BigInt(id), organizationId: BigInt(organizationId), deletedAt: null },
      select: {
        firstName: true,
        lastName: true,
        createdById: true,
      },
    });
    if (!existing) {
      throw new NotFoundError('Candidate not found');
    }

    await this.prisma.candidate.updateMany({
      where: { id: BigInt(id), organizationId: BigInt(organizationId), deletedAt: null },
      data: {
        approvalStatus: 'PENDING',
        submittedForApprovalAt: null,
        profileStatus: 'RECRUITER_SCREENED',
        rejectionReason: reason ?? null,
      },
    });
    await this.auditWrite(
      authUser,
      'UPDATE',
      'Candidate',
      id,
      reason ?? 'Sent back to recruiter',
      { reason },
      ctx,
    );

    const candidateName = [existing.firstName, existing.lastName].filter(Boolean).join(' ').trim();
    await notifyCandidateSentBack(this.prisma, this.fastify.config, {
      organizationId,
      candidateId: id,
      candidateName: candidateName || `Candidate #${id}`,
      createdById: existing.createdById ? bigintToNumber(existing.createdById) : null,
      reason: reason ?? null,
    });

    return this.getCandidateDetail(authUser, id);
  }

  private async notifyStaff(
    organizationId: number,
    triggeredByUserId: number,
    title: string,
    body: string,
    actionPath: string,
  ) {
    const { notifyOrgRoles } = await import('../../services/notification-dispatch.service.js');
    await notifyOrgRoles(this.prisma, this.fastify.config, {
      organizationId,
      roles: ['SUPER_ADMIN', 'ADMIN', 'RECRUITER'],
      includeUserIds: [triggeredByUserId],
      type: 'SYSTEM',
      title,
      body,
      actionUrl: `${this.fastify.config.webAppUrl.replace(/\/$/, '')}${actionPath}`,
      sendEmail: true,
    });
  }

  // ── Skill communities ────────────────────────────────────────────────────

  private skillCommunityIconInclude = {
    icon: { select: { id: true, name: true, url: true } },
  } as const;

  private mapSkillCommunityRow(
    s: {
      id: bigint;
      name: string;
      slug: string;
      description: string | null;
      iconId: bigint | null;
      iconUrl: string | null;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
      icon?: { id: bigint; name: string; url: string } | null;
    },
    candidateCount?: number,
  ) {
    return {
      id: bigintToNumber(s.id),
      name: s.name,
      slug: s.slug,
      description: s.description,
      iconId: s.iconId ? bigintToNumber(s.iconId) : null,
      iconUrl: s.icon?.url ?? s.iconUrl,
      iconName: s.icon?.name ?? null,
      isActive: s.isActive,
      candidateCount,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    };
  }

  private async resolveSkillCommunityIcon(iconId?: number | null) {
    if (iconId == null) {
      return { iconId: null as bigint | null, iconUrl: null as string | null };
    }
    const icon = await this.prisma.icon.findFirst({
      where: { id: BigInt(iconId), deletedAt: null, isActive: true },
    });
    if (!icon) {
      throw new BadRequestError('Selected icon not found or inactive');
    }
    return { iconId: icon.id, iconUrl: icon.url };
  }

  async listSkillCommunities(query: { page?: number | string; limit?: number | string; search?: string }) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 50);
    const where: Prisma.SkillCommunityWhereInput = {
      deletedAt: null,
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' as const } },
              { slug: { contains: query.search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };
    const [total, items] = await Promise.all([
      this.prisma.skillCommunity.count({ where }),
      this.prisma.skillCommunity.findMany({
        where,
        include: this.skillCommunityIconInclude,
        orderBy: { name: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    const counts = await Promise.all(
      items.map((item) =>
        this.prisma.candidate.count({
          where: {
            primarySkillCommunityId: item.id,
            deletedAt: null,
            status: { not: 'INACTIVE' },
          },
        }),
      ),
    );
    return {
      data: items.map((s, index) => this.mapSkillCommunityRow(s, counts[index])),
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  async createSkillCommunity(
    authUser: AuthenticatedUser,
    input: {
      name: string;
      slug: string;
      description?: string;
      isActive?: boolean;
      iconId?: number | null;
    },
    ctx?: { ipAddress?: string | null; userAgent?: string | null },
  ) {
    const iconLink = await this.resolveSkillCommunityIcon(input.iconId);
    const created = await this.prisma.skillCommunity.create({
      data: {
        name: input.name.trim(),
        slug: input.slug.trim().toLowerCase(),
        description: input.description ?? null,
        isActive: input.isActive ?? true,
        iconId: iconLink.iconId,
        iconUrl: iconLink.iconUrl,
      },
      include: this.skillCommunityIconInclude,
    });
    await this.auditWrite(
      authUser,
      'CREATE',
      'SkillCommunity',
      bigintToNumber(created.id),
      `Created skill community ${created.name}`,
      undefined,
      ctx,
    );
    return this.mapSkillCommunityRow(created);
  }

  async uploadSkillCommunityIcon(
    authUser: AuthenticatedUser,
    id: number,
    file: { filename: string; mimetype: string; buffer: Buffer },
    ctx?: { ipAddress?: string | null; userAgent?: string | null },
  ) {
    const organizationId = requireOrganization(authUser);
    const existing = await this.prisma.skillCommunity.findFirst({
      where: { id: BigInt(id), deletedAt: null },
    });
    if (!existing) throw new NotFoundError('Skill community not found');

    this.storageService.validateFile(UPLOAD_CATEGORIES.CANDIDATE_PHOTO, {
      mimeType: file.mimetype,
      size: file.buffer.length,
      originalName: file.filename,
    });

    const bucket = await this.storageService.getBucket();
    const storageKey = this.storageService.buildStorageKey({
      organizationId,
      entityFolder: 'skill-communities',
      entityId: id,
      category: UPLOAD_CATEGORIES.CANDIDATE_PHOTO,
      originalName: file.filename,
    });

    await this.storageService.upload(
      storageKey,
      {
        buffer: file.buffer,
        mimeType: file.mimetype,
        size: file.buffer.length,
        originalName: file.filename,
      },
      {
        category: UPLOAD_CATEGORIES.CANDIDATE_PHOTO,
        organizationId,
        entityId: id,
      },
    );

    const iconUrl =
      (await this.storageService.resolveFileUrl(storageKey, bucket, file.mimetype)) ??
      buildS3ObjectReference(bucket, storageKey);

    const updated = await this.prisma.skillCommunity.update({
      where: { id: BigInt(id) },
      data: { iconUrl, iconId: null },
    });

    await this.auditWrite(
      authUser,
      'UPDATE',
      'SkillCommunity',
      id,
      `Uploaded icon for ${updated.name}`,
      undefined,
      ctx,
    );

    return {
      id: bigintToNumber(updated.id),
      iconUrl: updated.iconUrl,
    };
  }

  async updateSkillCommunity(
    authUser: AuthenticatedUser,
    id: number,
    input: {
      name?: string;
      slug?: string;
      description?: string | null;
      isActive?: boolean;
      iconId?: number | null;
    },
    ctx?: { ipAddress?: string | null; userAgent?: string | null },
  ) {
    const existing = await this.prisma.skillCommunity.findFirst({
      where: { id: BigInt(id), deletedAt: null },
    });
    if (!existing) throw new NotFoundError('Skill community not found');

    let iconPatch: { iconId?: bigint | null; iconUrl?: string | null } = {};
    if (input.iconId !== undefined) {
      iconPatch = await this.resolveSkillCommunityIcon(input.iconId);
    }

    const updated = await this.prisma.skillCommunity.update({
      where: { id: BigInt(id) },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.slug !== undefined ? { slug: input.slug.toLowerCase() } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
        ...(input.iconId !== undefined
          ? { iconId: iconPatch.iconId, iconUrl: iconPatch.iconUrl }
          : {}),
      },
      include: this.skillCommunityIconInclude,
    });
    await this.auditWrite(authUser, 'UPDATE', 'SkillCommunity', id, `Updated ${updated.name}`, undefined, ctx);
    return this.mapSkillCommunityRow(updated);
  }

  async setSkillCommunityStatus(
    authUser: AuthenticatedUser,
    id: number,
    isActive: boolean,
    ctx?: { ipAddress?: string | null; userAgent?: string | null },
  ) {
    return this.updateSkillCommunity(authUser, id, { isActive }, ctx);
  }

  async deleteSkillCommunity(
    authUser: AuthenticatedUser,
    id: number,
    ctx?: { ipAddress?: string | null; userAgent?: string | null },
  ) {
    const activeCandidates = await this.prisma.candidate.count({
      where: {
        primarySkillCommunityId: BigInt(id),
        deletedAt: null,
        status: { not: 'INACTIVE' },
      },
    });
    if (activeCandidates > 0) {
      throw new BadRequestError('Cannot delete community with active candidates');
    }
    await this.prisma.skillCommunity.update({
      where: { id: BigInt(id) },
      data: { deletedAt: new Date(), isActive: false },
    });
    await this.auditWrite(authUser, 'DELETE', 'SkillCommunity', id, 'Deleted skill community', undefined, ctx);
    return { message: 'Skill community deleted' };
  }

  // ── Icons ────────────────────────────────────────────────────────────────

  private mapIconRow(
    icon: {
      id: bigint;
      name: string;
      url: string;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
    },
    usageCount?: number,
  ) {
    return {
      id: bigintToNumber(icon.id),
      name: icon.name,
      url: icon.url,
      isActive: icon.isActive,
      usageCount: usageCount ?? 0,
      createdAt: icon.createdAt.toISOString(),
      updatedAt: icon.updatedAt.toISOString(),
    };
  }

  async listIcons(query: { page?: number | string; limit?: number | string; search?: string }) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 50);
    const where: Prisma.IconWhereInput = {
      deletedAt: null,
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' as const } },
              { url: { contains: query.search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };
    const [total, items] = await Promise.all([
      this.prisma.icon.count({ where }),
      this.prisma.icon.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    const usageCounts = await Promise.all(
      items.map((icon) =>
        this.prisma.skillCommunity.count({
          where: { iconId: icon.id, deletedAt: null },
        }),
      ),
    );
    return {
      data: items.map((icon, index) => this.mapIconRow(icon, usageCounts[index])),
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  async getIcon(id: number) {
    const icon = await this.prisma.icon.findFirst({
      where: { id: BigInt(id), deletedAt: null },
    });
    if (!icon) throw new NotFoundError('Icon not found');
    const usageCount = await this.prisma.skillCommunity.count({
      where: { iconId: icon.id, deletedAt: null },
    });
    return this.mapIconRow(icon, usageCount);
  }

  async createIcon(
    authUser: AuthenticatedUser,
    input: { name: string; file: { filename: string; mimetype: string; buffer: Buffer } },
    ctx?: { ipAddress?: string | null; userAgent?: string | null },
  ) {
    const name = input.name.trim();
    if (!name) throw new BadRequestError('Icon name is required');

    const organizationId = requireOrganization(authUser);
    const created = await this.prisma.icon.create({
      data: { name, url: 'pending', isActive: true },
    });
    const iconId = bigintToNumber(created.id);

    try {
      const url = await this.storeIconFile(organizationId, iconId, input.file);
      const updated = await this.prisma.icon.update({
        where: { id: created.id },
        data: { url },
      });
      await this.auditWrite(
        authUser,
        'CREATE',
        'Icon',
        iconId,
        `Created icon ${updated.name}`,
        undefined,
        ctx,
      );
      return this.mapIconRow(updated, 0);
    } catch (error) {
      await this.prisma.icon.delete({ where: { id: created.id } }).catch(() => undefined);
      throw error;
    }
  }

  async uploadIconFile(
    authUser: AuthenticatedUser,
    id: number,
    file: { filename: string; mimetype: string; buffer: Buffer },
    ctx?: { ipAddress?: string | null; userAgent?: string | null },
  ) {
    const existing = await this.prisma.icon.findFirst({
      where: { id: BigInt(id), deletedAt: null },
    });
    if (!existing) throw new NotFoundError('Icon not found');

    const organizationId = requireOrganization(authUser);
    const url = await this.storeIconFile(organizationId, id, file);
    const updated = await this.prisma.icon.update({
      where: { id: BigInt(id) },
      data: { url },
    });

    await this.syncIconUrlToCommunities(id, url);

    const usageCount = await this.prisma.skillCommunity.count({
      where: { iconId: updated.id, deletedAt: null },
    });

    await this.auditWrite(
      authUser,
      'UPDATE',
      'Icon',
      id,
      `Uploaded icon image for ${updated.name}`,
      undefined,
      ctx,
    );
    return this.mapIconRow(updated, usageCount);
  }

  private async storeIconFile(
    organizationId: number,
    iconId: number,
    file: { filename: string; mimetype: string; buffer: Buffer },
  ): Promise<string> {
    this.storageService.validateFile(UPLOAD_CATEGORIES.CANDIDATE_PHOTO, {
      mimeType: file.mimetype,
      size: file.buffer.length,
      originalName: file.filename,
    });

    const bucket = await this.storageService.getBucket();
    const storageKey = this.storageService.buildStorageKey({
      organizationId,
      entityFolder: 'icons',
      entityId: iconId,
      category: UPLOAD_CATEGORIES.CANDIDATE_PHOTO,
      originalName: file.filename,
    });

    await this.storageService.upload(
      storageKey,
      {
        buffer: file.buffer,
        mimeType: file.mimetype,
        size: file.buffer.length,
        originalName: file.filename,
      },
      {
        category: UPLOAD_CATEGORIES.CANDIDATE_PHOTO,
        organizationId,
        entityId: iconId,
      },
    );

    return (
      (await this.storageService.resolveFileUrl(storageKey, bucket, file.mimetype)) ??
      buildS3ObjectReference(bucket, storageKey)
    );
  }

  private async syncIconUrlToCommunities(iconId: number, url: string): Promise<void> {
    await this.prisma.skillCommunity.updateMany({
      where: { iconId: BigInt(iconId), deletedAt: null },
      data: { iconUrl: url },
    });
  }

  async updateIcon(
    authUser: AuthenticatedUser,
    id: number,
    input: { name?: string; isActive?: boolean },
    ctx?: { ipAddress?: string | null; userAgent?: string | null },
  ) {
    const existing = await this.prisma.icon.findFirst({
      where: { id: BigInt(id), deletedAt: null },
    });
    if (!existing) throw new NotFoundError('Icon not found');

    const name = input.name !== undefined ? input.name.trim() : undefined;
    if (name !== undefined && !name) throw new BadRequestError('Icon name is required');

    const updated = await this.prisma.icon.update({
      where: { id: BigInt(id) },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      },
    });

    const usageCount = await this.prisma.skillCommunity.count({
      where: { iconId: updated.id, deletedAt: null },
    });

    await this.auditWrite(authUser, 'UPDATE', 'Icon', id, `Updated icon ${updated.name}`, undefined, ctx);
    return this.mapIconRow(updated, usageCount);
  }

  async deleteIcon(
    authUser: AuthenticatedUser,
    id: number,
    ctx?: { ipAddress?: string | null; userAgent?: string | null },
  ) {
    const usageCount = await this.prisma.skillCommunity.count({
      where: { iconId: BigInt(id), deletedAt: null },
    });
    if (usageCount > 0) {
      throw new BadRequestError(
        'Cannot delete this icon because it is assigned to one or more skill communities',
      );
    }
    const existing = await this.prisma.icon.findFirst({
      where: { id: BigInt(id), deletedAt: null },
    });
    if (!existing) throw new NotFoundError('Icon not found');

    await this.prisma.icon.update({
      where: { id: BigInt(id) },
      data: { deletedAt: new Date(), isActive: false },
    });
    await this.auditWrite(authUser, 'DELETE', 'Icon', id, `Deleted icon ${existing.name}`, undefined, ctx);
    return { message: 'Icon deleted' };
  }
}
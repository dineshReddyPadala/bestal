import argon2 from 'argon2';
import { randomBytes } from 'node:crypto';
import type { AuditAction, ClientStatus, Prisma, PrismaClient } from '@prisma/client';
import type { FastifyInstance } from 'fastify';
import type { Role } from '../../constants/index.js';
import type { AuthenticatedUser } from '../../types/index.js';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  bigintToNumber,
  requireOrganization,
} from '../../utils/index.js';
import { EmailService } from '../../services/email.service.js';
import { buildPaginationMeta } from '../../validators/common.validator.js';
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

  constructor(private readonly fastify: FastifyInstance) {
    this.prisma = fastify.prisma;
    this.audit = new AuditService(fastify.prisma);
    this.users = new UserRepository(fastify.prisma);
    this.email = new EmailService(fastify.config);
    this.candidates = new CandidateService(fastify);
    this.clients = new ClientService(fastify);
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
        memberships: { some: { organizationId: BigInt(organizationId), isActive: true } },
      },
      include: {
        memberships: {
          where: { isActive: true },
          include: {
            organization: { select: { id: true, name: true } },
            client: { select: { id: true, name: true } },
          },
        },
      },
    });
    if (!user) throw new NotFoundError('User not found');
    const org = user.memberships[0]?.organization;
    return mapUserToDto(user, organizationId, org?.name ?? '', false);
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

    const portalPath =
      input.role === 'VIEWER' || input.role === 'ADMIN'
        ? '/admin/login'
        : `/${input.role.toLowerCase()}/login`;
    const emailResult = await this.email.sendInviteCredentials({
      to: input.email.toLowerCase(),
      firstName: input.firstName,
      lastName: input.lastName,
      role: input.role as Role,
      organizationName: organization.name,
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
    if (input.role || input.clientId !== undefined) {
      if (input.role && !ADMIN_INVITE_ROLES.includes(input.role)) {
        throw new BadRequestError(
          'Role must be ADMIN, RECRUITER, SALES, VIEWER, or CLIENT',
        );
      }
      const linkedClientId = await this.assertAdminClientLink(
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
    const temporaryPassword = tempPassword();
    await this.prisma.user.update({
      where: { id: BigInt(id) },
      data: { passwordHash: await argon2.hash(temporaryPassword) },
    });
    const organization = await this.users.findOrganizationById(requireOrganization(authUser));
    await this.email.sendInviteCredentials({
      to: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: (user.role ?? 'VIEWER') as Role,
      organizationName: organization?.name ?? 'BesTal',
      temporaryPassword,
      portalLoginUrl: `${this.fastify.config.webAppUrl}/admin/login`,
    });
    await this.auditWrite(authUser, 'UPDATE', 'User', id, `Reset password for ${user.email}`, undefined, ctx);
    return { message: 'Password reset and emailed', email: user.email };
  }

  async resendInvite(authUser: AuthenticatedUser, id: number) {
    return this.resetUserPassword(authUser, id);
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
    const created = await this.clients.create(authUser, mapped);
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
    return this.updateClient(authUser, id, { status }, ctx);
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
      documents: documents.map((d) => ({
        id: bigintToNumber(d.id),
        originalName: d.originalName,
        kind: d.kind,
        mimeType: d.mimeType,
        createdAt: d.createdAt.toISOString(),
      })),
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
    mode: 'publish' | 'internal' = 'publish',
    ctx?: { ipAddress?: string | null; userAgent?: string | null },
  ) {
    const organizationId = requireOrganization(authUser);
    const approved = await this.candidates.approve(authUser, id);
    if (mode === 'publish') {
      try {
        await this.candidates.publish(authUser, id);
      } catch {
        // publish may fail gates — approval still stands
      }
    }
    await this.auditWrite(authUser, 'APPROVE', 'Candidate', id, `Approved candidate ${id} (${mode})`, { mode }, ctx);
    await this.notifyStaff(
      organizationId,
      authUser.id,
      'Candidate approved',
      `Candidate #${id} was approved (${mode}).`,
      `/super-admin/candidates/${id}`,
    );
    return approved;
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
        orderBy: { name: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    return {
      data: items.map((s) => ({
        id: bigintToNumber(s.id),
        name: s.name,
        slug: s.slug,
        description: s.description,
        isActive: s.isActive,
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString(),
      })),
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  async createSkillCommunity(
    authUser: AuthenticatedUser,
    input: { name: string; slug: string; description?: string; isActive?: boolean },
    ctx?: { ipAddress?: string | null; userAgent?: string | null },
  ) {
    const created = await this.prisma.skillCommunity.create({
      data: {
        name: input.name.trim(),
        slug: input.slug.trim().toLowerCase(),
        description: input.description ?? null,
        isActive: input.isActive ?? true,
      },
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
    return {
      id: bigintToNumber(created.id),
      name: created.name,
      slug: created.slug,
      description: created.description,
      isActive: created.isActive,
    };
  }

  async updateSkillCommunity(
    authUser: AuthenticatedUser,
    id: number,
    input: { name?: string; slug?: string; description?: string | null; isActive?: boolean },
    ctx?: { ipAddress?: string | null; userAgent?: string | null },
  ) {
    const existing = await this.prisma.skillCommunity.findFirst({
      where: { id: BigInt(id), deletedAt: null },
    });
    if (!existing) throw new NotFoundError('Skill community not found');
    const updated = await this.prisma.skillCommunity.update({
      where: { id: BigInt(id) },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.slug !== undefined ? { slug: input.slug.toLowerCase() } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      },
    });
    await this.auditWrite(authUser, 'UPDATE', 'SkillCommunity', id, `Updated ${updated.name}`, undefined, ctx);
    return {
      id: bigintToNumber(updated.id),
      name: updated.name,
      slug: updated.slug,
      description: updated.description,
      isActive: updated.isActive,
    };
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
}
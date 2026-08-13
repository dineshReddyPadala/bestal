import type { Prisma, PrismaClient } from '@prisma/client';
import type { FastifyInstance } from 'fastify';
import type { AuthenticatedUser } from '../../types/index.js';
import {
  BadRequestError,
  NotFoundError,
  bigintToNumber,
  requireOrganization,
} from '../../utils/index.js';
import { buildPaginationMeta } from '../../validators/common.validator.js';
import { DeploymentService } from '../deployments/deployment.service.js';
import { TrialService } from '../trials/trial.service.js';
import { AuditService } from './audit.service.js';
import {
  maskWorkflowsSettingsForAdmin,
  mergeWorkflowsSettingsUpdate,
  maskEmailSettingsForAdmin,
  mergeEmailSettingsUpdate,
  maskIntegrationsSettingsForAdmin,
  mergeIntegrationsSettingsUpdate,
  maskStorageSettingsForAdmin,
  mergeStorageSettingsUpdate,
} from '../../services/system-settings.reader.js';
import {
  deleteCommunicationTemplate,
  listCommunicationTemplates,
  upsertCommunicationTemplate,
} from '../../services/communication-template.service.js';

const SETTING_KEYS = [
  'oorwin',
  'email',
  'security',
  'scoring',
  'prompts',
  'pricing',
  'trials',
  'notifications',
  'integrations',
  'commercials',
  'workflows',
  'localization',
  'storage',
] as const;
export type SettingKey = (typeof SETTING_KEYS)[number];

export class AdminOpsService {
  private readonly prisma: PrismaClient;
  private readonly audit: AuditService;
  private readonly trials: TrialService;
  private readonly deployments: DeploymentService;

  constructor(fastify: FastifyInstance) {
    this.prisma = fastify.prisma;
    this.audit = new AuditService(fastify.prisma);
    this.trials = new TrialService(fastify);
    this.deployments = new DeploymentService(fastify);
  }

  private async auditWrite(
    authUser: AuthenticatedUser,
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT' | 'ASSIGN' | 'EXPORT',
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

  // ── Trials ───────────────────────────────────────────────────────────────

  async listTrials(authUser: AuthenticatedUser, query: Record<string, unknown>) {
    const organizationId = requireOrganization(authUser);
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);
    const search = typeof query.search === 'string' ? query.search.trim() : '';
    const where: Prisma.TrialRequestWhereInput = {
      organizationId: BigInt(organizationId),
      deletedAt: null,
      ...(query.status ? { status: query.status as never } : {}),
      ...(query.clientId ? { clientId: BigInt(Number(query.clientId)) } : {}),
      ...(query.candidateId ? { candidateId: BigInt(Number(query.candidateId)) } : {}),
      ...(search
        ? {
            OR: [
              { roleTitle: { contains: search, mode: 'insensitive' } },
              { client: { name: { contains: search, mode: 'insensitive' } } },
              { candidate: { firstName: { contains: search, mode: 'insensitive' } } },
              { candidate: { lastName: { contains: search, mode: 'insensitive' } } },
              { candidate: { email: { contains: search, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };
    const [total, items] = await Promise.all([
      this.prisma.trialRequest.count({ where }),
      this.prisma.trialRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          candidate: { select: { firstName: true, lastName: true } },
          client: { select: { name: true } },
          requestedBy: { select: { firstName: true, lastName: true } },
        },
      }),
    ]);
    return {
      data: items.map((t) => ({
        id: bigintToNumber(t.id),
        clientName: t.client.name,
        candidateName: `${t.candidate.firstName} ${t.candidate.lastName}`,
        requestedByName: `${t.requestedBy.firstName} ${t.requestedBy.lastName}`,
        status: t.status,
        startDate: t.startDate?.toISOString().slice(0, 10) ?? null,
        createdAt: t.createdAt.toISOString(),
        convertedToPaid: t.convertedToPaid,
      })),
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  async getTrial(authUser: AuthenticatedUser, id: number) {
    return this.trials.getById(authUser, id);
  }

  async approveTrial(
    authUser: AuthenticatedUser,
    id: number,
    recruiterId?: number,
    ctx?: { ipAddress?: string | null; userAgent?: string | null },
  ) {
    const organizationId = requireOrganization(authUser);
    const approved = await this.trials.approve(authUser, id);
    if (recruiterId) {
      // Store recruiter assignment in notes/outcome if no dedicated field
      await this.prisma.trialRequest.updateMany({
        where: { id: BigInt(id), organizationId: BigInt(organizationId) },
        data: { outcome: `Assigned recruiter:${recruiterId}` },
      });
    }
    await this.auditWrite(authUser, 'APPROVE', 'TrialRequest', id, 'Approved trial', { recruiterId }, ctx);
    return approved;
  }

  async rejectTrial(
    authUser: AuthenticatedUser,
    id: number,
    reason: string,
    ctx?: { ipAddress?: string | null; userAgent?: string | null },
  ) {
    const rejected = await this.trials.reject(authUser, id, { reason });
    await this.auditWrite(authUser, 'REJECT', 'TrialRequest', id, reason, { reason }, ctx);
    return rejected;
  }

  async assignTrial(
    authUser: AuthenticatedUser,
    id: number,
    recruiterId: number,
    ctx?: { ipAddress?: string | null; userAgent?: string | null },
  ) {
    const organizationId = requireOrganization(authUser);
    await this.trials.getById(authUser, id);
    await this.prisma.trialRequest.updateMany({
      where: { id: BigInt(id), organizationId: BigInt(organizationId) },
      data: { assignedRecruiterId: BigInt(recruiterId) },
    });
    await this.auditWrite(authUser, 'ASSIGN', 'TrialRequest', id, `Assigned recruiter ${recruiterId}`, { recruiterId }, ctx);
    return this.trials.getById(authUser, id);
  }

  async convertTrial(
    authUser: AuthenticatedUser,
    id: number,
    createDeployment = true,
    ctx?: { ipAddress?: string | null; userAgent?: string | null },
  ) {
    const organizationId = requireOrganization(authUser);
    const trial = await this.trials.getById(authUser, id);

    const result = await this.prisma.$transaction(async (tx) => {
      await tx.trialRequest.update({
        where: { id: BigInt(id) },
        data: {
          status: 'COMPLETED',
          convertedToPaid: true,
          outcome: 'CONVERTED',
        },
      });

      let deploymentId: number | null = null;
      if (createDeployment) {
        const dep = await tx.deployment.create({
          data: {
            organizationId: BigInt(organizationId),
            candidateId: BigInt(trial.candidateId),
            clientId: BigInt(trial.clientId),
            createdById: BigInt(authUser.id),
            status: 'PENDING',
            placementType: 'CONTRACT',
            roleTitle: trial.roleTitle ?? 'Converted from trial',
            startDate: trial.startDate ? new Date(trial.startDate) : new Date(),
          },
        });
        deploymentId = bigintToNumber(dep.id);
        await tx.trialRequest.update({
          where: { id: BigInt(id) },
          data: { deploymentId: dep.id },
        });
      }
      return deploymentId;
    });

    await this.auditWrite(
      authUser,
      'UPDATE',
      'TrialRequest',
      id,
      'Converted trial to paid',
      { deploymentId: result },
      ctx,
    );
    return this.trials.getById(authUser, id);
  }

  // ── Deployments ──────────────────────────────────────────────────────────

  async listDeployments(authUser: AuthenticatedUser, query: Record<string, unknown>) {
    const organizationId = requireOrganization(authUser);
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);
    const search = typeof query.search === 'string' ? query.search.trim() : '';
    const where: Prisma.DeploymentWhereInput = {
      organizationId: BigInt(organizationId),
      deletedAt: null,
      ...(query.status ? { status: query.status as never } : {}),
      ...(query.clientId ? { clientId: BigInt(Number(query.clientId)) } : {}),
      ...(query.candidateId ? { candidateId: BigInt(Number(query.candidateId)) } : {}),
      ...(search
        ? {
            OR: [
              { roleTitle: { contains: search, mode: 'insensitive' } },
              { client: { name: { contains: search, mode: 'insensitive' } } },
              { candidate: { firstName: { contains: search, mode: 'insensitive' } } },
              { candidate: { lastName: { contains: search, mode: 'insensitive' } } },
              { candidate: { email: { contains: search, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };
    const [total, items] = await Promise.all([
      this.prisma.deployment.count({ where }),
      this.prisma.deployment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          candidate: { select: { firstName: true, lastName: true } },
          client: { select: { name: true } },
        },
      }),
    ]);
    return {
      data: items.map((d) => ({
        id: bigintToNumber(d.id),
        clientName: d.client.name,
        candidateName: `${d.candidate.firstName} ${d.candidate.lastName}`,
        startDate: d.startDate?.toISOString().slice(0, 10) ?? null,
        endDate: d.endDate?.toISOString().slice(0, 10) ?? null,
        billingRate: d.billingRate ? Number(d.billingRate) : null,
        candidatePayRate: d.candidatePayRate ? Number(d.candidatePayRate) : null,
        grossMarginPerHour: d.grossMarginPerHour ? Number(d.grossMarginPerHour) : null,
        status: d.status,
      })),
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  async getDeployment(authUser: AuthenticatedUser, id: number) {
    return this.deployments.getById(authUser, id);
  }

  async createDeployment(
    authUser: AuthenticatedUser,
    body: Record<string, unknown>,
    ctx?: { ipAddress?: string | null; userAgent?: string | null },
  ) {
    const bill = body.billingRate != null ? Number(body.billingRate) : undefined;
    const pay = body.candidatePayRate != null ? Number(body.candidatePayRate) : undefined;
    const created = await this.deployments.create(authUser, {
      candidateId: Number(body.candidateId),
      clientId: Number(body.clientId),
      roleTitle: body.roleTitle as string | undefined,
      placementType: (body.placementType as never) ?? 'CONTRACT',
      startDate: String(body.startDate ?? new Date().toISOString().slice(0, 10)),
      endDate: body.endDate as string | undefined,
      billingRate: bill,
      candidatePayRate: pay,
      grossMarginPerHour: bill != null && pay != null ? bill - pay : undefined,
      expectedHoursPerWeek: body.expectedHoursPerWeek as number | undefined,
      status: body.status as never,
    } as never);
    await this.auditWrite(authUser, 'CREATE', 'Deployment', created.id, 'Created deployment', undefined, ctx);
    return created;
  }

  async updateDeployment(
    authUser: AuthenticatedUser,
    id: number,
    body: Record<string, unknown>,
    ctx?: { ipAddress?: string | null; userAgent?: string | null },
  ) {
    const bill = body.billingRate != null ? Number(body.billingRate) : undefined;
    const pay = body.candidatePayRate != null ? Number(body.candidatePayRate) : undefined;
    const updated = await this.deployments.update(authUser, id, {
      ...body,
      ...(bill != null && pay != null ? { grossMarginPerHour: bill - pay } : {}),
    } as never);
    await this.auditWrite(authUser, 'UPDATE', 'Deployment', id, 'Updated deployment', undefined, ctx);
    return updated;
  }

  async pauseDeployment(authUser: AuthenticatedUser, id: number, ctx?: { ipAddress?: string | null; userAgent?: string | null }) {
    const organizationId = requireOrganization(authUser);
    await this.prisma.deployment.updateMany({
      where: { id: BigInt(id), organizationId: BigInt(organizationId), deletedAt: null },
      data: { status: 'ON_HOLD' },
    });
    await this.auditWrite(authUser, 'UPDATE', 'Deployment', id, 'Paused deployment', undefined, ctx);
    return this.deployments.getById(authUser, id);
  }

  async completeDeployment(authUser: AuthenticatedUser, id: number, ctx?: { ipAddress?: string | null; userAgent?: string | null }) {
    const organizationId = requireOrganization(authUser);
    await this.prisma.deployment.updateMany({
      where: { id: BigInt(id), organizationId: BigInt(organizationId), deletedAt: null },
      data: { status: 'COMPLETED', endDate: new Date() },
    });
    await this.auditWrite(authUser, 'UPDATE', 'Deployment', id, 'Completed deployment', undefined, ctx);
    return this.deployments.getById(authUser, id);
  }

  async terminateDeployment(
    authUser: AuthenticatedUser,
    id: number,
    reason: string,
    ctx?: { ipAddress?: string | null; userAgent?: string | null },
  ) {
    const result = await this.deployments.terminate(authUser, id, { reason });
    await this.auditWrite(authUser, 'UPDATE', 'Deployment', id, reason, { reason }, ctx);
    return result;
  }

  async extendDeployment(
    authUser: AuthenticatedUser,
    id: number,
    endDate: string,
    ctx?: { ipAddress?: string | null; userAgent?: string | null },
  ) {
    return this.updateDeployment(authUser, id, { endDate }, ctx);
  }

  // ── Oorwin ───────────────────────────────────────────────────────────────

  async importOorwinCsv(
    authUser: AuthenticatedUser,
    fileName: string,
    csvText: string,
    ctx?: { ipAddress?: string | null; userAgent?: string | null },
  ) {
    const organizationId = requireOrganization(authUser);
    const rows = parseCsv(csvText);

    const batch = await this.prisma.oorwinImportBatch.create({
      data: {
        organizationId: BigInt(organizationId),
        createdById: BigInt(authUser.id),
        fileName,
        status: 'PROCESSING',
      },
    });

    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    await this.prisma.$transaction(async (tx) => {
      for (let i = 0; i < rows.length; i += 1) {
        const row = rows[i]!;
        const email = (row.email ?? row.Email ?? '').trim().toLowerCase();
        const phone = (row.phone ?? row.Phone ?? '').trim() || null;
        const oorwinId = (row.oorwincandidateid ?? row.oorwin_id ?? row.oorwinid ?? '').trim() || null;
        const firstName = (row.firstname ?? row.first_name ?? row.first ?? 'Imported').trim();
        const lastName = (row.lastname ?? row.last_name ?? row.last ?? 'Candidate').trim();

        try {
          if (!email && !phone && !oorwinId) {
            skippedCount += 1;
            await tx.oorwinImportRow.create({
              data: {
                batchId: batch.id,
                rowNumber: i + 2,
                email,
                phone,
                oorwinId,
                action: 'skipped',
                errorMessage: 'Missing email, phone, and oorwin id',
                rawPayload: row,
              },
            });
            continue;
          }

          const existing = await tx.candidate.findFirst({
            where: {
              organizationId: BigInt(organizationId),
              deletedAt: null,
              OR: [
                ...(email ? [{ email }] : []),
                ...(phone ? [{ phone }] : []),
                ...(oorwinId ? [{ oorwinCandidateId: oorwinId }] : []),
              ],
            },
          });

          if (existing) {
            await tx.candidate.update({
              where: { id: existing.id },
              data: {
                firstName,
                lastName,
                ...(phone ? { phone } : {}),
                ...(oorwinId ? { oorwinCandidateId: oorwinId } : {}),
                ...(row.primaryrole || row.role || row.primary_role
                  ? { primaryRole: row.primaryrole ?? row.role ?? row.primary_role }
                  : {}),
                ...(row.headline || row.title ? { headline: row.headline ?? row.title } : {}),
                ...(row.location || row.city ? { location: row.location ?? row.city } : {}),
                ...(row.aisummary || row.ai_summary || row.summary
                  ? {
                      aiSummary: row.aisummary ?? row.ai_summary ?? row.summary,
                      summary: row.summary ?? row.aisummary ?? row.ai_summary,
                    }
                  : {}),
                ...(row.strengths ? { strengths: row.strengths } : {}),
                ...(row.weaknesses ? { weaknesses: row.weaknesses } : {}),
                ...(row.yearsexperience || row.years_experience
                  ? {
                      yearsExperience: Number(
                        row.yearsexperience ?? row.years_experience,
                      ),
                    }
                  : {}),
                ...(row.bestalscore || row.bestal_score
                  ? { bestalScore: Number(row.bestalscore ?? row.bestal_score) }
                  : {}),
                ...(row.clientbillrate || row.bill_rate || row.expected_rate
                  ? {
                      clientBillRate: Number(
                        row.clientbillrate ?? row.bill_rate ?? row.expected_rate,
                      ),
                    }
                  : {}),
                ...(row.candidatepayrate || row.pay_rate
                  ? {
                      candidatePayRate: Number(row.candidatepayrate ?? row.pay_rate),
                    }
                  : {}),
              },
            });
            updatedCount += 1;
            await tx.oorwinImportRow.create({
              data: {
                batchId: batch.id,
                rowNumber: i + 2,
                email,
                phone,
                oorwinId,
                candidateId: existing.id,
                action: 'updated',
                rawPayload: row,
              },
            });
          } else {
            if (!email) {
              throw new Error('Email required to create candidate');
            }
            const created = await tx.candidate.create({
              data: {
                organizationId: BigInt(organizationId),
                createdById: BigInt(authUser.id),
                firstName,
                lastName,
                email,
                phone,
                oorwinCandidateId: oorwinId,
                primaryRole: row.primaryrole ?? row.role ?? row.primary_role ?? null,
                headline: row.headline ?? row.title ?? null,
                location: row.location ?? row.city ?? null,
                summary: row.summary ?? row.aisummary ?? row.ai_summary ?? null,
                aiSummary: row.aisummary ?? row.ai_summary ?? row.summary ?? null,
                strengths: row.strengths ?? null,
                weaknesses: row.weaknesses ?? null,
                yearsExperience: row.yearsexperience || row.years_experience
                  ? Number(row.yearsexperience ?? row.years_experience)
                  : null,
                bestalScore: row.bestalscore || row.bestal_score
                  ? Number(row.bestalscore ?? row.bestal_score)
                  : null,
                clientBillRate: row.clientbillrate || row.bill_rate || row.expected_rate
                  ? Number(row.clientbillrate ?? row.bill_rate ?? row.expected_rate)
                  : null,
                candidatePayRate: row.candidatepayrate || row.pay_rate
                  ? Number(row.candidatepayrate ?? row.pay_rate)
                  : null,
                currency: row.currency ?? 'USD',
                availabilityStatus: (row.availabilitystatus ?? row.availability_status ?? null) as never,
                timezoneOverlap: row.timezone ?? row.timezone_overlap ?? null,
                source: ((row.source ?? 'OTHER').toUpperCase() as never) || 'OTHER',
                profileStatus: 'SOURCED',
                approvalStatus: 'PENDING',
              },
            });
            createdCount += 1;
            await tx.oorwinImportRow.create({
              data: {
                batchId: batch.id,
                rowNumber: i + 2,
                email,
                phone,
                oorwinId,
                candidateId: created.id,
                action: 'created',
                rawPayload: row,
              },
            });
          }
        } catch (err) {
          failedCount += 1;
          await tx.oorwinImportRow.create({
            data: {
              batchId: batch.id,
              rowNumber: i + 2,
              email: email || null,
              phone,
              oorwinId,
              action: 'failed',
              errorMessage: err instanceof Error ? err.message : 'Import failed',
              rawPayload: row,
            },
          });
        }
      }

      await tx.oorwinImportBatch.update({
        where: { id: batch.id },
        data: {
          status: 'COMPLETED',
          createdCount,
          updatedCount,
          skippedCount,
          failedCount,
          completedAt: new Date(),
        },
      });
    });

    await this.auditWrite(
      authUser,
      'EXPORT',
      'OorwinImportBatch',
      bigintToNumber(batch.id),
      `Oorwin import ${fileName}`,
      { createdCount, updatedCount, skippedCount, failedCount },
      ctx,
    );

    return {
      id: bigintToNumber(batch.id),
      fileName,
      status: 'COMPLETED',
      created: createdCount,
      updated: updatedCount,
      skipped: skippedCount,
      failed: failedCount,
    };
  }

  async listOorwinHistory(authUser: AuthenticatedUser, query: { page?: number | string; limit?: number | string }) {
    const organizationId = requireOrganization(authUser);
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);
    const where = { organizationId: BigInt(organizationId) };
    const [total, items] = await Promise.all([
      this.prisma.oorwinImportBatch.count({ where }),
      this.prisma.oorwinImportBatch.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { createdBy: { select: { firstName: true, lastName: true } } },
      }),
    ]);
    return {
      data: items.map((b) => ({
        id: bigintToNumber(b.id),
        fileName: b.fileName,
        status: b.status,
        createdCount: b.createdCount,
        updatedCount: b.updatedCount,
        skippedCount: b.skippedCount,
        failedCount: b.failedCount,
        createdByName: `${b.createdBy.firstName} ${b.createdBy.lastName}`,
        createdAt: b.createdAt.toISOString(),
        completedAt: b.completedAt?.toISOString() ?? null,
      })),
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  async getOorwinHistory(authUser: AuthenticatedUser, id: number) {
    const organizationId = requireOrganization(authUser);
    const batch = await this.prisma.oorwinImportBatch.findFirst({
      where: { id: BigInt(id), organizationId: BigInt(organizationId) },
      include: {
        createdBy: { select: { firstName: true, lastName: true } },
        rows: { orderBy: { rowNumber: 'asc' }, take: 500 },
      },
    });
    if (!batch) throw new NotFoundError('Import batch not found');
    return {
      id: bigintToNumber(batch.id),
      fileName: batch.fileName,
      status: batch.status,
      createdCount: batch.createdCount,
      updatedCount: batch.updatedCount,
      skippedCount: batch.skippedCount,
      failedCount: batch.failedCount,
      createdByName: `${batch.createdBy.firstName} ${batch.createdBy.lastName}`,
      createdAt: batch.createdAt.toISOString(),
      completedAt: batch.completedAt?.toISOString() ?? null,
      rows: batch.rows.map((r) => ({
        id: bigintToNumber(r.id),
        rowNumber: r.rowNumber,
        email: r.email,
        phone: r.phone,
        oorwinId: r.oorwinId,
        candidateId: r.candidateId ? bigintToNumber(r.candidateId) : null,
        action: r.action,
        errorMessage: r.errorMessage,
      })),
    };
  }

  // ── Reports ──────────────────────────────────────────────────────────────

  async reportCandidates(authUser: AuthenticatedUser) {
    const organizationId = requireOrganization(authUser);
    const org = BigInt(organizationId);
    const byCommunity = await this.prisma.candidate.groupBy({
      by: ['primarySkillCommunityId'],
      where: { organizationId: org, deletedAt: null },
      _count: { _all: true },
      _avg: { bestalScore: true, clientBillRate: true },
    });
    const communities = await this.prisma.skillCommunity.findMany({
      where: {
        id: {
          in: byCommunity
            .map((b) => b.primarySkillCommunityId)
            .filter((id): id is bigint => id != null),
        },
      },
      select: { id: true, name: true },
    });
    const nameById = new Map(communities.map((c) => [String(c.id), c.name]));
    const total = await this.prisma.candidate.count({ where: { organizationId: org, deletedAt: null } });
    const approved = await this.prisma.candidate.count({
      where: { organizationId: org, deletedAt: null, approvalStatus: 'APPROVED' },
    });
    const avg = await this.prisma.candidate.aggregate({
      where: { organizationId: org, deletedAt: null },
      _avg: { bestalScore: true, clientBillRate: true },
    });
    return {
      total,
      approvalRate: total ? approved / total : 0,
      averageBestalScore: avg._avg.bestalScore,
      averageBillRate: avg._avg.clientBillRate ? Number(avg._avg.clientBillRate) : null,
      byCommunity: byCommunity.map((b) => ({
        communityId: b.primarySkillCommunityId
          ? bigintToNumber(b.primarySkillCommunityId)
          : null,
        communityName: b.primarySkillCommunityId
          ? nameById.get(String(b.primarySkillCommunityId)) ?? 'Unknown'
          : 'Unassigned',
        total: b._count._all,
        averageBestalScore: b._avg.bestalScore,
        averageBillRate: b._avg.clientBillRate ? Number(b._avg.clientBillRate) : null,
      })),
    };
  }

  async reportRecruiters(authUser: AuthenticatedUser) {
    const organizationId = requireOrganization(authUser);
    const recruiters = await this.prisma.membership.findMany({
      where: {
        organizationId: BigInt(organizationId),
        isActive: true,
        role: { in: ['RECRUITER', 'ADMIN', 'SUPER_ADMIN'] },
        user: { deletedAt: null },
      },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
    });

    const rows = [];
    for (const m of recruiters) {
      const userId = Number(m.userId);
      const [added, approved, rejected, deployed, trials, converted] = await Promise.all([
        this.prisma.candidate.count({
          where: { organizationId: BigInt(organizationId), createdById: BigInt(userId), deletedAt: null },
        }),
        this.prisma.candidate.count({
          where: {
            organizationId: BigInt(organizationId),
            createdById: BigInt(userId),
            approvalStatus: 'APPROVED',
            deletedAt: null,
          },
        }),
        this.prisma.candidate.count({
          where: {
            organizationId: BigInt(organizationId),
            createdById: BigInt(userId),
            approvalStatus: 'REJECTED',
            deletedAt: null,
          },
        }),
        this.prisma.deployment.count({
          where: {
            organizationId: BigInt(organizationId),
            createdById: BigInt(userId),
            deletedAt: null,
          },
        }),
        this.prisma.trialRequest.count({
          where: { organizationId: BigInt(organizationId), requestedById: BigInt(userId), deletedAt: null },
        }),
        this.prisma.trialRequest.count({
          where: {
            organizationId: BigInt(organizationId),
            requestedById: BigInt(userId),
            convertedToPaid: true,
            deletedAt: null,
          },
        }),
      ]);
      rows.push({
        userId,
        name: `${m.user.firstName} ${m.user.lastName}`,
        email: m.user.email,
        candidatesAdded: added,
        approved,
        rejected,
        deployed,
        trialConversionRate: trials ? converted / trials : 0,
      });
    }
    return { recruiters: rows };
  }

  async reportClients(authUser: AuthenticatedUser) {
    const organizationId = requireOrganization(authUser);
    const clients = await this.prisma.client.findMany({
      where: { organizationId: BigInt(organizationId), deletedAt: null },
      include: {
        _count: { select: { deployments: true, trialRequests: true } },
      },
      orderBy: { name: 'asc' },
    });
    return {
      clients: clients.map((c) => ({
        id: bigintToNumber(c.id),
        name: c.name,
        status: c.status,
        industry: c.industry,
        deploymentCount: c._count.deployments,
        trialCount: c._count.trialRequests,
      })),
    };
  }

  async reportRevenue(authUser: AuthenticatedUser) {
    const organizationId = requireOrganization(authUser);
    const active = await this.prisma.deployment.findMany({
      where: { organizationId: BigInt(organizationId), deletedAt: null, status: 'ACTIVE' },
      include: {
        client: { select: { id: true, name: true } },
        candidate: { select: { primarySkillCommunityId: true, primarySkillCommunity: { select: { name: true } } } },
      },
    });

    let projectedMonthlyRevenue = 0;
    let projectedMonthlyMargin = 0;
    const byClient = new Map<string, { clientId: number; clientName: string; revenue: number; margin: number }>();
    const byCommunity = new Map<string, { community: string; revenue: number; margin: number }>();

    for (const d of active) {
      const hours = d.expectedHoursPerWeek ? Number(d.expectedHoursPerWeek) * 4.33 : 160;
      const bill = d.billingRate ? Number(d.billingRate) : 0;
      const pay = d.candidatePayRate ? Number(d.candidatePayRate) : 0;
      const revenue = bill * hours;
      const margin = (bill - pay) * hours;
      projectedMonthlyRevenue += revenue;
      projectedMonthlyMargin += margin;

      const ck = String(d.clientId);
      const existing = byClient.get(ck) ?? {
        clientId: bigintToNumber(d.clientId),
        clientName: d.client.name,
        revenue: 0,
        margin: 0,
      };
      existing.revenue += revenue;
      existing.margin += margin;
      byClient.set(ck, existing);

      const community = d.candidate.primarySkillCommunity?.name ?? 'Unassigned';
      const ce = byCommunity.get(community) ?? { community, revenue: 0, margin: 0 };
      ce.revenue += revenue;
      ce.margin += margin;
      byCommunity.set(community, ce);
    }

    return {
      activeRevenue: Math.round(projectedMonthlyRevenue),
      projectedMonthlyRevenue: Math.round(projectedMonthlyRevenue),
      projectedMonthlyMargin: Math.round(projectedMonthlyMargin),
      revenueByClient: [...byClient.values()].map((r) => ({
        ...r,
        revenue: Math.round(r.revenue),
        margin: Math.round(r.margin),
      })),
      revenueByCommunity: [...byCommunity.values()].map((r) => ({
        ...r,
        revenue: Math.round(r.revenue),
        margin: Math.round(r.margin),
      })),
    };
  }

  // ── Audit logs ───────────────────────────────────────────────────────────

  async listAuditLogs(authUser: AuthenticatedUser, query: Record<string, unknown>) {
    const organizationId = requireOrganization(authUser);
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);
    const where: Prisma.AuditLogWhereInput = {
      organizationId: BigInt(organizationId),
    };
    if (query.userId) where.actorId = BigInt(Number(query.userId));
    if (query.action) where.action = query.action as never;
    if (query.entityType) where.resourceType = String(query.entityType);
    if (query.entityId) where.resourceId = BigInt(Number(query.entityId));
    if (query.from || query.to) {
      where.createdAt = {};
      if (query.from) where.createdAt.gte = new Date(String(query.from));
      if (query.to) where.createdAt.lte = new Date(String(query.to));
    }
    const search = typeof query.search === 'string' ? query.search.trim() : '';
    if (search) {
      const searchUpper = search.toUpperCase();
      const matchingActions = (
        [
          'CREATE',
          'UPDATE',
          'DELETE',
          'RESTORE',
          'LOGIN',
          'LOGOUT',
          'VIEW',
          'EXPORT',
          'APPROVE',
          'REJECT',
          'ASSIGN',
          'UNASSIGN',
        ] as const
      ).filter((a) => a.includes(searchUpper));

      where.OR = [
        ...(matchingActions.length > 0 ? [{ action: { in: [...matchingActions] } }] : []),
        { resourceType: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { ipAddress: { contains: search, mode: 'insensitive' } },
        {
          actor: {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { actor: { select: { firstName: true, lastName: true, email: true } } },
      }),
    ]);

    return {
      data: items.map((a) => ({
        id: bigintToNumber(a.id),
        userId: a.actorId ? bigintToNumber(a.actorId) : null,
        userName: a.actor ? `${a.actor.firstName} ${a.actor.lastName}` : null,
        userEmail: a.actor?.email ?? null,
        action: a.action,
        entityType: a.resourceType,
        entityId: a.resourceId ? bigintToNumber(a.resourceId) : null,
        description: a.description,
        ipAddress: a.ipAddress,
        userAgent: a.userAgent,
        createdAt: a.createdAt.toISOString(),
      })),
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  async getAuditLog(authUser: AuthenticatedUser, id: number) {
    const organizationId = requireOrganization(authUser);
    const a = await this.prisma.auditLog.findFirst({
      where: { id: BigInt(id), organizationId: BigInt(organizationId) },
      include: { actor: { select: { firstName: true, lastName: true, email: true } } },
    });
    if (!a) throw new NotFoundError('Audit log not found');
    return {
      id: bigintToNumber(a.id),
      userId: a.actorId ? bigintToNumber(a.actorId) : null,
      userName: a.actor ? `${a.actor.firstName} ${a.actor.lastName}` : null,
      action: a.action,
      entityType: a.resourceType,
      entityId: a.resourceId ? bigintToNumber(a.resourceId) : null,
      description: a.description,
      metadata: a.metadata,
      ipAddress: a.ipAddress,
      userAgent: a.userAgent,
      createdAt: a.createdAt.toISOString(),
    };
  }

  // ── Settings ─────────────────────────────────────────────────────────────

  async getSettings() {
    const rows = await this.prisma.systemSetting.findMany();
    const out: Record<string, unknown> = {
      oorwin: {},
      email: {},
      security: {},
      scoring: {},
      prompts: {},
      pricing: {},
      trials: {},
      notifications: {},
      integrations: {},
      commercials: {},
      workflows: {},
      localization: {},
      storage: {},
    };
    for (const row of rows) {
      if (row.key === 'workflows') {
        out.workflows = maskWorkflowsSettingsForAdmin(row.value);
      } else if (row.key === 'email') {
        out.email = maskEmailSettingsForAdmin(row.value);
      } else if (row.key === 'integrations') {
        out.integrations = maskIntegrationsSettingsForAdmin(row.value);
      } else if (row.key === 'storage') {
        out.storage = maskStorageSettingsForAdmin(row.value);
      } else {
        out[row.key] = row.value;
      }
    }
    return out;
  }

  async putSetting(
    authUser: AuthenticatedUser,
    key: SettingKey,
    value: unknown,
    ctx?: { ipAddress?: string | null; userAgent?: string | null },
  ) {
    if (!SETTING_KEYS.includes(key)) throw new BadRequestError('Invalid settings key');

    let payload = value;
    if (key === 'workflows') {
      const existing = await this.prisma.systemSetting.findUnique({
        where: { key: 'workflows' },
      });
      payload = mergeWorkflowsSettingsUpdate(value, existing?.value);
      const merged = payload as {
        enabled: boolean;
        baseUrl: string | null;
        resumeWorkflowPath: string | null;
        evaluationWorkflowPath: string | null;
        bgvWorkflowPath: string | null;
        webhookSecret: string | null;
      };
      if (merged.enabled) {
        if (!merged.baseUrl) {
          throw new BadRequestError('n8n base URL is required when workflows are enabled');
        }
        if (!merged.webhookSecret) {
          throw new BadRequestError('Webhook secret is required when workflows are enabled');
        }
        if (
          !merged.resumeWorkflowPath &&
          !merged.evaluationWorkflowPath &&
          !merged.bgvWorkflowPath
        ) {
          throw new BadRequestError(
            'At least one workflow webhook path is required when workflows are enabled',
          );
        }
      }
    } else if (key === 'email') {
      const existing = await this.prisma.systemSetting.findUnique({ where: { key: 'email' } });
      payload = mergeEmailSettingsUpdate(value, existing?.value);
    } else if (key === 'integrations') {
      const existing = await this.prisma.systemSetting.findUnique({
        where: { key: 'integrations' },
      });
      payload = mergeIntegrationsSettingsUpdate(value, existing?.value);
    } else if (key === 'storage') {
      const existing = await this.prisma.systemSetting.findUnique({
        where: { key: 'storage' },
      });
      payload = mergeStorageSettingsUpdate(value, existing?.value);
      const merged = payload as {
        driver: 'local' | 's3' | null;
        region: string | null;
        bucket: string | null;
      };
      if (merged.driver === 's3' && (!merged.region?.trim() || !merged.bucket?.trim())) {
        throw new BadRequestError('S3 region and bucket are required when storage driver is s3');
      }
    }

    const row = await this.prisma.systemSetting.upsert({
      where: { key },
      create: {
        key,
        value: payload as Prisma.InputJsonValue,
        updatedById: BigInt(authUser.id),
      },
      update: {
        value: payload as Prisma.InputJsonValue,
        updatedById: BigInt(authUser.id),
      },
    });
    await this.auditWrite(authUser, 'UPDATE', 'SystemSetting', bigintToNumber(row.id), `Updated settings.${key}`, payload as Prisma.InputJsonValue, ctx);
    if (key === 'workflows') {
      return { key, value: maskWorkflowsSettingsForAdmin(row.value) };
    }
    if (key === 'email') {
      return { key, value: maskEmailSettingsForAdmin(row.value) };
    }
    if (key === 'integrations') {
      return { key, value: maskIntegrationsSettingsForAdmin(row.value) };
    }
    if (key === 'storage') {
      return { key, value: maskStorageSettingsForAdmin(row.value) };
    }
    return { key, value: row.value };
  }

  async listCommunicationTemplates() {
    return listCommunicationTemplates(this.prisma);
  }

  async upsertCommunicationTemplate(
    authUser: AuthenticatedUser,
    input: {
      key: string;
      channel: 'EMAIL' | 'SMS' | 'IN_APP';
      subject?: string | null;
      body: string;
      variables?: string[];
    },
    ctx?: { ipAddress?: string | null; userAgent?: string | null },
  ) {
    const row = await upsertCommunicationTemplate(this.prisma, input);
    await this.auditWrite(
      authUser,
      'UPDATE',
      'CommunicationTemplate',
      row.id,
      `Updated communication template ${input.key}`,
      input as unknown as Prisma.InputJsonValue,
      ctx,
    );
    return row;
  }

  async deleteCommunicationTemplate(
    authUser: AuthenticatedUser,
    key: string,
    ctx?: { ipAddress?: string | null; userAgent?: string | null },
  ) {
    await deleteCommunicationTemplate(this.prisma, key);
    await this.auditWrite(
      authUser,
      'DELETE',
      'CommunicationTemplate',
      null,
      `Deleted communication template ${key}`,
      { key },
      ctx,
    );
    return { deleted: true };
  }
}

function parseCsv(text: string): Record<string, string>[] {
  const lines = text
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];
  const headers = splitCsvLine(lines[0]!).map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const cols = splitCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = (cols[i] ?? '').trim();
    });
    return row;
  });
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i]!;
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

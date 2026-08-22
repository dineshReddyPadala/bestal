import type { FastifyReply, FastifyRequest } from 'fastify';
import { BadRequestError } from '../../utils/index.js';
import { EmailService } from '../../services/email.service.js';
import { requestAuditContext } from './admin.auth.js';
import { AdminOpsService } from './admin-ops.service.js';
import { AdminRolesService } from './admin-roles.service.js';
import { AdminService } from './admin.service.js';

export class AdminController {
  constructor(
    private readonly admin: AdminService,
    private readonly ops: AdminOpsService,
    private readonly roles: AdminRolesService,
    private readonly emailFactory?: (request: FastifyRequest) => EmailService,
  ) {}

  private ctx(request: FastifyRequest) {
    return requestAuditContext(request);
  }

  dashboard = async (request: FastifyRequest, reply: FastifyReply) => {
    const data = await this.admin.dashboard(request.authUser!);
    return reply.send({ data });
  };

  listUsers = async (request: FastifyRequest, reply: FastifyReply) => {
    const q = request.query as {
      page?: number;
      limit?: number;
      search?: string;
      role?: string;
      isActive?: string;
    };
    const result = await this.admin.listUsers(request.authUser!, {
      page: Number(q.page ?? 1),
      limit: Number(q.limit ?? 20),
      search: q.search,
      role: q.role,
      isActive: q.isActive === undefined ? undefined : q.isActive === 'true',
    });
    return reply.send(result);
  };

  getUser = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.admin.getUser(request.authUser!, id);
    return reply.send({ data });
  };

  createUser = async (request: FastifyRequest, reply: FastifyReply) => {
    const data = await this.admin.createUser(
      request.authUser!,
      request.body as never,
      this.ctx(request),
    );
    return reply.status(201).send({ data });
  };

  updateUser = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.admin.updateUser(
      request.authUser!,
      id,
      request.body as never,
      this.ctx(request),
    );
    return reply.send({ data });
  };

  setUserStatus = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const body = request.body as { isActive: boolean };
    const data = await this.admin.setUserStatus(
      request.authUser!,
      id,
      body.isActive,
      this.ctx(request),
    );
    return reply.send({ data });
  };

  resetUserPassword = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.admin.resetUserPassword(
      request.authUser!,
      id,
      this.ctx(request),
    );
    return reply.send({ data });
  };

  resendInvite = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.admin.resendInvite(request.authUser!, id, this.ctx(request));
    return reply.send({ data });
  };

  deleteUser = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.admin.deleteUser(
      request.authUser!,
      id,
      this.ctx(request),
    );
    return reply.send({ data });
  };

  listClients = async (request: FastifyRequest, reply: FastifyReply) => {
    const result = await this.admin.listClients(
      request.authUser!,
      request.query as Record<string, unknown>,
    );
    return reply.send(result);
  };

  getClient = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.admin.getClient(request.authUser!, id);
    return reply.send({ data });
  };

  createClient = async (request: FastifyRequest, reply: FastifyReply) => {
    const data = await this.admin.createClient(
      request.authUser!,
      request.body as Record<string, unknown>,
      this.ctx(request),
    );
    return reply.status(201).send({ data });
  };

  updateClient = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.admin.updateClient(
      request.authUser!,
      id,
      request.body as Record<string, unknown>,
      this.ctx(request),
    );
    return reply.send({ data });
  };

  setClientStatus = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const body = request.body as { status: string };
    const data = await this.admin.setClientStatus(
      request.authUser!,
      id,
      body.status as never,
      this.ctx(request),
    );
    return reply.send({ data });
  };

  assignAccountManager = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const body = request.body as { accountManagerId: number | null };
    const data = await this.admin.assignAccountManager(
      request.authUser!,
      id,
      body.accountManagerId,
      this.ctx(request),
    );
    return reply.send({ data });
  };

  deleteClient = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.admin.deleteClient(
      request.authUser!,
      id,
      this.ctx(request),
    );
    return reply.send({ data });
  };

  listCandidates = async (request: FastifyRequest, reply: FastifyReply) => {
    const result = await this.admin.listCandidates(
      request.authUser!,
      request.query as Record<string, unknown>,
    );
    return reply.send(result);
  };

  listPendingCandidates = async (request: FastifyRequest, reply: FastifyReply) => {
    const result = await this.admin.listPendingCandidates(
      request.authUser!,
      request.query as Record<string, unknown>,
    );
    return reply.send(result);
  };

  getCandidate = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.admin.getCandidateDetail(request.authUser!, id);
    return reply.send({ data });
  };

  approveCandidate = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.admin.approveCandidate(
      request.authUser!,
      id,
      'internal',
      this.ctx(request),
    );
    return reply.send({ data });
  };

  approveCandidateInternal = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.admin.approveCandidate(
      request.authUser!,
      id,
      'internal',
      this.ctx(request),
    );
    return reply.send({ data });
  };

  rejectCandidate = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const body = request.body as { reason?: string };
    if (!body.reason?.trim()) throw new BadRequestError('reason is required');
    const data = await this.admin.rejectCandidate(
      request.authUser!,
      id,
      body.reason,
      this.ctx(request),
    );
    return reply.send({ data });
  };

  hideCandidate = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.admin.hideCandidate(
      request.authUser!,
      id,
      this.ctx(request),
    );
    return reply.send({ data });
  };

  publishCandidate = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.admin.publishCandidate(
      request.authUser!,
      id,
      this.ctx(request),
    );
    return reply.send({ data });
  };

  archiveCandidate = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.admin.archiveCandidate(
      request.authUser!,
      id,
      this.ctx(request),
    );
    return reply.send({ data });
  };

  unarchiveCandidate = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.admin.unarchiveCandidate(
      request.authUser!,
      id,
      this.ctx(request),
    );
    return reply.send({ data });
  };

  updateCandidatePricing = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.admin.updateCandidatePricing(
      request.authUser!,
      id,
      request.body as never,
      this.ctx(request),
    );
    return reply.send({ data });
  };

  sendBackCandidate = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const body = request.body as { reason?: string };
    const data = await this.admin.sendBackToRecruiter(
      request.authUser!,
      id,
      body.reason,
      this.ctx(request),
    );
    return reply.send({ data });
  };

  listSkillCommunities = async (request: FastifyRequest, reply: FastifyReply) => {
    const q = request.query as { page?: string | number; limit?: string | number; search?: string };
    const result = await this.admin.listSkillCommunities({
      page: Number(q.page ?? 1),
      limit: Number(q.limit ?? 50),
      search: q.search,
    });
    return reply.send(result);
  };

  createSkillCommunity = async (request: FastifyRequest, reply: FastifyReply) => {
    const data = await this.admin.createSkillCommunity(
      request.authUser!,
      request.body as never,
      this.ctx(request),
    );
    return reply.status(201).send({ data });
  };

  updateSkillCommunity = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.admin.updateSkillCommunity(
      request.authUser!,
      id,
      request.body as never,
      this.ctx(request),
    );
    return reply.send({ data });
  };

  setSkillCommunityStatus = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const body = request.body as { isActive: boolean };
    const data = await this.admin.setSkillCommunityStatus(
      request.authUser!,
      id,
      body.isActive,
      this.ctx(request),
    );
    return reply.send({ data });
  };

  deleteSkillCommunity = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.admin.deleteSkillCommunity(
      request.authUser!,
      id,
      this.ctx(request),
    );
    return reply.send({ data });
  };

  listIcons = async (request: FastifyRequest, reply: FastifyReply) => {
    const q = request.query as { page?: string | number; limit?: string | number; search?: string };
    const result = await this.admin.listIcons({
      page: Number(q.page ?? 1),
      limit: Number(q.limit ?? 50),
      search: q.search,
    });
    return reply.send(result);
  };

  getIcon = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.admin.getIcon(id);
    return reply.send({ data });
  };

  createIcon = async (request: FastifyRequest, reply: FastifyReply) => {
    let name: string | undefined;
    let file: { filename: string; mimetype: string; buffer: Buffer } | undefined;

    for await (const part of request.parts()) {
      if (part.type === 'field' && part.fieldname === 'name') {
        name = String(part.value);
        continue;
      }
      if (part.type === 'file' && part.fieldname === 'file') {
        const buffer = await part.toBuffer();
        file = {
          filename: part.filename,
          mimetype: part.mimetype,
          buffer,
        };
      }
    }

    if (!name?.trim()) throw new BadRequestError('Icon name is required');
    if (!file) throw new BadRequestError('Icon image is required');

    const data = await this.admin.createIcon(
      request.authUser!,
      { name: name.trim(), file },
      this.ctx(request),
    );
    return reply.status(201).send({ data });
  };

  updateIcon = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.admin.updateIcon(
      request.authUser!,
      id,
      request.body as never,
      this.ctx(request),
    );
    return reply.send({ data });
  };

  uploadIconFile = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const file = await request.file();
    if (!file) throw new BadRequestError('Icon image is required');
    const buffer = await file.toBuffer();
    const data = await this.admin.uploadIconFile(
      request.authUser!,
      id,
      {
        filename: file.filename,
        mimetype: file.mimetype,
        buffer,
      },
      this.ctx(request),
    );
    return reply.send({ data });
  };

  deleteIcon = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.admin.deleteIcon(
      request.authUser!,
      id,
      this.ctx(request),
    );
    return reply.send({ data });
  };

  uploadSkillCommunityIcon = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const file = await request.file();
    if (!file) throw new BadRequestError('Icon image is required');
    const buffer = await file.toBuffer();
    const data = await this.admin.uploadSkillCommunityIcon(
      request.authUser!,
      id,
      {
        filename: file.filename,
        mimetype: file.mimetype,
        buffer,
      },
      this.ctx(request),
    );
    return reply.send({ data });
  };

  listTrials = async (request: FastifyRequest, reply: FastifyReply) => {
    const result = await this.ops.listTrials(
      request.authUser!,
      request.query as Record<string, unknown>,
    );
    return reply.send(result);
  };

  getTrial = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.ops.getTrial(request.authUser!, id);
    return reply.send({ data });
  };

  approveTrial = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const body = (request.body ?? {}) as { recruiterId?: number };
    const data = await this.ops.approveTrial(
      request.authUser!,
      id,
      body.recruiterId,
      this.ctx(request),
    );
    return reply.send({ data });
  };

  rejectTrial = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const body = request.body as { reason?: string };
    const data = await this.ops.rejectTrial(
      request.authUser!,
      id,
      body.reason ?? 'Rejected',
      this.ctx(request),
    );
    return reply.send({ data });
  };

  assignTrial = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const body = request.body as { recruiterId: number };
    if (!body.recruiterId) throw new BadRequestError('recruiterId is required');
    const data = await this.ops.assignTrial(
      request.authUser!,
      id,
      body.recruiterId,
      this.ctx(request),
    );
    return reply.send({ data });
  };

  convertTrial = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const body = (request.body ?? {}) as { createDeployment?: boolean };
    const data = await this.ops.convertTrial(
      request.authUser!,
      id,
      body.createDeployment !== false,
      this.ctx(request),
    );
    return reply.send({ data });
  };

  listDeployments = async (request: FastifyRequest, reply: FastifyReply) => {
    const result = await this.ops.listDeployments(
      request.authUser!,
      request.query as Record<string, unknown>,
    );
    return reply.send(result);
  };

  getDeployment = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.ops.getDeployment(request.authUser!, id);
    return reply.send({ data });
  };

  createDeployment = async (request: FastifyRequest, reply: FastifyReply) => {
    const data = await this.ops.createDeployment(
      request.authUser!,
      request.body as Record<string, unknown>,
      this.ctx(request),
    );
    return reply.status(201).send({ data });
  };

  updateDeployment = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.ops.updateDeployment(
      request.authUser!,
      id,
      request.body as Record<string, unknown>,
      this.ctx(request),
    );
    return reply.send({ data });
  };

  pauseDeployment = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.ops.pauseDeployment(
      request.authUser!,
      id,
      this.ctx(request),
    );
    return reply.send({ data });
  };

  completeDeployment = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.ops.completeDeployment(
      request.authUser!,
      id,
      this.ctx(request),
    );
    return reply.send({ data });
  };

  terminateDeployment = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const body = request.body as { reason?: string };
    const data = await this.ops.terminateDeployment(
      request.authUser!,
      id,
      body.reason ?? 'Terminated',
      this.ctx(request),
    );
    return reply.send({ data });
  };

  extendDeployment = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const body = request.body as { endDate: string };
    if (!body.endDate) throw new BadRequestError('endDate is required');
    const data = await this.ops.extendDeployment(
      request.authUser!,
      id,
      body.endDate,
      this.ctx(request),
    );
    return reply.send({ data });
  };

  importOorwin = async (request: FastifyRequest, reply: FastifyReply) => {
    const file = await request.file();
    if (!file) throw new BadRequestError('CSV file is required');
    const buffer = await file.toBuffer();
    const data = await this.ops.importOorwinCsv(
      request.authUser!,
      file.filename,
      buffer.toString('utf8'),
      this.ctx(request),
    );
    return reply.send({ data });
  };

  listOorwinHistory = async (request: FastifyRequest, reply: FastifyReply) => {
    const q = request.query as { page?: number; limit?: number };
    const result = await this.ops.listOorwinHistory(request.authUser!, {
      page: Number(q.page ?? 1),
      limit: Number(q.limit ?? 20),
    });
    return reply.send(result);
  };

  getOorwinHistory = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.ops.getOorwinHistory(request.authUser!, id);
    return reply.send({ data });
  };

  reportCandidates = async (request: FastifyRequest, reply: FastifyReply) => {
    const data = await this.ops.reportCandidates(request.authUser!);
    return reply.send({ data });
  };

  reportRecruiters = async (request: FastifyRequest, reply: FastifyReply) => {
    const data = await this.ops.reportRecruiters(request.authUser!);
    return reply.send({ data });
  };

  reportClients = async (request: FastifyRequest, reply: FastifyReply) => {
    const data = await this.ops.reportClients(request.authUser!);
    return reply.send({ data });
  };

  reportRevenue = async (request: FastifyRequest, reply: FastifyReply) => {
    const data = await this.ops.reportRevenue(request.authUser!);
    return reply.send({ data });
  };

  listAuditLogs = async (request: FastifyRequest, reply: FastifyReply) => {
    const result = await this.ops.listAuditLogs(
      request.authUser!,
      request.query as Record<string, unknown>,
    );
    return reply.send(result);
  };

  getAuditLog = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };
    const data = await this.ops.getAuditLog(request.authUser!, id);
    return reply.send({ data });
  };

  getSettings = async (_request: FastifyRequest, reply: FastifyReply) => {
    const data = await this.ops.getSettings();
    return reply.send({ data });
  };

  putSetting =
    (
      key:
        | 'oorwin'
        | 'email'
        | 'security'
        | 'scoring'
        | 'prompts'
        | 'pricing'
        | 'trials'
        | 'notifications'
        | 'integrations'
        | 'commercials'
        | 'workflows'
        | 'localization'
        | 'storage',
    ) =>
    async (request: FastifyRequest, reply: FastifyReply) => {
      const data = await this.ops.putSetting(
        request.authUser!,
        key,
        request.body,
        this.ctx(request),
      );
      return reply.send({ data });
    };

  listCommunicationTemplates = async (_request: FastifyRequest, reply: FastifyReply) => {
    const data = await this.ops.listCommunicationTemplates();
    return reply.send({ data });
  };

  upsertCommunicationTemplate = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as {
      key: string;
      channel: 'EMAIL' | 'SMS' | 'IN_APP';
      subject?: string | null;
      body: string;
      variables?: string[];
    };
    const data = await this.ops.upsertCommunicationTemplate(
      request.authUser!,
      body,
      this.ctx(request),
    );
    return reply.send({ data });
  };

  deleteCommunicationTemplate = async (request: FastifyRequest, reply: FastifyReply) => {
    const { key } = request.params as { key: string };
    const data = await this.ops.deleteCommunicationTemplate(
      request.authUser!,
      key,
      this.ctx(request),
    );
    return reply.send({ data });
  };

  sendTestEmail = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as { to?: string };
    const to = body.to?.trim();
    if (!to) throw new BadRequestError('Recipient email is required');
    const email = this.emailFactory?.(request) ?? new EmailService(request.server.config, request.server.prisma);
    const result = await email.sendTestEmail(to);
    return reply.send({ data: result });
  };

  listRoles = async (request: FastifyRequest, reply: FastifyReply) => {
    const q = request.query as { search?: string };
    const result = await this.roles.listRoles({ search: q.search });
    return reply.send(result);
  };

  getRoleCatalog = async (_request: FastifyRequest, reply: FastifyReply) => {
    const result = await this.roles.listCatalog();
    return reply.send(result);
  };

  getRole = async (request: FastifyRequest, reply: FastifyReply) => {
    const { code } = request.params as { code: string };
    const data = await this.roles.getRole(code);
    return reply.send({ data });
  };

  createRole = async (request: FastifyRequest, reply: FastifyReply) => {
    const data = await this.roles.createRole(
      request.authUser!,
      request.body as never,
      this.ctx(request),
    );
    return reply.status(201).send({ data });
  };

  updateRole = async (request: FastifyRequest, reply: FastifyReply) => {
    const { code } = request.params as { code: string };
    const data = await this.roles.updateRole(
      request.authUser!,
      code,
      request.body as never,
      this.ctx(request),
    );
    return reply.send({ data });
  };

  deleteRole = async (request: FastifyRequest, reply: FastifyReply) => {
    const { code } = request.params as { code: string };
    const data = await this.roles.deleteRole(
      request.authUser!,
      code,
      this.ctx(request),
    );
    return reply.send({ data });
  };

  listRoleUsers = async (request: FastifyRequest, reply: FastifyReply) => {
    const { code } = request.params as { code: string };
    const q = request.query as { search?: string };
    const result = await this.roles.listRoleUsers(request.authUser!, code, {
      search: q.search,
    });
    return reply.send(result);
  };

  assignUserToRole = async (request: FastifyRequest, reply: FastifyReply) => {
    const { code } = request.params as { code: string };
    const body = request.body as { userId?: number; clientId?: number | null };
    const result = await this.roles.assignUserToRole(
      request.authUser!,
      code,
      { userId: Number(body.userId), clientId: body.clientId },
      this.ctx(request),
    );
    return reply.send(result);
  };

  unassignUserFromRole = async (request: FastifyRequest, reply: FastifyReply) => {
    const { code, userId } = request.params as { code: string; userId: string };
    const result = await this.roles.unassignUserFromRole(
      request.authUser!,
      code,
      Number(userId),
      this.ctx(request),
    );
    return reply.send(result);
  };
}

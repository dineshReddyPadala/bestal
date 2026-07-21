import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { requireSuperAdmin } from './admin.auth.js';
import { AdminController } from './admin.controller.js';
import { AdminOpsService } from './admin-ops.service.js';
import { AdminService } from './admin.service.js';
import { adminIdParamSchema, adminListQuerySchema } from './admin.validators.js';

export async function adminRoutes(fastify: FastifyInstance): Promise<void> {
  const admin = new AdminService(fastify);
  const ops = new AdminOpsService(fastify);
  const controller = new AdminController(admin, ops);
  const app = fastify.withTypeProvider<ZodTypeProvider>();
  const secure = { preHandler: [...requireSuperAdmin] };

  app.get(
    '/dashboard',
    {
      ...secure,
      schema: { tags: ['Admin'], summary: 'Super Admin dashboard', security: [{ bearerAuth: [] }] },
    },
    controller.dashboard,
  );

  // Users
  app.get('/users', { ...secure, schema: { tags: ['Admin'], querystring: adminListQuerySchema.extend({ role: z.string().optional(), isActive: z.string().optional() }), security: [{ bearerAuth: [] }] } }, controller.listUsers);
  app.get('/users/:id', { ...secure, schema: { tags: ['Admin'], params: adminIdParamSchema, security: [{ bearerAuth: [] }] } }, controller.getUser);
  app.post('/users', { ...secure, schema: { tags: ['Admin'], security: [{ bearerAuth: [] }] } }, controller.createUser);
  app.put('/users/:id', { ...secure, schema: { tags: ['Admin'], params: adminIdParamSchema, security: [{ bearerAuth: [] }] } }, controller.updateUser);
  app.patch('/users/:id/status', { ...secure, schema: { tags: ['Admin'], params: adminIdParamSchema, security: [{ bearerAuth: [] }] } }, controller.setUserStatus);
  app.post('/users/:id/reset-password', { ...secure, schema: { tags: ['Admin'], params: adminIdParamSchema, security: [{ bearerAuth: [] }] } }, controller.resetUserPassword);
  app.post('/users/:id/resend-invite', { ...secure, schema: { tags: ['Admin'], params: adminIdParamSchema, security: [{ bearerAuth: [] }] } }, controller.resendInvite);
  app.delete('/users/:id', { ...secure, schema: { tags: ['Admin'], params: adminIdParamSchema, security: [{ bearerAuth: [] }] } }, controller.deleteUser);

  // Clients
  app.get('/clients', { ...secure, schema: { tags: ['Admin'], security: [{ bearerAuth: [] }] } }, controller.listClients);
  app.get('/clients/:id', { ...secure, schema: { tags: ['Admin'], params: adminIdParamSchema, security: [{ bearerAuth: [] }] } }, controller.getClient);
  app.post('/clients', { ...secure, schema: { tags: ['Admin'], security: [{ bearerAuth: [] }] } }, controller.createClient);
  app.put('/clients/:id', { ...secure, schema: { tags: ['Admin'], params: adminIdParamSchema, security: [{ bearerAuth: [] }] } }, controller.updateClient);
  app.patch('/clients/:id/status', { ...secure, schema: { tags: ['Admin'], params: adminIdParamSchema, security: [{ bearerAuth: [] }] } }, controller.setClientStatus);
  app.patch('/clients/:id/account-manager', { ...secure, schema: { tags: ['Admin'], params: adminIdParamSchema, security: [{ bearerAuth: [] }] } }, controller.assignAccountManager);

  // Candidates
  app.get('/candidates', { ...secure, schema: { tags: ['Admin'], security: [{ bearerAuth: [] }] } }, controller.listCandidates);
  app.get('/candidates/pending', { ...secure, schema: { tags: ['Admin'], security: [{ bearerAuth: [] }] } }, controller.listPendingCandidates);
  app.get('/candidates/:id', { ...secure, schema: { tags: ['Admin'], params: adminIdParamSchema, security: [{ bearerAuth: [] }] } }, controller.getCandidate);
  app.patch('/candidates/:id/approve', { ...secure, schema: { tags: ['Admin'], params: adminIdParamSchema, security: [{ bearerAuth: [] }] } }, controller.approveCandidate);
  app.patch('/candidates/:id/approve-internal', { ...secure, schema: { tags: ['Admin'], params: adminIdParamSchema, security: [{ bearerAuth: [] }] } }, controller.approveCandidateInternal);
  app.patch('/candidates/:id/reject', { ...secure, schema: { tags: ['Admin'], params: adminIdParamSchema, security: [{ bearerAuth: [] }] } }, controller.rejectCandidate);
  app.patch('/candidates/:id/hide', { ...secure, schema: { tags: ['Admin'], params: adminIdParamSchema, security: [{ bearerAuth: [] }] } }, controller.hideCandidate);
  app.patch('/candidates/:id/publish', { ...secure, schema: { tags: ['Admin'], params: adminIdParamSchema, security: [{ bearerAuth: [] }] } }, controller.publishCandidate);
  app.patch('/candidates/:id/archive', { ...secure, schema: { tags: ['Admin'], params: adminIdParamSchema, security: [{ bearerAuth: [] }] } }, controller.archiveCandidate);
  app.patch('/candidates/:id/pricing', { ...secure, schema: { tags: ['Admin'], params: adminIdParamSchema, security: [{ bearerAuth: [] }] } }, controller.updateCandidatePricing);
  app.patch('/candidates/:id/send-back', { ...secure, schema: { tags: ['Admin'], params: adminIdParamSchema, security: [{ bearerAuth: [] }] } }, controller.sendBackCandidate);

  // Skill communities
  app.get('/skill-communities', { ...secure, schema: { tags: ['Admin'], security: [{ bearerAuth: [] }] } }, controller.listSkillCommunities);
  app.post('/skill-communities', { ...secure, schema: { tags: ['Admin'], security: [{ bearerAuth: [] }] } }, controller.createSkillCommunity);
  app.put('/skill-communities/:id', { ...secure, schema: { tags: ['Admin'], params: adminIdParamSchema, security: [{ bearerAuth: [] }] } }, controller.updateSkillCommunity);
  app.patch('/skill-communities/:id/status', { ...secure, schema: { tags: ['Admin'], params: adminIdParamSchema, security: [{ bearerAuth: [] }] } }, controller.setSkillCommunityStatus);
  app.delete('/skill-communities/:id', { ...secure, schema: { tags: ['Admin'], params: adminIdParamSchema, security: [{ bearerAuth: [] }] } }, controller.deleteSkillCommunity);

  // Trials
  app.get('/trials', { ...secure, schema: { tags: ['Admin'], security: [{ bearerAuth: [] }] } }, controller.listTrials);
  app.get('/trials/:id', { ...secure, schema: { tags: ['Admin'], params: adminIdParamSchema, security: [{ bearerAuth: [] }] } }, controller.getTrial);
  app.patch('/trials/:id/approve', { ...secure, schema: { tags: ['Admin'], params: adminIdParamSchema, security: [{ bearerAuth: [] }] } }, controller.approveTrial);
  app.patch('/trials/:id/reject', { ...secure, schema: { tags: ['Admin'], params: adminIdParamSchema, security: [{ bearerAuth: [] }] } }, controller.rejectTrial);
  app.patch('/trials/:id/assign', { ...secure, schema: { tags: ['Admin'], params: adminIdParamSchema, security: [{ bearerAuth: [] }] } }, controller.assignTrial);
  app.patch('/trials/:id/convert', { ...secure, schema: { tags: ['Admin'], params: adminIdParamSchema, security: [{ bearerAuth: [] }] } }, controller.convertTrial);

  // Deployments
  app.get('/deployments', { ...secure, schema: { tags: ['Admin'], security: [{ bearerAuth: [] }] } }, controller.listDeployments);
  app.get('/deployments/:id', { ...secure, schema: { tags: ['Admin'], params: adminIdParamSchema, security: [{ bearerAuth: [] }] } }, controller.getDeployment);
  app.post('/deployments', { ...secure, schema: { tags: ['Admin'], security: [{ bearerAuth: [] }] } }, controller.createDeployment);
  app.put('/deployments/:id', { ...secure, schema: { tags: ['Admin'], params: adminIdParamSchema, security: [{ bearerAuth: [] }] } }, controller.updateDeployment);
  app.patch('/deployments/:id/pause', { ...secure, schema: { tags: ['Admin'], params: adminIdParamSchema, security: [{ bearerAuth: [] }] } }, controller.pauseDeployment);
  app.patch('/deployments/:id/complete', { ...secure, schema: { tags: ['Admin'], params: adminIdParamSchema, security: [{ bearerAuth: [] }] } }, controller.completeDeployment);
  app.patch('/deployments/:id/terminate', { ...secure, schema: { tags: ['Admin'], params: adminIdParamSchema, security: [{ bearerAuth: [] }] } }, controller.terminateDeployment);
  app.patch('/deployments/:id/extend', { ...secure, schema: { tags: ['Admin'], params: adminIdParamSchema, security: [{ bearerAuth: [] }] } }, controller.extendDeployment);

  // Oorwin
  app.post('/oorwin/import', { ...secure, schema: { tags: ['Admin'], security: [{ bearerAuth: [] }], consumes: ['multipart/form-data'] } }, controller.importOorwin);
  app.get('/oorwin/history', { ...secure, schema: { tags: ['Admin'], security: [{ bearerAuth: [] }] } }, controller.listOorwinHistory);
  app.get('/oorwin/history/:id', { ...secure, schema: { tags: ['Admin'], params: adminIdParamSchema, security: [{ bearerAuth: [] }] } }, controller.getOorwinHistory);

  // Reports
  app.get('/reports/candidates', { ...secure, schema: { tags: ['Admin'], security: [{ bearerAuth: [] }] } }, controller.reportCandidates);
  app.get('/reports/recruiters', { ...secure, schema: { tags: ['Admin'], security: [{ bearerAuth: [] }] } }, controller.reportRecruiters);
  app.get('/reports/clients', { ...secure, schema: { tags: ['Admin'], security: [{ bearerAuth: [] }] } }, controller.reportClients);
  app.get('/reports/revenue', { ...secure, schema: { tags: ['Admin'], security: [{ bearerAuth: [] }] } }, controller.reportRevenue);

  // Audit
  app.get('/audit-logs', { ...secure, schema: { tags: ['Admin'], security: [{ bearerAuth: [] }] } }, controller.listAuditLogs);
  app.get('/audit-logs/:id', { ...secure, schema: { tags: ['Admin'], params: adminIdParamSchema, security: [{ bearerAuth: [] }] } }, controller.getAuditLog);

  // Settings
  app.get('/settings', { ...secure, schema: { tags: ['Admin'], security: [{ bearerAuth: [] }] } }, controller.getSettings);
  app.put('/settings/ai', { ...secure, schema: { tags: ['Admin'], security: [{ bearerAuth: [] }] } }, controller.putSetting('ai'));
  app.put('/settings/oorwin', { ...secure, schema: { tags: ['Admin'], security: [{ bearerAuth: [] }] } }, controller.putSetting('oorwin'));
  app.put('/settings/email', { ...secure, schema: { tags: ['Admin'], security: [{ bearerAuth: [] }] } }, controller.putSetting('email'));
  app.put('/settings/security', { ...secure, schema: { tags: ['Admin'], security: [{ bearerAuth: [] }] } }, controller.putSetting('security'));
  app.put('/settings/scoring', { ...secure, schema: { tags: ['Admin'], security: [{ bearerAuth: [] }] } }, controller.putSetting('scoring'));
  app.put('/settings/prompts', { ...secure, schema: { tags: ['Admin'], security: [{ bearerAuth: [] }] } }, controller.putSetting('prompts'));
  app.put('/settings/pricing', { ...secure, schema: { tags: ['Admin'], security: [{ bearerAuth: [] }] } }, controller.putSetting('pricing'));
  app.put('/settings/notifications', { ...secure, schema: { tags: ['Admin'], security: [{ bearerAuth: [] }] } }, controller.putSetting('notifications'));
  app.put('/settings/integrations', { ...secure, schema: { tags: ['Admin'], security: [{ bearerAuth: [] }] } }, controller.putSetting('integrations'));
  app.put('/settings/commercials', { ...secure, schema: { tags: ['Admin'], security: [{ bearerAuth: [] }] } }, controller.putSetting('commercials'));
}

export { adminRoutes as default };

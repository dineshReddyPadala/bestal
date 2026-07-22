import {
  apiAction,
  apiCreate,
  apiGet,
  apiList,
  apiRequest,
  apiUpdate,
  type ListQuery,
} from './client';

export const adminApi = {
  dashboard: () => apiGet<Record<string, unknown>>('/admin/dashboard'),

  listUsers: (query?: ListQuery) => apiList<Record<string, unknown>>('/admin/users', query),
  getUser: (id: number) => apiGet<Record<string, unknown>>(`/admin/users/${id}`),
  createUser: (body: Record<string, unknown>) =>
    apiCreate<Record<string, unknown>>('/admin/users', body),
  updateUser: async (id: number, body: Record<string, unknown>) => {
    const json = await apiRequest<{ data: Record<string, unknown> }>(`/admin/users/${id}`, {
      method: 'PUT',
      body,
    });
    return json.data;
  },
  setUserStatus: async (id: number, isActive: boolean) => {
    const json = await apiRequest<{ data: Record<string, unknown> }>(
      `/admin/users/${id}/status`,
      { method: 'PATCH', body: { isActive } },
    );
    return json.data;
  },
  resetUserPassword: (id: number) =>
    apiAction<Record<string, unknown>>(`/admin/users/${id}/reset-password`),
  resendInvite: (id: number) =>
    apiAction<Record<string, unknown>>(`/admin/users/${id}/resend-invite`),
  deleteUser: (id: number) =>
    apiRequest<{ data: { message: string } }>(`/admin/users/${id}`, { method: 'DELETE' }),

  listClients: (query?: ListQuery) => apiList<Record<string, unknown>>('/admin/clients', query),
  getClient: (id: number) => apiGet<Record<string, unknown>>(`/admin/clients/${id}`),
  createClient: (body: Record<string, unknown>) =>
    apiCreate<Record<string, unknown>>('/admin/clients', body),
  updateClient: async (id: number, body: Record<string, unknown>) => {
    const json = await apiRequest<{ data: Record<string, unknown> }>(`/admin/clients/${id}`, {
      method: 'PUT',
      body,
    });
    return json.data;
  },
  setClientStatus: async (id: number, status: string) => {
    const json = await apiRequest<{ data: Record<string, unknown> }>(
      `/admin/clients/${id}/status`,
      { method: 'PATCH', body: { status } },
    );
    return json.data;
  },
  assignAccountManager: async (id: number, accountManagerId: number | null) => {
    const json = await apiRequest<{ data: Record<string, unknown> }>(
      `/admin/clients/${id}/account-manager`,
      { method: 'PATCH', body: { accountManagerId } },
    );
    return json.data;
  },

  listCandidates: (query?: ListQuery) =>
    apiList<Record<string, unknown>>('/admin/candidates', query),
  listPendingCandidates: (query?: ListQuery) =>
    apiList<Record<string, unknown>>('/admin/candidates/pending', query),
  getCandidate: (id: number) => apiGet<Record<string, unknown>>(`/admin/candidates/${id}`),
  approveCandidate: async (id: number) => {
    const json = await apiRequest<{ data: Record<string, unknown> }>(
      `/admin/candidates/${id}/approve`,
      { method: 'PATCH', body: {} },
    );
    return json.data;
  },
  approveCandidateInternal: async (id: number) => {
    const json = await apiRequest<{ data: Record<string, unknown> }>(
      `/admin/candidates/${id}/approve-internal`,
      { method: 'PATCH', body: {} },
    );
    return json.data;
  },
  rejectCandidate: async (id: number, reason: string) => {
    const json = await apiRequest<{ data: Record<string, unknown> }>(
      `/admin/candidates/${id}/reject`,
      { method: 'PATCH', body: { reason } },
    );
    return json.data;
  },
  hideCandidate: async (id: number) => {
    const json = await apiRequest<{ data: Record<string, unknown> }>(
      `/admin/candidates/${id}/hide`,
      { method: 'PATCH', body: {} },
    );
    return json.data;
  },
  publishCandidate: async (id: number) => {
    const json = await apiRequest<{ data: Record<string, unknown> }>(
      `/admin/candidates/${id}/publish`,
      { method: 'PATCH', body: {} },
    );
    return json.data;
  },
  archiveCandidate: async (id: number) => {
    const json = await apiRequest<{ data: Record<string, unknown> }>(
      `/admin/candidates/${id}/archive`,
      { method: 'PATCH', body: {} },
    );
    return json.data;
  },
  updateCandidatePricing: async (id: number, body: Record<string, unknown>) => {
    const json = await apiRequest<{ data: Record<string, unknown> }>(
      `/admin/candidates/${id}/pricing`,
      { method: 'PATCH', body },
    );
    return json.data;
  },
  sendBackCandidate: async (id: number, reason?: string) => {
    const json = await apiRequest<{ data: Record<string, unknown> }>(
      `/admin/candidates/${id}/send-back`,
      { method: 'PATCH', body: { reason } },
    );
    return json.data;
  },

  listSkillCommunities: (query?: ListQuery) =>
    apiList<Record<string, unknown>>('/admin/skill-communities', query),
  createSkillCommunity: (body: Record<string, unknown>) =>
    apiCreate<Record<string, unknown>>('/admin/skill-communities', body),
  updateSkillCommunity: async (id: number, body: Record<string, unknown>) => {
    const json = await apiRequest<{ data: Record<string, unknown> }>(
      `/admin/skill-communities/${id}`,
      { method: 'PUT', body },
    );
    return json.data;
  },
  setSkillCommunityStatus: async (id: number, isActive: boolean) => {
    const json = await apiRequest<{ data: Record<string, unknown> }>(
      `/admin/skill-communities/${id}/status`,
      { method: 'PATCH', body: { isActive } },
    );
    return json.data;
  },
  deleteSkillCommunity: (id: number) =>
    apiRequest<{ data: { message: string } }>(`/admin/skill-communities/${id}`, {
      method: 'DELETE',
    }),

  listTrials: (query?: ListQuery) => apiList<Record<string, unknown>>('/admin/trials', query),
  getTrial: (id: number) => apiGet<Record<string, unknown>>(`/admin/trials/${id}`),
  approveTrial: async (id: number, recruiterId?: number) => {
    const json = await apiRequest<{ data: Record<string, unknown> }>(
      `/admin/trials/${id}/approve`,
      { method: 'PATCH', body: { recruiterId } },
    );
    return json.data;
  },
  rejectTrial: async (id: number, reason: string) => {
    const json = await apiRequest<{ data: Record<string, unknown> }>(
      `/admin/trials/${id}/reject`,
      { method: 'PATCH', body: { reason } },
    );
    return json.data;
  },
  assignTrial: async (id: number, recruiterId: number) => {
    const json = await apiRequest<{ data: Record<string, unknown> }>(
      `/admin/trials/${id}/assign`,
      { method: 'PATCH', body: { recruiterId } },
    );
    return json.data;
  },
  convertTrial: async (id: number, createDeployment = true) => {
    const json = await apiRequest<{ data: Record<string, unknown> }>(
      `/admin/trials/${id}/convert`,
      { method: 'PATCH', body: { createDeployment } },
    );
    return json.data;
  },

  listDeployments: (query?: ListQuery) =>
    apiList<Record<string, unknown>>('/admin/deployments', query),
  getDeployment: (id: number) => apiGet<Record<string, unknown>>(`/admin/deployments/${id}`),
  createDeployment: (body: Record<string, unknown>) =>
    apiCreate<Record<string, unknown>>('/admin/deployments', body),
  updateDeployment: async (id: number, body: Record<string, unknown>) => {
    const json = await apiRequest<{ data: Record<string, unknown> }>(
      `/admin/deployments/${id}`,
      { method: 'PUT', body },
    );
    return json.data;
  },
  pauseDeployment: async (id: number) => {
    const json = await apiRequest<{ data: Record<string, unknown> }>(
      `/admin/deployments/${id}/pause`,
      { method: 'PATCH', body: {} },
    );
    return json.data;
  },
  completeDeployment: async (id: number) => {
    const json = await apiRequest<{ data: Record<string, unknown> }>(
      `/admin/deployments/${id}/complete`,
      { method: 'PATCH', body: {} },
    );
    return json.data;
  },
  terminateDeployment: async (id: number, reason: string) => {
    const json = await apiRequest<{ data: Record<string, unknown> }>(
      `/admin/deployments/${id}/terminate`,
      { method: 'PATCH', body: { reason } },
    );
    return json.data;
  },
  extendDeployment: async (id: number, endDate: string) => {
    const json = await apiRequest<{ data: Record<string, unknown> }>(
      `/admin/deployments/${id}/extend`,
      { method: 'PATCH', body: { endDate } },
    );
    return json.data;
  },

  importOorwin: async (file: File) => {
    const form = new FormData();
    form.append('file', file, file.name);
    const json = await apiRequest<{ data: Record<string, unknown> }>('/admin/oorwin/import', {
      method: 'POST',
      body: form,
    });
    return json.data;
  },
  listOorwinHistory: (query?: ListQuery) =>
    apiList<Record<string, unknown>>('/admin/oorwin/history', query),
  getOorwinHistory: (id: number) =>
    apiGet<Record<string, unknown>>(`/admin/oorwin/history/${id}`),

  reportCandidates: () => apiGet<Record<string, unknown>>('/admin/reports/candidates'),
  reportRecruiters: () => apiGet<Record<string, unknown>>('/admin/reports/recruiters'),
  reportClients: () => apiGet<Record<string, unknown>>('/admin/reports/clients'),
  reportRevenue: () => apiGet<Record<string, unknown>>('/admin/reports/revenue'),

  listAuditLogs: (query?: ListQuery) =>
    apiList<Record<string, unknown>>('/admin/audit-logs', query),
  getAuditLog: (id: number) => apiGet<Record<string, unknown>>(`/admin/audit-logs/${id}`),

  getSettings: () => apiGet<Record<string, unknown>>('/admin/settings'),
  putSetting: async (
    key:
      | 'ai'
      | 'oorwin'
      | 'email'
      | 'security'
      | 'scoring'
      | 'prompts'
      | 'pricing'
      | 'notifications'
      | 'integrations'
      | 'commercials',
    body: unknown,
  ) => {
    const json = await apiRequest<{ data: Record<string, unknown> }>(`/admin/settings/${key}`, {
      method: 'PUT',
      body,
    });
    return json.data;
  },

  listRoles: () => apiList<Record<string, unknown>>('/admin/roles'),
  getRoleCatalog: () =>
    apiGet<{
      permissions: string[];
      portals: string[];
      baseRoles: string[];
    }>('/admin/roles/catalog'),
  getRole: (code: string) => apiGet<Record<string, unknown>>(`/admin/roles/${encodeURIComponent(code)}`),
  createRole: (body: Record<string, unknown>) =>
    apiCreate<Record<string, unknown>>('/admin/roles', body),
  updateRole: async (code: string, body: Record<string, unknown>) => {
    const json = await apiRequest<{ data: Record<string, unknown> }>(
      `/admin/roles/${encodeURIComponent(code)}`,
      { method: 'PUT', body },
    );
    return json.data;
  },
  deleteRole: (code: string) =>
    apiRequest<{ data: { message: string } }>(`/admin/roles/${encodeURIComponent(code)}`, {
      method: 'DELETE',
    }),
};

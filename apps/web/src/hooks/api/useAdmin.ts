import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../lib/api/admin';
import type { ListQuery } from '../../lib/api/client';
import { jobRequestsApi } from '../../lib/api/job-requests';
import { queryKeys } from './query-keys';

export function useAdminDashboard() {
  return useQuery({
    queryKey: queryKeys.admin.dashboard,
    queryFn: () => adminApi.dashboard(),
  });
}

export function useAdminUsers(params?: ListQuery) {
  return useQuery({
    queryKey: queryKeys.admin.users(params),
    queryFn: () => adminApi.listUsers(params),
  });
}

export function useAdminUser(id: number) {
  return useQuery({
    queryKey: queryKeys.admin.user(id),
    queryFn: () => adminApi.getUser(id),
    enabled: id > 0,
  });
}

export function useAdminClients(params?: ListQuery) {
  return useQuery({
    queryKey: queryKeys.admin.clients(params),
    queryFn: () => adminApi.listClients(params),
  });
}

export function useAdminClient(id: number) {
  return useQuery({
    queryKey: queryKeys.admin.client(id),
    queryFn: () => adminApi.getClient(id),
    enabled: id > 0,
  });
}

export function useAdminCandidates(params?: ListQuery) {
  return useQuery({
    queryKey: queryKeys.admin.candidates(params),
    queryFn: () => adminApi.listCandidates(params),
  });
}

export function useAdminPendingCandidates(params?: ListQuery) {
  return useQuery({
    queryKey: queryKeys.admin.candidates({ ...params, pending: true }),
    queryFn: () => adminApi.listPendingCandidates(params),
  });
}

export function useAdminCandidate(id: number) {
  return useQuery({
    queryKey: queryKeys.admin.candidate(id),
    queryFn: () => adminApi.getCandidate(id),
    enabled: id > 0,
  });
}

export function useAdminSkillCommunities(params?: ListQuery) {
  return useQuery({
    queryKey: queryKeys.admin.skillCommunities(params),
    queryFn: () => adminApi.listSkillCommunities(params),
  });
}

export function useAdminIcons(params?: ListQuery) {
  return useQuery({
    queryKey: queryKeys.admin.icons(params),
    queryFn: () => adminApi.listIcons(params),
  });
}

export function useAdminIcon(id: number) {
  return useQuery({
    queryKey: queryKeys.admin.icon(id),
    queryFn: () => adminApi.getIcon(id),
    enabled: id > 0,
  });
}

export function useAdminTrials(params?: ListQuery) {
  return useQuery({
    queryKey: queryKeys.admin.trials(params),
    queryFn: () => adminApi.listTrials(params),
  });
}

export function useAdminDeployments(params?: ListQuery) {
  return useQuery({
    queryKey: queryKeys.admin.deployments(params),
    queryFn: () => adminApi.listDeployments(params),
  });
}

export function useAdminOorwinHistory(params?: ListQuery) {
  return useQuery({
    queryKey: queryKeys.admin.oorwinHistory(params),
    queryFn: () => adminApi.listOorwinHistory(params),
  });
}

export function useAdminReport(kind: 'candidates' | 'recruiters' | 'clients' | 'revenue') {
  return useQuery({
    queryKey: queryKeys.admin.reports(kind),
    queryFn: () => {
      switch (kind) {
        case 'candidates':
          return adminApi.reportCandidates();
        case 'recruiters':
          return adminApi.reportRecruiters();
        case 'clients':
          return adminApi.reportClients();
        case 'revenue':
          return adminApi.reportRevenue();
      }
    },
  });
}

export function useAdminAuditLogs(params?: ListQuery) {
  return useQuery({
    queryKey: queryKeys.admin.auditLogs(params),
    queryFn: () => adminApi.listAuditLogs(params),
  });
}

export function useAdminSettings() {
  return useQuery({
    queryKey: queryKeys.admin.settings,
    queryFn: () => adminApi.getSettings(),
  });
}

export function useAdminRoles(params?: ListQuery) {
  return useQuery({
    queryKey: queryKeys.admin.rolesList(params),
    queryFn: () => adminApi.listRoles(params),
  });
}

export function useAdminRole(code: string | undefined) {
  return useQuery({
    queryKey: queryKeys.admin.role(code ?? ''),
    queryFn: () => adminApi.getRole(code!),
    enabled: Boolean(code),
  });
}

export function useAdminRoleUsers(code: string | undefined, params?: ListQuery) {
  return useQuery({
    queryKey: queryKeys.admin.roleUsers(code ?? '', params),
    queryFn: () => adminApi.listRoleUsers(code!, params),
    enabled: Boolean(code),
  });
}

export function useAdminRoleCatalog() {
  return useQuery({
    queryKey: queryKeys.admin.roleCatalog,
    queryFn: () => adminApi.getRoleCatalog(),
  });
}

export function useClientEnquiries(params?: ListQuery) {
  return useQuery({
    queryKey: queryKeys.clientEnquiries.list(params),
    queryFn: () => jobRequestsApi.list(params),
  });
}

export function useClientEnquiry(id: number) {
  return useQuery({
    queryKey: queryKeys.clientEnquiries.detail(id),
    queryFn: () => jobRequestsApi.get(id),
    enabled: id > 0,
  });
}

export function useClientEnquiryMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: queryKeys.clientEnquiries.all });

  return {
    update: useMutation({
      mutationFn: ({ id, body }: { id: number; body: Record<string, unknown> }) =>
        jobRequestsApi.update(id, body),
      onSuccess: invalidate,
    }),
  };
}

export function useAdminMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: queryKeys.admin.all });

  return {
    invalidate,
    createUser: useMutation({ mutationFn: adminApi.createUser, onSuccess: invalidate }),
    updateUser: useMutation({
      mutationFn: ({ id, body }: { id: number; body: Record<string, unknown> }) =>
        adminApi.updateUser(id, body),
      onSuccess: invalidate,
    }),
    setUserStatus: useMutation({
      mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
        adminApi.setUserStatus(id, isActive),
      onSuccess: invalidate,
    }),
    resetUserPassword: useMutation({
      mutationFn: (id: number) => adminApi.resetUserPassword(id),
      onSuccess: invalidate,
    }),
    resendInvite: useMutation({
      mutationFn: (id: number) => adminApi.resendInvite(id),
      onSuccess: invalidate,
    }),
    deleteUser: useMutation({
      mutationFn: (id: number) => adminApi.deleteUser(id),
      onSuccess: invalidate,
    }),
    createClient: useMutation({ mutationFn: adminApi.createClient, onSuccess: invalidate }),
    updateClient: useMutation({
      mutationFn: ({ id, body }: { id: number; body: Record<string, unknown> }) =>
        adminApi.updateClient(id, body),
      onSuccess: invalidate,
    }),
    setClientStatus: useMutation({
      mutationFn: ({ id, status }: { id: number; status: string }) =>
        adminApi.setClientStatus(id, status),
      onSuccess: invalidate,
    }),
    assignAccountManager: useMutation({
      mutationFn: ({
        id,
        accountManagerId,
      }: {
        id: number;
        accountManagerId: number | null;
      }) => adminApi.assignAccountManager(id, accountManagerId),
      onSuccess: invalidate,
    }),
    approveCandidate: useMutation({
      mutationFn: (id: number) => adminApi.approveCandidate(id),
      onSuccess: invalidate,
    }),
    approveCandidateInternal: useMutation({
      mutationFn: (id: number) => adminApi.approveCandidateInternal(id),
      onSuccess: invalidate,
    }),
    rejectCandidate: useMutation({
      mutationFn: ({ id, reason }: { id: number; reason: string }) =>
        adminApi.rejectCandidate(id, reason),
      onSuccess: invalidate,
    }),
    hideCandidate: useMutation({
      mutationFn: (id: number) => adminApi.hideCandidate(id),
      onSuccess: invalidate,
    }),
    publishCandidate: useMutation({
      mutationFn: (id: number) => adminApi.publishCandidate(id),
      onSuccess: invalidate,
    }),
    archiveCandidate: useMutation({
      mutationFn: (id: number) => adminApi.archiveCandidate(id),
      onSuccess: invalidate,
    }),
    unarchiveCandidate: useMutation({
      mutationFn: (id: number) => adminApi.unarchiveCandidate(id),
      onSuccess: invalidate,
    }),
    sendBackCandidate: useMutation({
      mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
        adminApi.sendBackCandidate(id, reason),
      onSuccess: invalidate,
    }),
    createSkillCommunity: useMutation({
      mutationFn: adminApi.createSkillCommunity,
      onSuccess: invalidate,
    }),
    updateSkillCommunity: useMutation({
      mutationFn: ({ id, body }: { id: number; body: Record<string, unknown> }) =>
        adminApi.updateSkillCommunity(id, body),
      onSuccess: invalidate,
    }),
    setSkillCommunityStatus: useMutation({
      mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
        adminApi.setSkillCommunityStatus(id, isActive),
      onSuccess: invalidate,
    }),
    deleteSkillCommunity: useMutation({
      mutationFn: (id: number) => adminApi.deleteSkillCommunity(id),
      onSuccess: invalidate,
    }),
    uploadSkillCommunityIcon: useMutation({
      mutationFn: ({ id, file }: { id: number; file: File }) =>
        adminApi.uploadSkillCommunityIcon(id, file),
      onSuccess: invalidate,
    }),
    createIcon: useMutation({
      mutationFn: ({ name, file }: { name: string; file: File }) =>
        adminApi.createIcon(name, file),
      onSuccess: invalidate,
    }),
    uploadIconFile: useMutation({
      mutationFn: ({ id, file }: { id: number; file: File }) =>
        adminApi.uploadIconFile(id, file),
      onSuccess: invalidate,
    }),
    updateIcon: useMutation({
      mutationFn: ({ id, body }: { id: number; body: Record<string, unknown> }) =>
        adminApi.updateIcon(id, body),
      onSuccess: invalidate,
    }),
    deleteIcon: useMutation({
      mutationFn: (id: number) => adminApi.deleteIcon(id),
      onSuccess: invalidate,
    }),
    approveTrial: useMutation({
      mutationFn: ({ id, recruiterId }: { id: number; recruiterId?: number }) =>
        adminApi.approveTrial(id, recruiterId),
      onSuccess: invalidate,
    }),
    rejectTrial: useMutation({
      mutationFn: ({ id, reason }: { id: number; reason: string }) =>
        adminApi.rejectTrial(id, reason),
      onSuccess: invalidate,
    }),
    assignTrial: useMutation({
      mutationFn: ({ id, recruiterId }: { id: number; recruiterId: number }) =>
        adminApi.assignTrial(id, recruiterId),
      onSuccess: invalidate,
    }),
    convertTrial: useMutation({
      mutationFn: (id: number) => adminApi.convertTrial(id),
      onSuccess: invalidate,
    }),
    pauseDeployment: useMutation({
      mutationFn: (id: number) => adminApi.pauseDeployment(id),
      onSuccess: invalidate,
    }),
    completeDeployment: useMutation({
      mutationFn: (id: number) => adminApi.completeDeployment(id),
      onSuccess: invalidate,
    }),
    terminateDeployment: useMutation({
      mutationFn: ({ id, reason }: { id: number; reason: string }) =>
        adminApi.terminateDeployment(id, reason),
      onSuccess: invalidate,
    }),
    extendDeployment: useMutation({
      mutationFn: ({ id, endDate }: { id: number; endDate: string }) =>
        adminApi.extendDeployment(id, endDate),
      onSuccess: invalidate,
    }),
    importOorwin: useMutation({
      mutationFn: (file: File) => adminApi.importOorwin(file),
      onSuccess: invalidate,
    }),
    putSetting: useMutation({
      mutationFn: ({
        key,
        body,
      }: {
        key:
          | 'oorwin'
          | 'email'
          | 'security'
          | 'scoring'
          | 'pricing'
          | 'trials'
          | 'notifications'
          | 'integrations'
          | 'commercials'
          | 'workflows'
          | 'localization'
          | 'storage';
        body: unknown;
      }) => adminApi.putSetting(key, body),
      onSuccess: invalidate,
    }),
    createRole: useMutation({
      mutationFn: (body: Record<string, unknown>) => adminApi.createRole(body),
      onSuccess: invalidate,
    }),
    updateRole: useMutation({
      mutationFn: ({ code, body }: { code: string; body: Record<string, unknown> }) =>
        adminApi.updateRole(code, body),
      onSuccess: invalidate,
    }),
    deleteRole: useMutation({
      mutationFn: (code: string) => adminApi.deleteRole(code),
      onSuccess: invalidate,
    }),
    assignUserToRole: useMutation({
      mutationFn: ({
        code,
        userId,
        clientId,
      }: {
        code: string;
        userId: number;
        clientId?: number | null;
      }) => adminApi.assignUserToRole(code, { userId, clientId }),
      onSuccess: invalidate,
    }),
    unassignUserFromRole: useMutation({
      mutationFn: ({ code, userId }: { code: string; userId: number }) =>
        adminApi.unassignUserFromRole(code, userId),
      onSuccess: invalidate,
    }),
  };
}

export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  trials: {
    all: ['trials'] as const,
    list: (params?: Record<string, unknown>) => ['trials', 'list', params] as const,
    detail: (id: number) => ['trials', id] as const,
  },
  clients: {
    all: ['clients'] as const,
    list: (params?: Record<string, unknown>) => ['clients', 'list', params] as const,
    detail: (id: number) => ['clients', id] as const,
  },
  deployments: {
    all: ['deployments'] as const,
    list: (params?: Record<string, unknown>) => ['deployments', 'list', params] as const,
    detail: (id: number) => ['deployments', id] as const,
  },
  candidates: {
    all: ['candidates'] as const,
    list: (params?: Record<string, unknown>) => ['candidates', 'list', params] as const,
    detail: (id: number) => ['candidates', id] as const,
    publicFeatured: ['candidates', 'public-featured'] as const,
  },
  shortlists: {
    all: ['shortlists'] as const,
    list: (params?: Record<string, unknown>) => ['shortlists', 'list', params] as const,
    detail: (id: number) => ['shortlists', id] as const,
  },
  admin: {
    all: ['admin'] as const,
    dashboard: ['admin', 'dashboard'] as const,
    users: (params?: Record<string, unknown>) => ['admin', 'users', params] as const,
    user: (id: number) => ['admin', 'users', id] as const,
    clients: (params?: Record<string, unknown>) => ['admin', 'clients', params] as const,
    client: (id: number) => ['admin', 'clients', id] as const,
    candidates: (params?: Record<string, unknown>) => ['admin', 'candidates', params] as const,
    candidate: (id: number) => ['admin', 'candidates', id] as const,
    skillCommunities: (params?: Record<string, unknown>) =>
      ['admin', 'skill-communities', params] as const,
    icons: (params?: Record<string, unknown>) => ['admin', 'icons', params] as const,
    icon: (id: number) => ['admin', 'icons', id] as const,
    trials: (params?: Record<string, unknown>) => ['admin', 'trials', params] as const,
    deployments: (params?: Record<string, unknown>) => ['admin', 'deployments', params] as const,
    oorwinHistory: (params?: Record<string, unknown>) =>
      ['admin', 'oorwin-history', params] as const,
    reports: (kind: string) => ['admin', 'reports', kind] as const,
    auditLogs: (params?: Record<string, unknown>) => ['admin', 'audit-logs', params] as const,
    settings: ['admin', 'settings'] as const,
    roles: ['admin', 'roles'] as const,
    rolesList: (params?: Record<string, unknown>) => ['admin', 'roles', 'list', params] as const,
    role: (code: string) => ['admin', 'roles', code] as const,
    roleUsers: (code: string, params?: Record<string, unknown>) =>
      ['admin', 'roles', code, 'users', params] as const,
    roleCatalog: ['admin', 'roles', 'catalog'] as const,
  },
  clientEnquiries: {
    all: ['client-enquiries'] as const,
    list: (params?: Record<string, unknown>) => ['client-enquiries', 'list', params] as const,
    detail: (id: number) => ['client-enquiries', id] as const,
  },
  evaluations: {
    all: ['evaluations'] as const,
    list: (params?: Record<string, unknown>) => ['evaluations', 'list', params] as const,
  },
  backgroundChecks: {
    all: ['background-checks'] as const,
    list: (params?: Record<string, unknown>) => ['background-checks', 'list', params] as const,
  },
  search: {
    query: (q: string, types?: string) => ['search', q, types] as const,
  },
  users: {
    all: ['users'] as const,
    list: (params?: Record<string, unknown>) => ['users', 'list', params] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    list: (params?: Record<string, unknown>) => ['notifications', 'list', params] as const,
  },
  skillCommunities: {
    all: ['skill-communities'] as const,
    public: ['skill-communities', 'public'] as const,
  },
};

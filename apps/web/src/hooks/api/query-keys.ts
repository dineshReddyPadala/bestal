export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  trials: {
    all: ['trials'] as const,
    list: (params?: Record<string, unknown>) => ['trials', 'list', params] as const,
    detail: (id: number) => ['trials', id] as const,
  },
  interviews: {
    all: ['interviews'] as const,
    list: (params?: Record<string, unknown>) => ['interviews', 'list', params] as const,
    detail: (id: number) => ['interviews', id] as const,
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
  },
  shortlists: {
    all: ['shortlists'] as const,
    list: (params?: Record<string, unknown>) => ['shortlists', 'list', params] as const,
    detail: (id: number) => ['shortlists', id] as const,
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
  skillCommunities: {
    all: ['skill-communities'] as const,
  },
};

import type { MockOrganization } from './types.js';

export const organizations = [
  {
    id: 1,
    name: 'BesTal',
    slug: 'bestal',
    isActive: true,
    memberCount: 48,
    clientCount: 7,
    candidateCount: 12,
    createdAt: '2024-01-15T00:00:00Z',
  },
] as const satisfies readonly MockOrganization[];

export type Organizations = typeof organizations;

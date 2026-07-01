import type { MockOrganization } from './types.js';

export const organizations = [
  {
    id: 1,
    name: 'BesTal Global',
    slug: 'bestal-global',
    isActive: true,
    memberCount: 48,
    clientCount: 7,
    candidateCount: 12,
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 2,
    name: 'BesTal EMEA',
    slug: 'bestal-emea',
    isActive: true,
    memberCount: 12,
    clientCount: 3,
    candidateCount: 4,
    createdAt: '2025-03-01T00:00:00Z',
  },
  {
    id: 3,
    name: 'BesTal APAC',
    slug: 'bestal-apac',
    isActive: true,
    memberCount: 8,
    clientCount: 2,
    candidateCount: 3,
    createdAt: '2025-06-01T00:00:00Z',
  },
] as const satisfies readonly MockOrganization[];

export type Organizations = typeof organizations;

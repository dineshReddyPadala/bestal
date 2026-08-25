import type { SkillCommunityListItem } from './api/types';
import { disciplineToCommunityName } from './community-discipline';

export type ResolvedCommunity = {
  id: number;
  name: string;
};

type CommunityOption = Pick<SkillCommunityListItem, 'id' | 'name'>;

export function parseCommunityId(value: string | null | undefined): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function normalizeLabel(value: string): string {
  return value.trim().toLowerCase();
}

function findCommunityByName(
  communities: readonly CommunityOption[],
  label: string,
): CommunityOption | null {
  const normalized = normalizeLabel(label);
  if (!normalized) return null;

  const exact = communities.find((community) => normalizeLabel(community.name) === normalized);
  if (exact) return exact;

  const mappedName = disciplineToCommunityName(label);
  if (mappedName !== label) {
    const mapped = communities.find(
      (community) => normalizeLabel(community.name) === normalizeLabel(mappedName),
    );
    if (mapped) return mapped;
  }

  return null;
}

export function resolveCommunityFromParams(
  params: {
    communityId?: string | null;
    discipline?: string | null;
    q?: string | null;
  },
  communities: readonly CommunityOption[],
): ResolvedCommunity | null {
  const explicitId = parseCommunityId(params.communityId ?? null);
  if (explicitId != null) {
    const match = communities.find((community) => community.id === explicitId);
    return match ? { id: match.id, name: match.name } : null;
  }

  const discipline = params.discipline?.trim();
  if (discipline) {
    const match = findCommunityByName(communities, discipline);
    if (match) return { id: match.id, name: match.name };
  }

  const q = params.q?.trim();
  if (q) {
    const match = findCommunityByName(communities, q);
    if (match) return { id: match.id, name: match.name };
  }

  return null;
}

export function isCommunityNameQuery(
  query: string,
  communities: readonly CommunityOption[],
): boolean {
  return findCommunityByName(communities, query) != null;
}

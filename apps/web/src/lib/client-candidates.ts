import { candidates, getBestalScore } from '@bestal/mock-data';
import type { MockCandidate } from '@bestal/mock-data';
import { getEffectiveCandidate, isClientVisible } from './candidate-approval-overrides';

export type CandidateFilters = {
  query: string;
  community: string;
  minExperience: number;
  maxRate: number;
  availability: string;
  minScore: number;
};

export const DEFAULT_FILTERS: CandidateFilters = {
  query: '',
  community: 'all',
  minExperience: 0,
  maxRate: 250,
  availability: 'all',
  minScore: 0,
};

export function getClientVisibleCandidates(): MockCandidate[] {
  return candidates
    .map(getEffectiveCandidate)
    .filter((c) => isClientVisible(c.id));
}

export function getPrimaryCommunity(candidate: MockCandidate): string {
  const primary = candidate.skills.find((s) => s.isPrimary);
  return primary?.skillCommunityName ?? candidate.skills[0]?.skillCommunityName ?? '';
}

export function filterCandidates(
  list: MockCandidate[],
  filters: CandidateFilters,
): MockCandidate[] {
  const q = filters.query.trim().toLowerCase();

  return list.filter((candidate) => {
    const score = getBestalScore(candidate.id);
    const primaryCommunity = getPrimaryCommunity(candidate);

    if (q) {
      const haystack = [
        candidate.firstName,
        candidate.lastName,
        candidate.headline,
        candidate.location,
        ...candidate.skills.map((s) => s.skillCommunityName),
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    if (filters.community !== 'all' && primaryCommunity !== filters.community) {
      return false;
    }

    if (candidate.yearsExperience < filters.minExperience) return false;
    if (candidate.expectedRate > filters.maxRate) return false;
    if (score < filters.minScore) return false;

    if (filters.availability === 'immediate') {
      const available = new Date(candidate.availableFrom);
      const in30Days = new Date();
      in30Days.setDate(in30Days.getDate() + 30);
      if (available > in30Days) return false;
    }

    if (filters.availability === '2weeks') {
      const available = new Date(candidate.availableFrom);
      const in14Days = new Date();
      in14Days.setDate(in14Days.getDate() + 14);
      if (available > in14Days) return false;
    }

    return true;
  });
}

export function getScoreTier(score: number): 'elite' | 'strong' | 'good' {
  if (score >= 90) return 'elite';
  if (score >= 85) return 'strong';
  return 'good';
}

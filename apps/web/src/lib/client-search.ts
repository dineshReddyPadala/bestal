import type { ClientSearchRecord } from '@bestal/mock-data';
import { isBgvClear } from './candidate-approval-gates';

export type ClientSearchFilters = {
  query: string;
  community: string;
  role: string;
  experience: string;
  rate: string;
  availability: string;
  timezone: string;
  minScore: number;
  evaluation: string;
  bgv: string;
  trialEligible: string;
};

export type ClientSearchSort =
  | 'best-match'
  | 'highest-score'
  | 'lowest-rate'
  | 'experience'
  | 'availability';

export const DEFAULT_CLIENT_SEARCH_FILTERS: ClientSearchFilters = {
  query: '',
  community: 'all',
  role: 'all',
  experience: 'all',
  rate: 'all',
  availability: 'all',
  timezone: 'all',
  minScore: 0,
  evaluation: 'all',
  bgv: 'all',
  trialEligible: 'all',
};

function matchesBgvFilter(recordStatus: string, filter: string): boolean {
  if (filter === 'CLEAR') return isBgvClear(recordStatus);
  return recordStatus === filter;
}

export function filterClientSearchRecords(
  records: readonly ClientSearchRecord[],
  filters: ClientSearchFilters,
): ClientSearchRecord[] {
  const q = filters.query.trim().toLowerCase();

  return records.filter((r) => {
    if (q) {
      const haystack = [
        r.fullName,
        r.displayName,
        r.role,
        r.headline,
        r.location,
        r.community,
        r.currentCompany,
        r.currentTitle,
        ...r.skillNames,
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    if (filters.community !== 'all' && r.community !== filters.community) return false;
    if (filters.role !== 'all' && r.role !== filters.role) return false;

    if (filters.experience !== 'all') {
      const [min, max] = filters.experience.split('-').map(Number);
      if (r.yearsExperience < min || (max && r.yearsExperience > max)) return false;
    }

    if (filters.rate !== 'all') {
      const [min, max] = filters.rate.split('-').map(Number);
      if (r.hourlyRate < min || (max && r.hourlyRate > max)) return false;
    }

    if (filters.availability !== 'all' && r.availabilityCategory !== filters.availability) {
      return false;
    }

    if (filters.timezone !== 'all' && r.timezone !== filters.timezone) return false;
    if (r.bestalScore < filters.minScore) return false;
    if (filters.evaluation !== 'all' && r.evaluationStatus !== filters.evaluation) return false;
    if (filters.bgv !== 'all' && !matchesBgvFilter(r.bgvStatus, filters.bgv)) return false;

    if (filters.trialEligible === 'yes' && !r.trialEligible) return false;
    if (filters.trialEligible === 'no' && r.trialEligible) return false;

    return true;
  });
}

const AVAILABILITY_ORDER: Record<string, number> = {
  IMMEDIATE: 0,
  WITHIN_2_WEEKS: 1,
  WITHIN_30_DAYS: 2,
  WITHIN_60_DAYS: 3,
  NOT_AVAILABLE: 4,
};

export function sortClientSearchRecords(
  records: ClientSearchRecord[],
  sort: ClientSearchSort,
): ClientSearchRecord[] {
  const sorted = [...records];
  switch (sort) {
    case 'highest-score':
      sorted.sort((a, b) => b.bestalScore - a.bestalScore);
      break;
    case 'lowest-rate':
      sorted.sort((a, b) => a.hourlyRate - b.hourlyRate);
      break;
    case 'experience':
      sorted.sort((a, b) => b.yearsExperience - a.yearsExperience);
      break;
    case 'availability':
      sorted.sort(
        (a, b) =>
          (AVAILABILITY_ORDER[a.availabilityCategory] ?? 9) -
          (AVAILABILITY_ORDER[b.availabilityCategory] ?? 9),
      );
      break;
    case 'best-match':
    default:
      sorted.sort((a, b) => b.bestalScore - a.bestalScore);
      break;
  }
  return sorted;
}

export function countActiveFilters(filters: ClientSearchFilters): number {
  let n = 0;
  if (filters.query) n++;
  if (filters.community !== 'all') n++;
  if (filters.role !== 'all') n++;
  if (filters.experience !== 'all') n++;
  if (filters.rate !== 'all') n++;
  if (filters.availability !== 'all') n++;
  if (filters.timezone !== 'all') n++;
  if (filters.minScore > 0) n++;
  if (filters.evaluation !== 'all') n++;
  if (filters.bgv !== 'all') n++;
  if (filters.trialEligible !== 'all') n++;
  return n;
}

export function uniqueSorted(values: readonly string[]): string[] {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

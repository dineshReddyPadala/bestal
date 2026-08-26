import type { ClientSearchRecord } from '@bestal/mock-data';
import { resolveAvailabilityCategory } from './availability-display';

export type ClientSearchFilters = {
  query: string;
  community: string;
  experience: string;
  rate: string;
  availability: string;
  timezone: string;
  minScore: number;
};

export type ClientSearchSort =
  | 'best-match'
  | 'highest-score'
  | 'lowest-rate'
  | 'experience'
  | 'availability';

export const DEFAULT_CLIENT_SEARCH_SORT: Exclude<ClientSearchSort, 'best-match'> = 'highest-score';

export const CLIENT_SEARCH_SORT_OPTIONS: {
  value: Exclude<ClientSearchSort, 'best-match'>;
  label: string;
}[] = [
  { value: 'highest-score', label: 'Highest Score' },
  { value: 'lowest-rate', label: 'Lowest Rate' },
  { value: 'experience', label: 'Experience' },
  { value: 'availability', label: 'Availability' },
];

export const DEFAULT_CLIENT_SEARCH_FILTERS: ClientSearchFilters = {
  query: '',
  community: 'all',
  experience: 'all',
  rate: 'all',
  availability: 'all',
  timezone: 'all',
  minScore: 0,
};

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

    if (filters.experience !== 'all') {
      const [min, max] = filters.experience.split('-').map(Number);
      if (r.yearsExperience < min || (max && r.yearsExperience > max)) return false;
    }

    if (filters.rate !== 'all') {
      const [min, max] = filters.rate.split('-').map(Number);
      if (r.hourlyRate < min || (max && r.hourlyRate > max)) return false;
    }

    if (
      filters.availability !== 'all' &&
      resolveAvailabilityCategory(r) !== filters.availability
    ) {
      return false;
    }

    if (filters.timezone !== 'all' && r.timezone !== filters.timezone) return false;
    if (r.bestalScore < filters.minScore) return false;

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
          (AVAILABILITY_ORDER[resolveAvailabilityCategory(a)] ?? 9) -
          (AVAILABILITY_ORDER[resolveAvailabilityCategory(b)] ?? 9),
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
  if (filters.experience !== 'all') n++;
  if (filters.rate !== 'all') n++;
  if (filters.availability !== 'all') n++;
  if (filters.timezone !== 'all') n++;
  if (filters.minScore > 0) n++;
  return n;
}

export function uniqueSorted(values: readonly string[]): string[] {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

export type ClientSearchFilterChip = {
  key: keyof ClientSearchFilters;
  label: string;
};

const EXPERIENCE_LABELS: Record<string, string> = {
  '0-5': '0-5 yrs',
  '6-10': '6-10 yrs',
  '11-99': '11+ yrs',
};

const RATE_LABELS: Record<string, string> = {
  '0-100': '<$100/hr',
  '0-130': 'Under $130/hr',
  '130-160': '$130–160/hr',
  '160-999': '$160+/hr',
};

const AVAILABILITY_LABELS: Record<string, string> = {
  IMMEDIATE: 'Immediate',
  WITHIN_2_WEEKS: 'Within 2 weeks',
  NOT_AVAILABLE: 'Not available',
};

export function getActiveFilterChips(filters: ClientSearchFilters): ClientSearchFilterChip[] {
  const chips: ClientSearchFilterChip[] = [];
  if (filters.community !== 'all') {
    chips.push({ key: 'community', label: filters.community });
  }
  if (filters.experience !== 'all') {
    chips.push({
      key: 'experience',
      label: EXPERIENCE_LABELS[filters.experience] ?? filters.experience,
    });
  }
  if (filters.rate !== 'all') {
    chips.push({ key: 'rate', label: RATE_LABELS[filters.rate] ?? filters.rate });
  }
  if (filters.timezone !== 'all') {
    chips.push({
      key: 'timezone',
      label: filters.timezone.replace(/_/g, ' '),
    });
  }
  if (filters.availability !== 'all') {
    chips.push({
      key: 'availability',
      label: AVAILABILITY_LABELS[filters.availability] ?? filters.availability,
    });
  }
  if (filters.minScore > 0) {
    chips.push({ key: 'minScore', label: `${filters.minScore}+` });
  }
  if (filters.query.trim()) {
    chips.push({ key: 'query', label: `"${filters.query.trim()}"` });
  }
  return chips;
}

export function clearFilterChip(
  filters: ClientSearchFilters,
  key: keyof ClientSearchFilters,
): ClientSearchFilters {
  switch (key) {
    case 'query':
      return { ...filters, query: '' };
    case 'community':
      return { ...filters, community: 'all' };
    case 'experience':
      return { ...filters, experience: 'all' };
    case 'rate':
      return { ...filters, rate: 'all' };
    case 'availability':
      return { ...filters, availability: 'all' };
    case 'timezone':
      return { ...filters, timezone: 'all' };
    case 'minScore':
      return { ...filters, minScore: 0 };
    default:
      return filters;
  }
}

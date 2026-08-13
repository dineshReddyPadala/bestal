import type { ClientSearchRecord } from '@bestal/mock-data';

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

export const CLIENT_SEARCH_SCORE_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: '0', label: 'Any score' },
  { value: '70', label: '70+' },
  { value: '80', label: '80+' },
  { value: '90', label: '90+' },
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

function scoreValue(record: ClientSearchRecord): number | null {
  return record.bestalScore ?? null;
}

function rateValue(record: ClientSearchRecord): number | null {
  const rate = record.hourlyRate;
  return rate != null && rate > 0 ? rate : null;
}

function experienceValue(record: ClientSearchRecord): number | null {
  return record.yearsExperience ?? null;
}

function timezoneMatches(recordTz: string, filterTz: string): boolean {
  return recordTz.trim().toLowerCase() === filterTz.trim().toLowerCase();
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

    if (filters.experience !== 'all') {
      const years = experienceValue(r);
      if (years == null) return false;
      const [min, max] = filters.experience.split('-').map(Number);
      if (years < min || (Number.isFinite(max) && years > max)) return false;
    }

    if (filters.rate !== 'all') {
      const rate = rateValue(r);
      if (rate == null) return false;
      const [min, max] = filters.rate.split('-').map(Number);
      if (rate < min || (Number.isFinite(max) && rate > max)) return false;
    }

    if (filters.availability !== 'all' && r.availabilityCategory !== filters.availability) {
      return false;
    }

    if (filters.timezone !== 'all' && !timezoneMatches(r.timezone, filters.timezone)) {
      return false;
    }

    if (filters.minScore > 0) {
      const score = scoreValue(r);
      if (score == null || score < filters.minScore) return false;
    }

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

function compareNullableDesc(a: number | null, b: number | null): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  return b - a;
}

function compareNullableAsc(a: number | null, b: number | null): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  return a - b;
}

export function sortClientSearchRecords(
  records: ClientSearchRecord[],
  sort: ClientSearchSort,
): ClientSearchRecord[] {
  const sorted = [...records];
  switch (sort) {
    case 'highest-score':
      sorted.sort((a, b) => compareNullableDesc(scoreValue(a), scoreValue(b)));
      break;
    case 'lowest-rate':
      sorted.sort((a, b) => compareNullableAsc(rateValue(a), rateValue(b)));
      break;
    case 'experience':
      sorted.sort((a, b) => compareNullableDesc(experienceValue(a), experienceValue(b)));
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
      sorted.sort((a, b) => compareNullableDesc(scoreValue(a), scoreValue(b)));
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

const SCORE_LABELS: Record<number, string> = {
  70: '70+',
  80: '80+',
  90: '90+',
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
    chips.push({
      key: 'minScore',
      label: SCORE_LABELS[filters.minScore] ?? `${filters.minScore}+`,
    });
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

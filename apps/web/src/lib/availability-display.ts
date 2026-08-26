import { CANDIDATE_AVAILABILITY_LABELS } from '@bestal/shared-utils';

export type ClientAvailabilityRecord = {
  availabilityCategory: string;
  availability: string;
  availableFrom?: string | null;
};

function parseDateOnly(value: string): Date | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const iso = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    const year = Number(iso[1]);
    const month = Number(iso[2]) - 1;
    const day = Number(iso[3]);
    const date = new Date(year, month, day);
    if (
      date.getFullYear() === year &&
      date.getMonth() === month &&
      date.getDate() === day
    ) {
      return date;
    }
    return null;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function daysUntilAvailable(from: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.ceil((from.getTime() - startOfToday().getTime()) / msPerDay);
}

export function isAvailableFromDateReached(availableFrom: string | null | undefined): boolean {
  const from = availableFrom ? parseDateOnly(availableFrom) : null;
  if (!from) return false;
  return from.getTime() <= startOfToday().getTime();
}

export function isImmediatelyAvailable(record: ClientAvailabilityRecord): boolean {
  if (isAvailableFromDateReached(record.availableFrom)) return true;

  if (record.availabilityCategory === 'IMMEDIATE') return true;

  const normalized = record.availability.trim().toUpperCase().replace(/\s+/g, '_');
  if (normalized === 'AVAILABLE' || normalized === 'IMMEDIATE') return true;

  const lower = record.availability.toLowerCase();
  if (lower === 'available now' || lower === 'immediate' || lower === 'available') return true;
  if (lower.includes('available now') || lower.includes('available 24')) return true;

  return false;
}

export function resolveAvailabilityCategory(record: ClientAvailabilityRecord): string {
  if (isImmediatelyAvailable(record)) return 'IMMEDIATE';

  if (record.availableFrom) {
    const from = parseDateOnly(record.availableFrom);
    if (from) {
      const days = daysUntilAvailable(from);
      if (days <= 0) return 'IMMEDIATE';
      if (days <= 14) return 'WITHIN_2_WEEKS';
      if (days <= 30) return 'WITHIN_30_DAYS';
      if (days <= 60) return 'WITHIN_60_DAYS';
      return 'NOT_AVAILABLE';
    }
  }

  return record.availabilityCategory;
}

export function formatAvailabilityLabel(availability: string): string {
  const normalized = availability.trim().toUpperCase().replace(/\s+/g, '_');
  const label =
    CANDIDATE_AVAILABILITY_LABELS[
      normalized as keyof typeof CANDIDATE_AVAILABILITY_LABELS
    ];
  return label ?? availability;
}

export function resolveClientAvailabilityLabel(record: ClientAvailabilityRecord): string {
  if (isImmediatelyAvailable(record)) return 'Available Now';

  if (record.availableFrom) {
    const from = parseDateOnly(record.availableFrom);
    if (from && from.getTime() > startOfToday().getTime()) {
      return from.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
  }

  return formatAvailabilityLabel(record.availability);
}

export function availabilityStatusClasses(immediate: boolean): {
  text: string;
  dot: string;
} {
  if (immediate) {
    return {
      text: 'text-[#041e21]',
      dot: 'bg-[#041e21]',
    };
  }

  return {
    text: 'text-orange-700',
    dot: 'bg-orange-500',
  };
}

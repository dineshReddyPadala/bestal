import { CANDIDATE_AVAILABILITY_LABELS } from '@bestal/shared-utils';

type AvailabilityRecord = {
  availabilityCategory: string;
  availability: string;
};

export function isImmediatelyAvailable(record: AvailabilityRecord): boolean {
  if (record.availabilityCategory === 'IMMEDIATE') return true;

  const normalized = record.availability.trim().toUpperCase().replace(/\s+/g, '_');
  if (normalized === 'AVAILABLE' || normalized === 'IMMEDIATE') return true;

  const lower = record.availability.toLowerCase();
  if (lower === 'available now' || lower === 'immediate' || lower === 'available') return true;
  if (lower.includes('available now') || lower.includes('available 24')) return true;

  return false;
}

export function formatAvailabilityLabel(availability: string): string {
  const normalized = availability.trim().toUpperCase().replace(/\s+/g, '_');
  const label =
    CANDIDATE_AVAILABILITY_LABELS[
      normalized as keyof typeof CANDIDATE_AVAILABILITY_LABELS
    ];
  return label ?? availability;
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

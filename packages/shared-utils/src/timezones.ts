/** Shared timezone options for UI dropdowns and Excel import templates. */
export const TIMEZONE_OPTIONS = [
  { value: 'Asia/Kolkata', label: 'IST (Asia/Kolkata)' },
  { value: 'America/New_York', label: 'EST (America/New_York)' },
  { value: 'America/Chicago', label: 'CST (America/Chicago)' },
  { value: 'America/Los_Angeles', label: 'PST (America/Los_Angeles)' },
  { value: 'America/ANY', label: 'ANY (America/Any)' },
  { value: 'Europe/London', label: 'GMT (Europe/London)' },
  { value: 'Europe/Berlin', label: 'CET (Europe/Berlin)' },
  { value: 'Asia/Singapore', label: 'SGT (Asia/Singapore)' },
  { value: 'Australia/Sydney', label: 'AEST (Australia/Sydney)' },
  { value: 'UTC', label: 'UTC' },
] as const;

/** IANA / platform timezone values used in Excel import dropdowns. */
export const IMPORT_TIMEZONE_VALUES = TIMEZONE_OPTIONS.map((option) => option.value);

export type TimezoneOption = (typeof TIMEZONE_OPTIONS)[number];

/** Human-readable timezone for client cards and profile headers. */
export function formatTimezoneLabel(value: string | null | undefined): string {
  const raw = value?.trim();
  if (!raw) return '';
  if (raw.toLowerCase() === 'flexible') return '';
  const match = TIMEZONE_OPTIONS.find(
    (option) =>
      option.value.toLowerCase() === raw.toLowerCase() ||
      option.label.toLowerCase() === raw.toLowerCase(),
  );
  return match?.label ?? raw.replace(/_/g, ' ');
}

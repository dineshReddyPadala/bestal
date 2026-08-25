/** Matches Platform Settings → Free trial hours default in system-settings.reader.ts */
export const DEFAULT_FREE_TRIAL_HOURS = 20;

export type TrialPolicy = {
  freeTrialHours: number;
};

export function normalizeFreeTrialHours(value: number | null | undefined): number {
  if (value != null && value > 0) return value;
  return DEFAULT_FREE_TRIAL_HOURS;
}

export function formatFreeTrialHours(hours: number): string {
  return `${hours} hour${hours === 1 ? '' : 's'}`;
}

export function formatFreeTrialHoursHyphenated(hours: number): string {
  return `${hours}-hour`;
}

export function formatFreeTrialHoursTitle(hours: number): string {
  return `${hours} Hours`;
}

export function formatFirstFreeTrialHours(hours: number): string {
  return `the first ${formatFreeTrialHours(hours)}`;
}

export function formatUpToFreeTrialHours(hours: number): string {
  return `up to ${formatFreeTrialHours(hours)}`;
}

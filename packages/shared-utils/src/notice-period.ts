/** Parse notice period text or day count into calendar days for wizard display. */
export function parseNoticePeriodToDays(input: string | null | undefined): number | undefined {
  if (input == null) return undefined;
  const trimmed = String(input).trim();
  if (!trimmed) return undefined;

  const lower = trimmed.toLowerCase();
  const daysMatch = lower.match(/^(\d+(?:\.\d+)?)\s*days?$/);
  if (daysMatch) {
    const days = Number(daysMatch[1]);
    return Number.isFinite(days) && days > 0 ? Math.round(days) : undefined;
  }

  const weeksMatch = lower.match(/^(\d+(?:\.\d+)?)\s*weeks?$/);
  if (weeksMatch) {
    const weeks = Number(weeksMatch[1]);
    return Number.isFinite(weeks) && weeks > 0 ? Math.round(weeks * 7) : undefined;
  }

  const monthsMatch = lower.match(/^(\d+(?:\.\d+)?)\s*months?$/);
  if (monthsMatch) {
    const months = Number(monthsMatch[1]);
    return Number.isFinite(months) && months > 0 ? Math.round(months * 30) : undefined;
  }

  const numeric = Number(trimmed);
  if (Number.isFinite(numeric) && numeric > 0) {
    return Math.round(numeric);
  }

  return undefined;
}

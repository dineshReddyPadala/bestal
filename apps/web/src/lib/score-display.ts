/** Normalize a 1–10 or 0–100 dimension score to a two-digit display value (e.g. 9.2 → 92). */
export function formatDimensionScoreDisplay(value: number): string {
  const normalized = value <= 10 ? Math.round(value * 10) : Math.round(value);
  return String(normalized).padStart(2, '0');
}

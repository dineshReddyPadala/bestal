export type BgvCheckStatusFields = {
  idCheckStatus?: string | null;
  employmentCheckStatus?: string | null;
  criminalCheckStatus?: string | null;
};

const PLACEHOLDER_BGV_SUMMARY_PATTERNS = [
  /not yet been initiated/i,
  /not yet initiated/i,
  /bgv has not/i,
  /pending initiation/i,
  /not started/i,
];

/** Treat stale Excel / template placeholder text as empty for display. */
export function isPlaceholderBgvSummary(text: string | null | undefined): boolean {
  const trimmed = text?.trim();
  if (!trimmed) return true;
  return PLACEHOLDER_BGV_SUMMARY_PATTERNS.some((pattern) => pattern.test(trimmed));
}

export const BGV_PER_CHECK_STATUS_OPTIONS = [
  'CLEAR',
  'COMPLETED_CLEAR',
  'COMPLETED_WITH_CONCERN',
  'CONSIDER',
  'PENDING',
  'IN_PROGRESS',
  'CONSENT_PENDING',
  'INITIATED',
  'FAILED',
  'NOT_STARTED',
  'EXPIRED',
  'N/A',
] as const;

export function formatBgvStatusLabel(status: string): string {
  if (status === 'CLEAR' || status === 'COMPLETED_CLEAR') return 'Completed (Clear)';
  if (status === 'COMPLETED_WITH_CONCERN') return 'Completed (Concern)';
  return status.replace(/_/g, ' ');
}

/** Build a human-readable resultSummary from per-check statuses. */
export function formatBgvCheckStatusesSummary(fields: BgvCheckStatusFields): string {
  const lines = [
    `ID: ${fields.idCheckStatus?.trim() || 'N/A'}`,
    `Employment: ${fields.employmentCheckStatus?.trim() || 'N/A'}`,
    `Criminal: ${fields.criminalCheckStatus?.trim() || 'N/A'}`,
  ];
  return lines.join('\n');
}

export function hasAnyBgvCheckStatus(fields: BgvCheckStatusFields): boolean {
  return Boolean(
    fields.idCheckStatus?.trim() ||
      fields.employmentCheckStatus?.trim() ||
      fields.criminalCheckStatus?.trim(),
  );
}

/** Prefer stored summary unless it is a placeholder; otherwise format from check fields. */
export function displayBgvResultSummary(
  resultSummary: string | null | undefined,
  fields: BgvCheckStatusFields,
): string {
  if (resultSummary?.trim() && !isPlaceholderBgvSummary(resultSummary)) {
    return resultSummary.trim();
  }
  if (hasAnyBgvCheckStatus(fields)) {
    return formatBgvCheckStatusesSummary(fields);
  }
  return resultSummary?.trim() ?? '';
}

/** Resolve resultSummary for persistence: use narrative summary or build from check fields. */
export function resolveBgvResultSummaryForImport(
  bgvSummary: string | null | undefined,
  fields: BgvCheckStatusFields,
): string | null {
  if (bgvSummary?.trim() && !isPlaceholderBgvSummary(bgvSummary)) {
    return bgvSummary.trim();
  }
  if (hasAnyBgvCheckStatus(fields)) {
    return formatBgvCheckStatusesSummary(fields);
  }
  return bgvSummary?.trim() || null;
}

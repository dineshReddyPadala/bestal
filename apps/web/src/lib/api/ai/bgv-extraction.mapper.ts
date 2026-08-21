import type {
  BgvExtractionFormPatch,
  BgvExtractionResponse,
} from './bgv-extraction.types';

const BGV_TYPES = [
  'CRIMINAL',
  'EMPLOYMENT',
  'EDUCATION',
  'REFERENCE',
  'IDENTITY',
  'CREDIT',
  'COMPREHENSIVE',
] as const;

function normalizeCheckType(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const upper = value.trim().toUpperCase().replace(/\s+/g, '_');
  return (BGV_TYPES as readonly string[]).includes(upper) ? upper : undefined;
}

function formatCheckStatuses(extraction: BgvExtractionResponse): string {
  return [
    `ID: ${extraction.idCheckStatus ?? 'N/A'}`,
    `Employment: ${extraction.employmentCheckStatus ?? 'N/A'}`,
    `Criminal: ${extraction.criminalCheckStatus ?? 'N/A'}`,
  ].join('\n');
}

export function mapBgvExtractionToForm(
  extraction: BgvExtractionResponse,
): BgvExtractionFormPatch {
  return {
    vendorName: extraction.vendorName?.trim() || undefined,
    checkType: normalizeCheckType(extraction.checkType),
    aiBgvSummary: extraction.aiBgvSummary?.trim() || undefined,
    concernNotes: extraction.concernNotes?.trim() || undefined,
    resultSummary: formatCheckStatuses(extraction),
    initiatedAt: extraction.initiatedDate
      ? `${extraction.initiatedDate}T00:00:00.000Z`
      : undefined,
    completedAt: extraction.completedDate
      ? `${extraction.completedDate}T00:00:00.000Z`
      : undefined,
  };
}

import type { BgvExtractionResponse } from './bgv-extraction.types.js';

function asString(value: unknown): string | undefined {
  if (value == null) return undefined;
  const text = String(value).trim();
  return text || undefined;
}

function asNumber(value: unknown): number | undefined {
  if (value == null || value === '') return undefined;
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item)).filter(Boolean);
}

function pick(
  root: Record<string, unknown>,
  camel: string,
  snake: string,
): unknown {
  return root[camel] ?? root[snake];
}

function asDateOnly(value: unknown): string | undefined {
  if (value == null) return undefined;
  const text = String(value).trim();
  return text ? text.slice(0, 10) : undefined;
}

export function normalizeBgvExtractionResponse(raw: unknown): BgvExtractionResponse {
  const root = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;

  const summary =
    asString(pick(root, 'aiBgvSummary', 'ai_bgv_summary')) ??
    asString(pick(root, 'aiSummary', 'ai_summary')) ??
    '';

  return {
    jobId:
      asString(pick(root, 'jobId', 'job_id')) ??
      asString(root.id) ??
      `bgv-${Date.now()}`,
    confidence: asNumber(root.confidence) ?? 0.85,
    extractedAt:
      asString(pick(root, 'extractedAt', 'extracted_at')) ??
      asString(pick(root, 'createdAt', 'created_at')) ??
      new Date().toISOString(),
    id: asString(root.id),
    candidateId: asString(pick(root, 'candidateId', 'candidate_id')),
    vendorName: asString(pick(root, 'vendorName', 'vendor_name')),
    status: asString(root.status),
    idCheckStatus: asString(pick(root, 'idCheckStatus', 'id_check_status')),
    employmentCheckStatus: asString(
      pick(root, 'employmentCheckStatus', 'employment_check_status'),
    ),
    criminalCheckStatus: asString(
      pick(root, 'criminalCheckStatus', 'criminal_check_status'),
    ),
    reportUrl: asString(pick(root, 'reportUrl', 'report_url')) ?? null,
    aiBgvSummary: summary,
    concernNotes: asString(pick(root, 'concernNotes', 'concern_notes')),
    initiatedDate: asDateOnly(pick(root, 'initiatedDate', 'initiated_date')),
    completedDate: asDateOnly(pick(root, 'completedDate', 'completed_date')),
    checkType: asString(pick(root, 'checkType', 'check_type')),
    warnings: asStringArray(root.warnings),
  };
}

/** Build a human-readable resultSummary from per-check statuses. */
export function formatBgvCheckStatusesSummary(extraction: BgvExtractionResponse): string {
  const lines = [
    `ID: ${extraction.idCheckStatus ?? 'N/A'}`,
    `Employment: ${extraction.employmentCheckStatus ?? 'N/A'}`,
    `Criminal: ${extraction.criminalCheckStatus ?? 'N/A'}`,
  ];
  return lines.join('\n');
}

/** Pretty-printed JSON stored on background_checks.ai_summary for the review UI. */
export function formatBgvAiSummaryJson(
  extraction: BgvExtractionResponse,
  meta?: { provider?: string | null; checkType?: string | null; liveAi?: boolean },
): string {
  return JSON.stringify(
    {
      status: extraction.status ?? 'UNKNOWN',
      confidence: extraction.confidence,
      provider: extraction.vendorName ?? meta?.provider ?? null,
      package: extraction.checkType ?? meta?.checkType ?? null,
      checks: [
        { name: 'Identity', result: extraction.idCheckStatus ?? 'N/A' },
        { name: 'Employment', result: extraction.employmentCheckStatus ?? 'N/A' },
        { name: 'Criminal', result: extraction.criminalCheckStatus ?? 'N/A' },
      ],
      summary: extraction.aiBgvSummary ?? '',
      concernNotes: extraction.concernNotes ?? '',
      warnings: extraction.warnings,
      liveAi: meta?.liveAi ?? true,
      generatedAt: extraction.extractedAt || new Date().toISOString(),
    },
    null,
    2,
  );
}

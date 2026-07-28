import type {
  BgvExtractionRequestBody,
  BgvExtractionResponse,
} from './bgv-extraction.types.js';

export type {
  BgvExtractionRequestBody,
  BgvExtractionResponse,
} from './bgv-extraction.types.js';

const STATIC_BGV_EXTRACTION: BgvExtractionResponse = {
  jobId: 'bgv-demo-001',
  confidence: 0.88,
  extractedAt: new Date().toISOString(),
  id: 'bgv-static-id',
  vendorName: 'VerifyCorp Screening',
  status: 'CLEAR',
  idCheckStatus: 'CLEAR',
  addressCheckStatus: 'CLEAR',
  employmentCheckStatus: 'CLEAR',
  educationCheckStatus: 'CLEAR',
  criminalCheckStatus: 'CLEAR',
  referenceCheckStatus: 'CLEAR',
  reportUrl: null,
  aiBgvSummary:
    'Comprehensive background verification completed with no adverse findings across identity, address, employment, education, criminal, and reference checks.',
  concernNotes: '',
  initiatedDate: new Date().toISOString().slice(0, 10),
  completedDate: new Date().toISOString().slice(0, 10),
  checkType: 'COMPREHENSIVE',
  warnings: ['Demo BGV extraction — configure AI_BGV_URL for live AI.'],
};

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
    addressCheckStatus: asString(pick(root, 'addressCheckStatus', 'address_check_status')),
    employmentCheckStatus: asString(
      pick(root, 'employmentCheckStatus', 'employment_check_status'),
    ),
    educationCheckStatus: asString(
      pick(root, 'educationCheckStatus', 'education_check_status'),
    ),
    criminalCheckStatus: asString(
      pick(root, 'criminalCheckStatus', 'criminal_check_status'),
    ),
    referenceCheckStatus: asString(
      pick(root, 'referenceCheckStatus', 'reference_check_status'),
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

export class BgvExtractionClient {
  constructor(private readonly aiBgvUrl: string | null) {}

  get isLiveAiConfigured(): boolean {
    return Boolean(this.aiBgvUrl);
  }

  /**
   * - No AI_BGV_URL → hardcoded static response.
   * - AI_BGV_URL set → POST to Python ai-service and normalize.
   */
  async extract(request: BgvExtractionRequestBody): Promise<BgvExtractionResponse> {
    if (!this.aiBgvUrl) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return {
        ...STATIC_BGV_EXTRACTION,
        jobId: `bgv-static-${Date.now()}`,
        extractedAt: new Date().toISOString(),
        warnings: [
          ...STATIC_BGV_EXTRACTION.warnings,
          `Static AI response for "${request.fileName}" — AI_BGV_URL is not configured.`,
        ],
      };
    }

    const response = await fetch(this.aiBgvUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        fileName: request.fileName,
        mimeType: request.mimeType,
        content: request.content,
        ...(request.candidateId ? { candidateId: request.candidateId } : {}),
        ...(request.jobId ? { jobId: request.jobId } : {}),
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new Error(
        detail
          ? `AI BGV extraction failed: ${detail}`
          : `AI BGV extraction failed: ${response.status} ${response.statusText}`,
      );
    }

    return normalizeBgvExtractionResponse(await response.json());
  }
}

export function bufferToBase64(buffer: Buffer): string {
  return buffer.toString('base64');
}

/** Build a human-readable resultSummary from per-check statuses. */
export function formatBgvCheckStatusesSummary(extraction: BgvExtractionResponse): string {
  const lines = [
    `ID: ${extraction.idCheckStatus ?? 'N/A'}`,
    `Address: ${extraction.addressCheckStatus ?? 'N/A'}`,
    `Employment: ${extraction.employmentCheckStatus ?? 'N/A'}`,
    `Education: ${extraction.educationCheckStatus ?? 'N/A'}`,
    `Criminal: ${extraction.criminalCheckStatus ?? 'N/A'}`,
    `Reference: ${extraction.referenceCheckStatus ?? 'N/A'}`,
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
        { name: 'Address', result: extraction.addressCheckStatus ?? 'N/A' },
        { name: 'Employment', result: extraction.employmentCheckStatus ?? 'N/A' },
        { name: 'Education', result: extraction.educationCheckStatus ?? 'N/A' },
        { name: 'Criminal', result: extraction.criminalCheckStatus ?? 'N/A' },
        { name: 'Reference', result: extraction.referenceCheckStatus ?? 'N/A' },
      ],
      summary: extraction.aiBgvSummary ?? '',
      concernNotes: extraction.concernNotes ?? '',
      warnings: extraction.warnings,
      liveAi: meta?.liveAi ?? false,
      generatedAt: extraction.extractedAt || new Date().toISOString(),
    },
    null,
    2,
  );
}

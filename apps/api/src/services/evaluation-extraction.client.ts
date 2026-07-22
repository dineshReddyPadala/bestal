import type {
  EvaluationExtractionRequestBody,
  EvaluationExtractionResponse,
} from './evaluation-extraction.types.js';

export type {
  EvaluationExtractionRequestBody,
  EvaluationExtractionResponse,
} from './evaluation-extraction.types.js';

const STATIC_EVALUATION_EXTRACTION: EvaluationExtractionResponse = {
  jobId: 'eval-demo-001',
  confidence: 0.89,
  extractedAt: new Date().toISOString(),
  extractedText:
    'Technical interview evaluation for senior full-stack role. Strong system design and communication. Minor gaps in platform-specific tooling.',
  evaluatorName: 'Dr. Alan Wright',
  evaluatorCompany: 'Amnet Digital',
  evaluationType: 'Live Technical Interview',
  evaluationDate: new Date().toISOString().slice(0, 10),
  technicalScore: 88,
  communicationScore: 92,
  problemSolvingScore: 85,
  architectureScore: 90,
  clientReadinessScore: 87,
  recommendation: 'Hire',
  evaluatorComments:
    'Candidate demonstrated strong ownership, clear communication, and solid architecture reasoning under time pressure.',
  aiEvaluationSummary:
    'Strong hire profile: excellent communication and architecture skills with consistent technical depth. Recommended for client-facing senior engineering roles after minor platform onboarding.',
  warnings: ['Evaluator name inferred from document header — verify before saving.'],
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

/**
 * Normalizes Python ai-service evaluation JSON (camelCase or snake_case) into the web contract.
 */
export function normalizeEvaluationExtractionResponse(
  raw: unknown,
): EvaluationExtractionResponse {
  const root = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;

  const evaluationDateRaw = pick(root, 'evaluationDate', 'evaluation_date');
  let evaluationDate: string | undefined;
  if (evaluationDateRaw != null) {
    const text = String(evaluationDateRaw).trim();
    evaluationDate = text ? text.slice(0, 10) : undefined;
  }

  const extractedAtRaw = pick(root, 'extractedAt', 'extracted_at');
  const extractedAt =
    asString(extractedAtRaw) ??
    asString(pick(root, 'createdAt', 'created_at')) ??
    new Date().toISOString();

  const summary =
    asString(pick(root, 'aiEvaluationSummary', 'ai_evaluation_summary')) ?? '';

  return {
    jobId:
      asString(pick(root, 'jobId', 'job_id')) ??
      asString(root.id) ??
      `eval-${Date.now()}`,
    confidence: asNumber(root.confidence) ?? 0.85,
    extractedAt,
    extractedText: asString(pick(root, 'extractedText', 'extracted_text')),
    evaluatorName: asString(pick(root, 'evaluatorName', 'evaluator_name')),
    evaluatorCompany: asString(pick(root, 'evaluatorCompany', 'evaluator_company')),
    evaluationType: asString(pick(root, 'evaluationType', 'evaluation_type')),
    evaluationDate,
    technicalScore: asNumber(pick(root, 'technicalScore', 'technical_score')),
    communicationScore: asNumber(
      pick(root, 'communicationScore', 'communication_score'),
    ),
    problemSolvingScore: asNumber(
      pick(root, 'problemSolvingScore', 'problem_solving_score'),
    ),
    architectureScore: asNumber(pick(root, 'architectureScore', 'architecture_score')),
    clientReadinessScore: asNumber(
      pick(root, 'clientReadinessScore', 'client_readiness_score'),
    ),
    recommendation: asString(root.recommendation),
    evaluatorComments: asString(pick(root, 'evaluatorComments', 'evaluator_comments')),
    aiEvaluationSummary: summary,
    recordingUrl: asString(pick(root, 'recordingUrl', 'recording_url')) ?? null,
    evaluationFileUrl:
      asString(pick(root, 'evaluationFileUrl', 'evaluation_file_url')) ?? null,
    warnings: asStringArray(root.warnings),
  };
}

export class EvaluationExtractionClient {
  constructor(private readonly aiEvaluationUrl: string | null) {}

  get isLiveAiConfigured(): boolean {
    return Boolean(this.aiEvaluationUrl);
  }

  /**
   * Returns unified extract JSON.
   * - No AI_EVALUATION_URL → hardcoded static response (no Python dependency).
   * - AI_EVALUATION_URL set → POST file payload to Python ai-service and normalize.
   */
  async extract(
    request: EvaluationExtractionRequestBody,
  ): Promise<EvaluationExtractionResponse> {
    if (!this.aiEvaluationUrl) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return {
        ...STATIC_EVALUATION_EXTRACTION,
        jobId: `eval-static-${Date.now()}`,
        extractedAt: new Date().toISOString(),
        warnings: [
          ...STATIC_EVALUATION_EXTRACTION.warnings,
          `Static AI response for "${request.fileName}" — AI_EVALUATION_URL is not configured.`,
        ],
      };
    }

    const response = await fetch(this.aiEvaluationUrl, {
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
          ? `AI evaluation extraction failed: ${detail}`
          : `AI evaluation extraction failed: ${response.status} ${response.statusText}`,
      );
    }

    return normalizeEvaluationExtractionResponse(await response.json());
  }
}

export function bufferToBase64(buffer: Buffer): string {
  return buffer.toString('base64');
}

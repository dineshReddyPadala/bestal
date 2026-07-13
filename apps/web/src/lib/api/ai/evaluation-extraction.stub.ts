import type {
  EvaluationExtractionRequest,
  EvaluationExtractionResponse,
} from './evaluation-extraction.types';

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

export async function extractEvaluationFromFile(
  file: File,
  candidateId?: number,
): Promise<EvaluationExtractionResponse> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return extractEvaluation({
    fileName: file.name,
    mimeType: file.type || 'application/octet-stream',
    content: btoa(binary),
    candidateId,
  });
}

export async function extractEvaluation(
  request: EvaluationExtractionRequest,
): Promise<EvaluationExtractionResponse> {
  const aiUrl = import.meta.env.VITE_AI_EVALUATION_URL;

  if (aiUrl) {
    const response = await fetch(aiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new Error(
        detail
          ? `Evaluation extraction failed: ${detail}`
          : `Evaluation extraction failed: ${response.statusText}`,
      );
    }
    return (await response.json()) as EvaluationExtractionResponse;
  }

  await new Promise((r) => setTimeout(r, 900));

  return {
    ...STATIC_EVALUATION_EXTRACTION,
    jobId: `eval-stub-${Date.now()}`,
    extractedAt: new Date().toISOString(),
    warnings: [
      ...STATIC_EVALUATION_EXTRACTION.warnings,
      `Stub extraction for "${request.fileName}" — connect VITE_AI_EVALUATION_URL for live AI.`,
    ],
  };
}

export { STATIC_EVALUATION_EXTRACTION };

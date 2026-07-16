import type { BackgroundCheckDto } from '../../lib/api/types';

/** Placeholder AI extraction payload until the BGV AI API is ready. Do not call extract-ai. */
export function buildBgvAiDummyJson(detail: Pick<BackgroundCheckDto, 'provider' | 'type' | 'candidateName'>): string {
  const payload = {
    status: 'CLEAR_RECOMMENDED',
    confidence: 0.86,
    candidateName: detail.candidateName,
    provider: detail.provider ?? 'assigned vendor',
    package: detail.type,
    checks: [
      { name: 'Identity', result: 'CLEAR' },
      { name: 'Employment', result: 'CLEAR' },
      { name: 'Education', result: 'CLEAR' },
      { name: 'Criminal', result: 'CLEAR' },
    ],
    summary:
      'Placeholder AI extraction — BGV AI API is not ready. Simulated pass with no critical flags. Admin review required before verification can be marked clear.',
    generatedAt: new Date().toISOString(),
  };

  return JSON.stringify(payload, null, 2);
}

export function withBgvAiDummy(detail: BackgroundCheckDto): BackgroundCheckDto {
  return {
    ...detail,
    hasReportDocument: true,
    aiSummary: detail.aiSummary?.trim() || buildBgvAiDummyJson(detail),
  };
}

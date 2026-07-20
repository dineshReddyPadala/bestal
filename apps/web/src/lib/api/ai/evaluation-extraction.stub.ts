import type {
  EvaluationExtractionRequest,
  EvaluationExtractionResponse,
} from './evaluation-extraction.types';
import { evaluationsApi } from '../evaluations';

/**
 * @deprecated Prefer evaluationsApi.extractEvaluation — extraction now runs via Node API
 * (same pattern as ai-service resume → candidatesApi.extractResume).
 */
export async function extractEvaluationFromFile(
  file: File,
  candidateId?: number,
): Promise<EvaluationExtractionResponse> {
  const result = await evaluationsApi.extractEvaluation(file, candidateId);
  return result.extraction;
}

/**
 * @deprecated Prefer evaluationsApi.extractEvaluation
 */
export async function extractEvaluation(
  request: EvaluationExtractionRequest,
): Promise<EvaluationExtractionResponse> {
  // Browser File is not available from raw base64 request here; keep for compatibility
  // by reconstructing a Blob File when callers still use the old shape.
  const binary = atob(request.content);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const file = new File([bytes], request.fileName, {
    type: request.mimeType || 'application/octet-stream',
  });
  return extractEvaluationFromFile(file, request.candidateId);
}

export { STATIC_EVALUATION_EXTRACTION } from './evaluation-extraction.static';

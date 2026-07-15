import { candidatesApi, type ResumeExtractDraftResult } from '../candidates';
import type { ResumeExtractionResponse } from './resume-extraction.types';

/**
 * @deprecated Prefer candidatesApi.extractResume — extraction now runs via Node API.
 * Kept for type-compatible imports during transition.
 */
export async function extractResumeFromFile(file: File): Promise<ResumeExtractionResponse> {
  const result = await candidatesApi.extractResume(file);
  return result.extraction;
}

export async function extractResumeAndCreateDraft(
  file: File,
  existingCandidateId?: number,
): Promise<ResumeExtractDraftResult> {
  return candidatesApi.extractResume(file, existingCandidateId);
}

export type { ResumeExtractDraftResult };

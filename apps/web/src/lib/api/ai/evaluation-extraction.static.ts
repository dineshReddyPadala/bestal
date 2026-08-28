import type { EvaluationExtractionResponse } from './evaluation-extraction.types';

/** Demo payload when API AI_EVALUATION_URL is unset (static stub). */
export const STATIC_EVALUATION_EXTRACTION: EvaluationExtractionResponse = {
  jobId: 'eval-demo-001',
  confidence: 0.89,
  extractedAt: new Date().toISOString(),
  extractedText:
    'Technical interview evaluation for senior full-stack role. Strong system design and communication. Minor gaps in platform-specific tooling.',
  evaluatorName: 'Dr. Alan Wright',
  evaluatorCompany: 'BesTal',
  evaluationType: 'Live Technical Interview',
  evaluationDate: new Date().toISOString().slice(0, 10),
  technicalScore: 88,
  communicationScore: 92,
  problemSolvingScore: 85,
  collaborationCulturalFitScore: 90,
  clientReadinessScore: 87,
  recommendation: 'Hire',
  evaluatorComments:
    'Candidate demonstrated strong ownership, clear communication, and solid collaboration under time pressure.',
  aiEvaluationSummary:
    'Strong hire profile: excellent communication and collaboration skills with consistent technical depth. Recommended for client-facing senior engineering roles after minor platform onboarding.',
  warnings: ['Evaluator name inferred from document header — verify before saving.'],
};

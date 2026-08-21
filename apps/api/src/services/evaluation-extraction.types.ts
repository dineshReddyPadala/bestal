export type EvaluationExtractionRequestBody = {
  fileName: string;
  mimeType: string;
  content: string;
  candidateId?: string;
  jobId?: string;
};

/** Unified evaluation extraction response (camelCase) for Node ↔ web. */
export type EvaluationExtractionResponse = {
  jobId: string;
  confidence: number;
  extractedAt: string;
  extractedText?: string;
  evaluatorName?: string;
  evaluatorCompany?: string;
  evaluationType?: string;
  evaluationDate?: string;
  technicalScore?: number;
  communicationScore?: number;
  problemSolvingScore?: number;
  collaborationCulturalFitScore?: number;
  clientReadinessScore?: number;
  recommendation?: string;
  evaluatorComments?: string;
  aiEvaluationSummary: string;
  recordingUrl?: string | null;
  evaluationFileUrl?: string | null;
  warnings: string[];
};

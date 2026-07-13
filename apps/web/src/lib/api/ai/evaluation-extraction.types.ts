export interface EvaluationExtractionRequest {
  fileName: string;
  mimeType: string;
  content: string;
  candidateId?: number;
}

export interface EvaluationExtractionResponse {
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
  architectureScore?: number;
  clientReadinessScore?: number;
  recommendation?: string;
  evaluatorComments?: string;
  aiEvaluationSummary: string;
  warnings: string[];
}

export type EvaluationExtractionFormPatch = {
  evaluatorName?: string;
  evaluatorCompany?: string;
  evaluationType?: string;
  evaluationDate?: string;
  technicalScore?: number;
  communicationScore?: number;
  problemSolvingScore?: number;
  architectureScore?: number;
  clientReadinessScore?: number;
  recommendation?: string;
  evaluatorComments?: string;
  aiEvaluationSummary?: string;
  evaluationFileUrl?: string;
};

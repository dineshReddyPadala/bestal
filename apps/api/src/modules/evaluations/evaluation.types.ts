export interface EvaluationDto {
  id: number;
  organizationId: number;
  candidateId: number;
  candidateName: string;
  evaluatorName: string;
  evaluatorCompany: string | null;
  evaluationType: string | null;
  evaluationDate: string | null;
  technicalScore: number | null;
  communicationScore: number | null;
  problemSolvingScore: number | null;
  architectureScore: number | null;
  clientReadinessScore: number | null;
  recommendation: string | null;
  evaluatorComments: string | null;
  aiEvaluationSummary: string | null;
  recordingUrl: string | null;
  evaluationFileUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EvaluationListItemDto {
  id: number;
  candidateId: number;
  candidateName: string;
  evaluatorName: string;
  evaluatorCompany: string | null;
  evaluationType: string | null;
  evaluationDate: string | null;
  recommendation: string | null;
  technicalScore: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface EvaluationListFilters {
  organizationId: number;
  page: number;
  limit: number;
  sort?: string;
  search?: string;
  candidateId?: number;
  evaluationType?: string;
}

export interface CreateEvaluationInput {
  candidateId: number;
  evaluatorName: string;
  evaluatorCompany?: string | null;
  evaluationType?: string;
  evaluationDate?: string;
  technicalScore?: number;
  communicationScore?: number;
  problemSolvingScore?: number;
  architectureScore?: number;
  clientReadinessScore?: number;
  recommendation?: string;
  evaluationSummary?: string;
  evaluatorComments?: string;
  aiEvaluationSummary?: string;
  recordingUrl?: string;
  evaluationFileUrl?: string;
}

export interface UpdateEvaluationInput {
  evaluatorName?: string;
  evaluatorCompany?: string | null;
  evaluationType?: string | null;
  evaluationDate?: string | null;
  technicalScore?: number | null;
  communicationScore?: number | null;
  problemSolvingScore?: number | null;
  architectureScore?: number | null;
  clientReadinessScore?: number | null;
  recommendation?: string | null;
  evaluationSummary?: string | null;
  evaluatorComments?: string | null;
  aiEvaluationSummary?: string | null;
  recordingUrl?: string | null;
  evaluationFileUrl?: string | null;
}

/** Async n8n evaluation analysis acceptance (does not wait for OpenAI). */
export type EvaluationAnalysisJobAccepted = {
  jobId: number;
  status: string;
  candidateId: number;
  documentId: number;
  evaluationId: number;
};

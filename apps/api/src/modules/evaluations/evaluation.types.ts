import type {
  EvaluationRecommendation,
  EvaluationStatus,
} from '@prisma/client';

export interface EvaluationDto {
  id: number;
  organizationId: number;
  candidateId: number;
  candidateName: string;
  clientId: number | null;
  clientName: string | null;
  evaluatorId: number;
  evaluatorName: string;
  status: EvaluationStatus;
  recommendation: EvaluationRecommendation | null;
  overallScore: number | null;
  technicalScore: number | null;
  softSkillScore: number | null;
  communicationScore: number | null;
  problemSolvingScore: number | null;
  architectureScore: number | null;
  clientReadinessScore: number | null;
  evaluatorCompany: string | null;
  evaluationType: string | null;
  evaluatorComments: string | null;
  aiEvaluationSummary: string | null;
  recordingUrl: string | null;
  evaluationFileUrl: string | null;
  summary: string | null;
  strengths: string | null;
  weaknesses: string | null;
  evaluatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EvaluationListItemDto {
  id: number;
  candidateId: number;
  candidateName: string;
  clientId: number | null;
  clientName: string | null;
  evaluatorId: number;
  evaluatorName: string;
  status: EvaluationStatus;
  recommendation: EvaluationRecommendation | null;
  overallScore: number | null;
  evaluatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EvaluationListFilters {
  organizationId: number;
  page: number;
  limit: number;
  sort?: string;
  candidateId?: number;
  clientId?: number;
  status?: EvaluationStatus;
  evaluatorId?: number;
}

export interface CreateEvaluationInput {
  candidateId: number;
  clientId?: number;
  evaluatorId?: number;
  status?: EvaluationStatus;
  summary?: string;
  strengths?: string;
  weaknesses?: string;
  evaluatorName?: string;
  evaluatorCompany?: string;
  evaluationType?: string;
  technicalScore?: number;
  communicationScore?: number;
  problemSolvingScore?: number;
  architectureScore?: number;
  clientReadinessScore?: number;
  evaluatorComments?: string;
  aiEvaluationSummary?: string;
  recordingUrl?: string;
  evaluationFileUrl?: string;
}

export interface UpdateEvaluationInput {
  clientId?: number | null;
  evaluatorId?: number;
  status?: EvaluationStatus;
  recommendation?: EvaluationRecommendation;
  overallScore?: number;
  technicalScore?: number;
  softSkillScore?: number;
  communicationScore?: number;
  problemSolvingScore?: number;
  architectureScore?: number;
  clientReadinessScore?: number;
  summary?: string;
  strengths?: string;
  weaknesses?: string;
  evaluatorName?: string;
  evaluatorCompany?: string;
  evaluationType?: string;
  evaluatorComments?: string;
  aiEvaluationSummary?: string;
  recordingUrl?: string;
  evaluationFileUrl?: string;
}

export interface CompleteEvaluationInput {
  recommendation: EvaluationRecommendation;
  overallScore?: number;
  technicalScore?: number;
  softSkillScore?: number;
  summary?: string;
}

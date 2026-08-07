import type { TrialRequestStatus } from '@prisma/client';

export interface TrialDto {
  id: number;
  organizationId: number;
  candidateId: number;
  candidateName: string;
  clientId: number;
  clientName: string;
  deploymentId: number | null;
  requestedById: number;
  requestedByName: string;
  assignedRecruiterId: number | null;
  assignedRecruiterName: string | null;
  status: TrialRequestStatus;
  roleTitle: string | null;
  startDate: string | null;
  endDate: string | null;
  durationDays: number | null;
  trialType: string | null;
  maxTrialHours: number | null;
  taskDescription: string | null;
  successCriteria: string | null;
  feedback: string | null;
  clientRating: number | null;
  convertedToPaid: boolean;
  outcome: string | null;
  approvedAt: string | null;
  candidateConfirmedAt: string | null;
  rejectedAt: string | null;
  rejectReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TrialListItemDto {
  id: number;
  candidateId: number;
  candidateName: string;
  candidateEmail: string | null;
  clientId: number;
  clientName: string;
  clientContactName: string | null;
  clientContactEmail: string | null;
  clientContactPhone: string | null;
  status: TrialRequestStatus;
  roleTitle: string | null;
  startDate: string | null;
  endDate: string | null;
  assignedRecruiterId: number | null;
  assignedRecruiterName: string | null;
  candidateConfirmedAt: string | null;
  feedback: string | null;
  clientRating: number | null;
  outcome: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TrialListFilters {
  organizationId: number;
  page: number;
  limit: number;
  sort?: string;
  search?: string;
  candidateId?: number;
  clientId?: number;
  status?: TrialRequestStatus;
}

export interface CreateTrialInput {
  candidateId: number;
  clientId: number;
  deploymentId?: number;
  roleTitle?: string;
  startDate?: string;
  endDate?: string;
  durationDays?: number;
  trialType?: string;
  maxTrialHours?: number;
  taskDescription?: string;
  successCriteria?: string;
  feedback?: string;
}

export interface UpdateTrialInput {
  candidateId?: number;
  clientId?: number;
  deploymentId?: number | null;
  status?: TrialRequestStatus;
  roleTitle?: string;
  startDate?: string | null;
  endDate?: string | null;
  durationDays?: number | null;
  trialType?: string;
  maxTrialHours?: number;
  taskDescription?: string;
  successCriteria?: string;
  feedback?: string;
  clientRating?: number;
  convertedToPaid?: boolean;
  outcome?: string;
}

export interface RejectTrialInput {
  reason?: string;
}

export interface TrialFeedbackInput {
  feedback: string;
  clientRating: number;
  decision: 'CONTINUE' | 'DO_NOT_CONTINUE';
}

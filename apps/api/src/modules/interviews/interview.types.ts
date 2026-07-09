import type { InterviewRequestStatus, InterviewType } from '@prisma/client';

export interface InterviewDto {
  id: number;
  organizationId: number;
  candidateId: number;
  candidateName: string;
  clientId: number;
  clientName: string;
  shortlistId: number | null;
  requestedById: number;
  requestedByName: string;
  assignedToId: number | null;
  assignedToName: string | null;
  type: InterviewType;
  status: InterviewRequestStatus;
  scheduledAt: string | null;
  durationMinutes: number | null;
  timezone: string | null;
  location: string | null;
  meetingLink: string | null;
  notes: string | null;
  feedback: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewListItemDto {
  id: number;
  candidateId: number;
  candidateName: string;
  clientId: number;
  clientName: string;
  type: InterviewType;
  status: InterviewRequestStatus;
  scheduledAt: string | null;
  durationMinutes: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewListFilters {
  organizationId: number;
  page: number;
  limit: number;
  sort?: string;
  candidateId?: number;
  clientId?: number;
  shortlistId?: number;
  status?: InterviewRequestStatus;
  type?: InterviewType;
}

export interface CreateInterviewInput {
  candidateId: number;
  clientId: number;
  type: InterviewType;
  scheduledAt?: string;
  durationMinutes?: number;
  timezone?: string;
  location?: string;
  notes?: string;
  shortlistId?: number;
}

export interface UpdateInterviewInput {
  status?: InterviewRequestStatus;
  scheduledAt?: string | null;
  durationMinutes?: number | null;
  timezone?: string | null;
  location?: string | null;
  meetingLink?: string | null;
  notes?: string | null;
  feedback?: string | null;
  cancelReason?: string | null;
}

export interface ConfirmInterviewInput {
  scheduledAt: string;
  durationMinutes?: number;
  timezone?: string;
  location?: string;
  meetingLink?: string;
}

export interface CancelInterviewInput {
  cancelReason?: string;
}

import type { DeploymentStatus, PlacementType } from '@prisma/client';

export interface DeploymentDto {
  id: number;
  organizationId: number;
  candidateId: number;
  candidateName: string;
  clientId: number;
  clientName: string;
  createdById: number;
  createdByName: string;
  requestedById: number | null;
  status: DeploymentStatus;
  placementType: PlacementType;
  roleTitle: string;
  startDate: string | null;
  endDate: string | null;
  billingRate: number | null;
  candidatePayRate: number | null;
  grossMarginPerHour: number | null;
  expectedHoursPerWeek: number | null;
  currency: string | null;
  workLocation: string | null;
  timezone: string | null;
  reportingManagerName: string | null;
  reportingManagerEmail: string | null;
  notes: string | null;
  terminatedAt: string | null;
  terminateReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DeploymentListItemDto {
  id: number;
  candidateId: number;
  candidateName: string;
  clientId: number;
  clientName: string;
  status: DeploymentStatus;
  placementType: PlacementType;
  roleTitle: string;
  startDate: string | null;
  endDate: string | null;
  billingRate: number | null;
  candidatePayRate: number | null;
  expectedHoursPerWeek: number | null;
  currency: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DeploymentListFilters {
  organizationId: number;
  page: number;
  limit: number;
  sort?: string;
  candidateId?: number;
  clientId?: number;
  status?: DeploymentStatus;
  placementType?: PlacementType;
}

export interface CreateDeploymentInput {
  candidateId: number;
  clientId: number;
  placementType?: PlacementType;
  roleTitle: string;
  startDate?: string;
  endDate?: string;
  billingRate?: number;
  candidatePayRate?: number;
  grossMarginPerHour?: number;
  expectedHoursPerWeek?: number;
  currency?: string;
  workLocation?: string;
  timezone?: string;
  reportingManagerName?: string;
  reportingManagerEmail?: string;
  notes?: string;
  /** When true (or billingRate provided), create as ACTIVE (direct deploy). */
  activateNow?: boolean;
  requestedById?: number | null;
  status?: DeploymentStatus;
}

export interface RequestDeploymentInput {
  candidateId: number;
  placementType?: PlacementType;
  roleTitle: string;
  startDate?: string;
  endDate?: string;
  workLocation?: string;
  expectedHoursPerWeek?: number;
  timezone?: string;
  reportingManagerName?: string;
  reportingManagerEmail?: string;
}

export interface ApproveDeploymentInput {
  placementType?: PlacementType;
  roleTitle?: string;
  startDate?: string;
  endDate?: string | null;
  billingRate: number;
  candidatePayRate?: number | null;
  grossMarginPerHour?: number | null;
  expectedHoursPerWeek?: number | null;
  currency?: string;
  workLocation?: string;
  timezone?: string;
  reportingManagerName?: string;
  reportingManagerEmail?: string;
  notes?: string;
}

export interface UpdateDeploymentInput {
  candidateId?: number;
  clientId?: number;
  status?: DeploymentStatus;
  placementType?: PlacementType;
  roleTitle?: string;
  startDate?: string | null;
  endDate?: string | null;
  billingRate?: number | null;
  candidatePayRate?: number | null;
  grossMarginPerHour?: number | null;
  expectedHoursPerWeek?: number | null;
  currency?: string;
  workLocation?: string;
  timezone?: string;
  reportingManagerName?: string;
  reportingManagerEmail?: string;
  notes?: string;
}

export interface TerminateDeploymentInput {
  reason?: string;
}

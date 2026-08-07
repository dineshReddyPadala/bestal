import type {
  AutomationJob,
  AutomationJobStatus,
  AutomationJobType,
  Prisma,
} from '@prisma/client';

export type AutomationJobRecord = AutomationJob;

/** API DTO — all IDs are TypeScript number (Prisma BigInt mapped). */
export type AutomationJobDto = {
  id: number;
  candidateId: number | null;
  documentId: number | null;
  jobType: AutomationJobType;
  status: AutomationJobStatus;
  workflowName: string | null;
  workflowVersion: string | null;
  n8nExecutionId: string | null;
  inputReference: Record<string, unknown> | null;
  outputReference: Record<string, unknown> | null;
  attempts: number;
  maxAttempts: number;
  errorCode: string | null;
  errorMessage: string | null;
  requestedBy: number;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateAutomationJobInput = {
  candidateId?: number | null;
  documentId?: number | null;
  jobType: AutomationJobType;
  workflowName?: string | null;
  workflowVersion?: string | null;
  inputReference?: Record<string, unknown> | null;
  requestedBy: number;
  maxAttempts?: number;
};

export type UpdateAutomationJobInput = {
  status?: AutomationJobStatus;
  workflowName?: string | null;
  workflowVersion?: string | null;
  n8nExecutionId?: string | null;
  inputReference?: Prisma.InputJsonValue | null;
  outputReference?: Prisma.InputJsonValue | null;
  attempts?: number;
  errorCode?: string | null;
  errorMessage?: string | null;
  startedAt?: Date | null;
  completedAt?: Date | null;
};

export type AutomationJobListFilters = {
  organizationId: number;
  page: number;
  limit: number;
  candidateId?: number;
  documentId?: number;
  jobType?: AutomationJobType;
  status?: AutomationJobStatus;
};

/**
 * Outbound n8n webhook body — numeric IDs only (never UUIDs).
 * Matches the Fastify → n8n contract.
 */
export type N8nWorkflowTriggerInput = {
  jobId: number;
  /** Omitted for new resume uploads until AI screening creates the candidate. */
  candidateId?: number | null;
  documentId: number;
  requestedBy: number;
  documentUrl: string;
  workflowName: string;
  workflowVersion: string;
  /** Candidate BesTal score before evaluation (resume screening); used to recalculate. */
  previousBestalScore?: number | null;
};

export type N8nTriggerResult = {
  accepted: boolean;
  n8nExecutionId: string | null;
  httpStatus: number;
};

/** Input for AutomationService to create a job and trigger n8n. */
export type StartAutomationWorkflowInput = {
  /** Optional for resume screening on new uploads (candidate created on callback). */
  candidateId?: number | null;
  documentId: number;
  requestedBy: number;
  documentUrl: string;
  workflowVersion?: string | null;
  inputReference?: Record<string, unknown> | null;
  maxAttempts?: number;
  /** Evaluation workflow: existing candidate BesTal score from resume screening. */
  previousBestalScore?: number | null;
};

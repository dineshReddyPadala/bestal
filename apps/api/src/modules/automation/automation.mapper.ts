import { bigintToNumber } from '../../utils/index.js';
import type { AutomationJobDto, AutomationJobRecord } from './automation.types.js';

function asJsonRecord(
  value: unknown,
): Record<string, unknown> | null {
  if (value == null) return null;
  if (typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

export function mapAutomationJobToDto(job: AutomationJobRecord): AutomationJobDto {
  return {
    id: bigintToNumber(job.id),
    candidateId: job.candidateId != null ? bigintToNumber(job.candidateId) : null,
    documentId: job.documentId != null ? bigintToNumber(job.documentId) : null,
    jobType: job.jobType,
    status: job.status,
    workflowName: job.workflowName,
    workflowVersion: job.workflowVersion,
    n8nExecutionId: job.n8nExecutionId,
    inputReference: asJsonRecord(job.inputReference),
    outputReference: asJsonRecord(job.outputReference),
    attempts: job.attempts,
    maxAttempts: job.maxAttempts,
    errorCode: job.errorCode,
    errorMessage: job.errorMessage,
    requestedBy: bigintToNumber(job.requestedById),
    startedAt: job.startedAt?.toISOString() ?? null,
    completedAt: job.completedAt?.toISOString() ?? null,
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
  };
}

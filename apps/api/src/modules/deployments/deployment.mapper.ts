import type { Prisma } from '@prisma/client';
import { bigintToNumber } from '../../utils/index.js';
import type { DeploymentDto, DeploymentListItemDto } from './deployment.types.js';
import type { DeploymentRecord } from './deployment.repository.js';

const EXTENSION_BLOCK_RE =
  /<<<EXTENSION_REQUEST\nendDate:([^\n]+)\nreason:([\s\S]*?)\nrequestedAt:([^\n]+)\n>>>/;

function formatPersonName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`;
}

export function parseExtensionRequest(notes: string | null | undefined): {
  endDate: string;
  reason: string;
  requestedAt: string;
} | null {
  if (!notes) return null;
  const match = notes.match(EXTENSION_BLOCK_RE);
  if (!match) return null;
  return {
    endDate: match[1]!.trim(),
    reason: match[2]!.trim(),
    requestedAt: match[3]!.trim(),
  };
}

export function withExtensionRequest(
  notes: string | null | undefined,
  endDate: string,
  reason: string,
): string {
  const block = [
    '<<<EXTENSION_REQUEST',
    `endDate:${endDate}`,
    `reason:${reason.trim() || 'Extension requested'}`,
    `requestedAt:${new Date().toISOString()}`,
    '>>>',
  ].join('\n');
  const cleared = clearExtensionRequest(notes);
  return cleared ? `${cleared}\n\n${block}` : block;
}

export function clearExtensionRequest(notes: string | null | undefined): string | null {
  if (!notes) return null;
  const next = notes.replace(EXTENSION_BLOCK_RE, '').trim();
  return next || null;
}

export function mapDeploymentToDto(deployment: DeploymentRecord): DeploymentDto {
  return {
    id: bigintToNumber(deployment.id),
    organizationId: bigintToNumber(deployment.organizationId),
    candidateId: bigintToNumber(deployment.candidateId),
    candidateName: formatPersonName(
      deployment.candidate.firstName,
      deployment.candidate.lastName,
    ),
    clientId: bigintToNumber(deployment.clientId),
    clientName: deployment.client.name,
    createdById: bigintToNumber(deployment.createdById),
    createdByName: formatPersonName(
      deployment.createdBy.firstName,
      deployment.createdBy.lastName,
    ),
    requestedById: deployment.requestedById
      ? bigintToNumber(deployment.requestedById)
      : null,
    status: deployment.status,
    placementType: deployment.placementType,
    roleTitle: deployment.roleTitle,
    startDate: deployment.startDate?.toISOString().slice(0, 10) ?? null,
    endDate: deployment.endDate?.toISOString().slice(0, 10) ?? null,
    billingRate: deployment.billingRate ? Number(deployment.billingRate) : null,
    candidatePayRate: deployment.candidatePayRate
      ? Number(deployment.candidatePayRate)
      : null,
    grossMarginPerHour: deployment.grossMarginPerHour
      ? Number(deployment.grossMarginPerHour)
      : null,
    expectedHoursPerWeek: deployment.expectedHoursPerWeek,
    currency: deployment.currency,
    workLocation: deployment.workLocation,
    timezone: deployment.timezone,
    reportingManagerName: deployment.reportingManagerName,
    reportingManagerEmail: deployment.reportingManagerEmail,
    notes: deployment.notes,
    extensionRequestedEndDate: parseExtensionRequest(deployment.notes)?.endDate ?? null,
    terminatedAt: deployment.terminatedAt?.toISOString() ?? null,
    terminateReason: deployment.terminateReason,
    createdAt: deployment.createdAt.toISOString(),
    updatedAt: deployment.updatedAt.toISOString(),
  };
}

export function mapDeploymentToListItem(
  deployment: DeploymentRecord,
): DeploymentListItemDto {
  const extension = parseExtensionRequest(deployment.notes);
  return {
    id: bigintToNumber(deployment.id),
    candidateId: bigintToNumber(deployment.candidateId),
    candidateName: formatPersonName(
      deployment.candidate.firstName,
      deployment.candidate.lastName,
    ),
    clientId: bigintToNumber(deployment.clientId),
    clientName: deployment.client.name,
    status: deployment.status,
    placementType: deployment.placementType,
    roleTitle: deployment.roleTitle,
    startDate: deployment.startDate?.toISOString().slice(0, 10) ?? null,
    endDate: deployment.endDate?.toISOString().slice(0, 10) ?? null,
    billingRate: deployment.billingRate ? Number(deployment.billingRate) : null,
    candidatePayRate: deployment.candidatePayRate
      ? Number(deployment.candidatePayRate)
      : null,
    expectedHoursPerWeek: deployment.expectedHoursPerWeek,
    currency: deployment.currency,
    notes: deployment.notes,
    extensionRequestedEndDate: extension?.endDate ?? null,
    createdAt: deployment.createdAt.toISOString(),
    updatedAt: deployment.updatedAt.toISOString(),
  };
}

export function parseSortParam(
  sort: string | undefined,
): Prisma.DeploymentOrderByWithRelationInput[] {
  if (!sort) {
    return [{ createdAt: 'desc' }];
  }

  return sort.split(',').map((field) => {
    const desc = field.startsWith('-');
    const key = desc ? field.slice(1) : field;
    const direction = desc ? 'desc' : 'asc';

    switch (key) {
      case 'status':
      case 'startDate':
      case 'endDate':
      case 'roleTitle':
      case 'createdAt':
      case 'updatedAt':
        return { [key]: direction };
      default:
        return { createdAt: 'desc' as const };
    }
  });
}

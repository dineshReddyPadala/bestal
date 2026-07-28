import type { Prisma } from '@prisma/client';
import { bigintToNumber } from '../../utils/index.js';
import type { DeploymentDto, DeploymentListItemDto } from './deployment.types.js';
import type { DeploymentRecord } from './deployment.repository.js';

function formatPersonName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`;
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
    terminatedAt: deployment.terminatedAt?.toISOString() ?? null,
    terminateReason: deployment.terminateReason,
    createdAt: deployment.createdAt.toISOString(),
    updatedAt: deployment.updatedAt.toISOString(),
  };
}

export function mapDeploymentToListItem(
  deployment: DeploymentRecord,
): DeploymentListItemDto {
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

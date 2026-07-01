import { bigintToNumber } from '../../utils/index.js';
import type { SearchResultItemDto } from './search.types.js';
import type {
  CandidateSearchRow,
  ClientSearchRow,
  DeploymentSearchRow,
  EvaluationSearchRow,
} from './search.repository.js';

export function mapCandidateSearchRow(row: CandidateSearchRow): SearchResultItemDto {
  return {
    type: 'candidates',
    id: bigintToNumber(row.id),
    title: `${row.firstName} ${row.lastName}`,
    subtitle: row.email,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  };
}

export function mapClientSearchRow(row: ClientSearchRow): SearchResultItemDto {
  return {
    type: 'clients',
    id: bigintToNumber(row.id),
    title: row.name,
    subtitle: row.industry,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  };
}

export function mapDeploymentSearchRow(
  row: DeploymentSearchRow,
): SearchResultItemDto {
  return {
    type: 'deployments',
    id: bigintToNumber(row.id),
    title: row.roleTitle,
    subtitle: `${row.candidate.firstName} ${row.candidate.lastName} @ ${row.client.name}`,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  };
}

export function mapEvaluationSearchRow(
  row: EvaluationSearchRow,
): SearchResultItemDto {
  const candidateName = `${row.candidate.firstName} ${row.candidate.lastName}`;
  return {
    type: 'evaluations',
    id: bigintToNumber(row.id),
    title: `Evaluation: ${candidateName}`,
    subtitle: row.summary,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  };
}

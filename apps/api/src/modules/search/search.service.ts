import type { FastifyInstance } from 'fastify';
import type { AuthenticatedUser } from '../../types/index.js';
import {
  AuthorizationError,
  requireOrganization,
} from '../../utils/index.js';
import { buildPaginationMeta } from '../../validators/common.validator.js';
import {
  PERMISSIONS,
  roleHasPermission,
  type Permission,
} from '../auth/auth.permissions.js';
import {
  mapCandidateSearchRow,
  mapClientSearchRow,
  mapDeploymentSearchRow,
  mapEvaluationSearchRow,
} from './search.mapper.js';
import { SearchRepository } from './search.repository.js';
import type { SearchEntityType, SearchResultItemDto } from './search.types.js';
import type { SearchQuery } from './search.validator.js';

const TYPE_PERMISSION_MAP: Record<SearchEntityType, Permission> = {
  candidates: PERMISSIONS.CANDIDATES_READ,
  clients: PERMISSIONS.CLIENTS_READ,
  deployments: PERMISSIONS.DEPLOYMENTS_READ,
  evaluations: PERMISSIONS.EVALUATIONS_READ,
};

export class SearchService {
  private readonly searchRepository: SearchRepository;

  constructor(fastify: FastifyInstance, searchRepository?: SearchRepository) {
    this.searchRepository =
      searchRepository ?? new SearchRepository(fastify.prisma);
  }

  async search(
    authUser: AuthenticatedUser,
    query: SearchQuery,
  ): Promise<{
    data: SearchResultItemDto[];
    meta: ReturnType<typeof buildPaginationMeta>;
  }> {
    const organizationId = requireOrganization(authUser);
    const permittedTypes = this.resolvePermittedTypes(authUser, query.types);

    if (permittedTypes.length === 0) {
      throw new AuthorizationError(
        'No read permission for any of the requested search types',
      );
    }

    const term = query.q.trim();
    const results: Array<{ createdAt: Date; item: SearchResultItemDto }> = [];

    if (permittedTypes.includes('candidates')) {
      const rows = await this.searchRepository.searchCandidates(
        organizationId,
        term,
      );
      for (const row of rows) {
        results.push({
          createdAt: row.createdAt,
          item: mapCandidateSearchRow(row),
        });
      }
    }

    if (permittedTypes.includes('clients')) {
      const rows = await this.searchRepository.searchClients(organizationId, term);
      for (const row of rows) {
        results.push({
          createdAt: row.createdAt,
          item: mapClientSearchRow(row),
        });
      }
    }

    if (permittedTypes.includes('deployments')) {
      const rows = await this.searchRepository.searchDeployments(
        organizationId,
        term,
      );
      for (const row of rows) {
        results.push({
          createdAt: row.createdAt,
          item: mapDeploymentSearchRow(row),
        });
      }
    }

    if (permittedTypes.includes('evaluations')) {
      const rows = await this.searchRepository.searchEvaluations(
        organizationId,
        term,
      );
      for (const row of rows) {
        results.push({
          createdAt: row.createdAt,
          item: mapEvaluationSearchRow(row),
        });
      }
    }

    results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const total = results.length;
    const start = (query.page - 1) * query.limit;
    const paged = results.slice(start, start + query.limit);

    return {
      data: paged.map((r) => r.item),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  private resolvePermittedTypes(
    authUser: AuthenticatedUser,
    types: SearchEntityType[],
  ): SearchEntityType[] {
    return types.filter((type) =>
      roleHasPermission(authUser.role, TYPE_PERMISSION_MAP[type]),
    );
  }
}

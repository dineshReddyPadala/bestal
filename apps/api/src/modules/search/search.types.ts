export type SearchEntityType = 'candidates' | 'clients' | 'deployments' | 'evaluations';

export interface SearchResultItemDto {
  type: SearchEntityType;
  id: number;
  title: string;
  subtitle: string | null;
  status: string | null;
  createdAt: string;
}

export interface SearchFilters {
  organizationId: number;
  q: string;
  types: SearchEntityType[];
  page: number;
  limit: number;
}

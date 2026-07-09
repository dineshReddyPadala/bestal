import { apiList, type ListQuery } from './client';
import type { SearchResultItem } from './types';

export const searchApi = {
  search: (query: ListQuery & { q: string; types?: string }) =>
    apiList<SearchResultItem>('/search', query),
};

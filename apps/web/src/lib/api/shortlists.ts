import { apiCreate, apiDelete, apiGet, apiList, apiUpdate, type ListQuery } from './client';
import type { ShortlistDto, ShortlistListItem } from './types';

export const shortlistsApi = {
  list: (query?: ListQuery) => apiList<ShortlistListItem>('/shortlists', query),
  get: (id: number) => apiGet<ShortlistDto>(`/shortlists/${id}`),
  create: (body: Record<string, unknown>) => apiCreate<ShortlistDto>('/shortlists', body),
  addCandidate: (shortlistId: number, body: Record<string, unknown>) =>
    apiCreate<ShortlistDto>(`/shortlists/${shortlistId}/candidates`, body),
  removeCandidate: (shortlistId: number, candidateId: number) =>
    apiDelete(`/shortlists/${shortlistId}/candidates/${candidateId}`),
  updateCandidate: (
    shortlistId: number,
    candidateId: number,
    body: Record<string, unknown>,
  ) => apiUpdate<ShortlistDto>(`/shortlists/${shortlistId}/candidates/${candidateId}`, body),
};

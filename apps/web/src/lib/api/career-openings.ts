import {
  apiCreate,
  apiDelete,
  apiGet,
  apiList,
  apiRequest,
  apiUpdate,
  type ListQuery,
} from './client';
import type { ApiDataResponse, ApiPaginatedResponse } from './types';

export type CareerOpeningStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED';

export type CareerOpeningPublic = {
  id: number;
  title: string;
  slug: string;
  skillCommunity: string;
  location: string;
  remote: boolean;
  jobLevel: string;
  experience: string;
  aboutRole: string;
  responsibilities: string[];
  requirements: string[];
  publishedAt: string | null;
};

export type CareerOpeningListItem = {
  id: number;
  title: string;
  slug: string;
  skillCommunity: string;
  location: string;
  remote: boolean;
  jobLevel: string;
  status: CareerOpeningStatus;
  publishedAt: string | null;
  updatedAt: string;
};

export type CareerOpeningDetail = CareerOpeningPublic & {
  organizationId: number;
  status: CareerOpeningStatus;
  createdAt: string;
  updatedAt: string;
};

export type CareerOpeningPayload = {
  title: string;
  skillCommunity: string;
  location: string;
  remote: boolean;
  jobLevel: string;
  experience: string;
  aboutRole: string;
  responsibilities: string[];
  requirements: string[];
  status: CareerOpeningStatus;
};

export const careerOpeningsApi = {
  listPublic: async (): Promise<CareerOpeningPublic[]> => {
    const json = await apiRequest<ApiDataResponse<CareerOpeningPublic[]>>(
      '/public/career-openings',
      { auth: false },
    );
    return json.data;
  },
  list: (query?: ListQuery) =>
    apiList<CareerOpeningListItem>('/career-openings', query) as Promise<
      ApiPaginatedResponse<CareerOpeningListItem>
    >,
  get: (id: number) => apiGet<CareerOpeningDetail>(`/career-openings/${id}`),
  create: (body: CareerOpeningPayload) => apiCreate<CareerOpeningDetail>('/career-openings', body),
  update: (id: number, body: Partial<CareerOpeningPayload>) =>
    apiUpdate<CareerOpeningDetail>(`/career-openings/${id}`, body),
  remove: (id: number) => apiDelete(`/career-openings/${id}`),
};

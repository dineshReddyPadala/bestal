import type { CareerOpeningStatus } from '@prisma/client';

export type CareerOpeningDto = {
  id: number;
  organizationId: number;
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
  status: CareerOpeningStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CareerOpeningListItemDto = {
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

export type CareerOpeningPublicDto = {
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

export type CreateCareerOpeningInput = {
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
  status: CareerOpeningStatus;
  publishedAt: Date | null;
};

export type UpdateCareerOpeningInput = {
  title?: string;
  skillCommunity?: string;
  location?: string;
  remote?: boolean;
  jobLevel?: string;
  experience?: string;
  aboutRole?: string;
  responsibilities?: string[];
  requirements?: string[];
  status?: CareerOpeningStatus;
  publishedAt?: Date | null;
};

export type CareerOpeningListFilters = {
  organizationId: number;
  page: number;
  limit: number;
  sort?: string;
  search?: string;
  status?: CareerOpeningStatus;
};

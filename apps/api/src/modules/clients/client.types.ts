import type { ClientStatus } from '@prisma/client';

export interface ClientDto {
  id: number;
  organizationId: number;
  accountManagerId: number | null;
  accountManagerName: string | null;
  name: string;
  slug: string;
  status: ClientStatus;
  industry: string | null;
  website: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClientListItemDto {
  id: number;
  name: string;
  slug: string;
  status: ClientStatus;
  industry: string | null;
  contactEmail: string | null;
  accountManagerId: number | null;
  accountManagerName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClientListFilters {
  organizationId: number;
  page: number;
  limit: number;
  sort?: string;
  search?: string;
  status?: ClientStatus;
  accountManagerId?: number;
}

export interface CreateClientInput {
  name: string;
  accountManagerId?: number;
  status?: ClientStatus;
  industry?: string;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  notes?: string;
}

export interface UpdateClientInput extends Partial<CreateClientInput> {}

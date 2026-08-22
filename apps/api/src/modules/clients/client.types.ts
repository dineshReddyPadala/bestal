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
  companySize: string | null;
  website: string | null;
  headquarters: string | null;
  contactName: string | null;
  contactDesignation: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  paymentTerms: string | null;
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
  accountManagerId?: number | null;
  status?: ClientStatus;
  industry: string;
  companySize?: string;
  website: string;
  headquarters?: string;
  contactName: string;
  contactDesignation?: string;
  contactEmail: string;
  contactPhone: string;
  paymentTerms?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  notes?: string;
}

export interface UpdateClientInput {
  name?: string;
  accountManagerId?: number | null;
  status?: ClientStatus;
  industry?: string;
  companySize?: string | null;
  website?: string;
  headquarters?: string | null;
  contactName?: string;
  contactDesignation?: string | null;
  contactEmail?: string;
  contactPhone?: string;
  paymentTerms?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  notes?: string | null;
}

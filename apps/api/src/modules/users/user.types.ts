import type { Role } from '../../constants/index.js';

export type CreateUserInput = {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: Role;
};

export type BulkUserInput = CreateUserInput;

export type UserListItemDto = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: Role | null;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UserDto = UserListItemDto & {
  organizationId: number;
  organizationName: string;
  emailSent: boolean;
};

export type UserListFilters = {
  organizationId: number;
  page: number;
  limit: number;
  sort?: string;
  search?: string;
  role?: Role;
  isActive?: boolean;
};

export type BulkInviteResult = {
  created: number;
  failed: number;
  results: Array<{
    email: string;
    status: 'created' | 'failed';
    error?: string;
    userId?: number;
    emailSent?: boolean;
  }>;
};

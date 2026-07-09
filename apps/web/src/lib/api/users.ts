import { apiCreate, apiList, type ListQuery } from './client';

export type UserListItem = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UserDto = UserListItem & {
  organizationId: number;
  organizationName: string;
  emailSent: boolean;
};

export type InviteUserBody = {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'RECRUITER' | 'SALES' | 'ADMIN';
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

export const usersApi = {
  list: (query?: ListQuery) => apiList<UserListItem>('/users', query),
  invite: (body: InviteUserBody) => apiCreate<UserDto>('/users', body),
  inviteBulk: (users: InviteUserBody[]) =>
    apiCreate<BulkInviteResult>('/users/bulk', { users }),
};

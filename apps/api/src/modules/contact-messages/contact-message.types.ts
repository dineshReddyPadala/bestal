import type { ContactMessageStatus, ContactMessageTopic } from '@prisma/client';

export type ContactMessageDto = {
  id: number;
  organizationId: number;
  referenceCode: string;
  fullName: string;
  email: string;
  topic: ContactMessageTopic;
  message: string;
  status: ContactMessageStatus;
  internalNotes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ContactMessageListItemDto = {
  id: number;
  referenceCode: string;
  fullName: string;
  email: string;
  topic: ContactMessageTopic;
  status: ContactMessageStatus;
  createdAt: string;
};

export type CreateContactMessageInput = {
  referenceCode: string;
  fullName: string;
  email: string;
  topic: ContactMessageTopic;
  message: string;
};

export type ContactMessageListFilters = {
  organizationId: number;
  page: number;
  limit: number;
  sort?: string;
  search?: string;
  status?: ContactMessageStatus;
  topic?: ContactMessageTopic;
  dateFrom?: string;
  dateTo?: string;
};

export type UpdateContactMessageInput = {
  status?: ContactMessageStatus;
  internalNotes?: string | null;
};

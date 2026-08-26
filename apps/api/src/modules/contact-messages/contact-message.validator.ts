import { z } from 'zod';
import { paginationMetaSchema } from '../../validators/api-responses.validator.js';
import { optionalTextField } from '../../validators/optional-fields.js';

const contactMessageTopicEnum = z.enum([
  'GENERAL',
  'SALES',
  'SUPPORT',
  'PRESS',
  'PARTNERSHIPS',
  'INVESTORS',
]);

const contactMessageStatusEnum = z.enum(['SUBMITTED', 'READ', 'REPLIED', 'CLOSED']);

export const createPublicContactMessageBodySchema = z.object({
  fullName: z.string().trim().min(1).max(150),
  email: z.string().trim().email().max(255),
  topic: contactMessageTopicEnum,
  message: z.string().trim().min(10).max(5000),
  websiteConfirm: z.string().max(0).optional(),
});

export const updateContactMessageBodySchema = z.object({
  status: contactMessageStatusEnum.optional(),
  internalNotes: optionalTextField().nullable().optional(),
});

export const listContactMessagesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort: z
    .string()
    .regex(
      /^(-?(createdAt|updatedAt|status|fullName|email|topic))(,-?(createdAt|updatedAt|status|fullName|email|topic))*$/,
      'Invalid sort format',
    )
    .optional(),
  search: z.string().max(200).optional(),
  status: contactMessageStatusEnum.optional(),
  topic: contactMessageTopicEnum.optional(),
  dateFrom: z.string().date().optional(),
  dateTo: z.string().date().optional(),
});

export const contactMessageIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CreatePublicContactMessageBody = z.infer<typeof createPublicContactMessageBodySchema>;
export type UpdateContactMessageBody = z.infer<typeof updateContactMessageBodySchema>;
export type ListContactMessagesQuery = z.infer<typeof listContactMessagesQuerySchema>;

export const publicContactMessageSubmitResponseSchema = z.object({
  data: z.object({
    id: z.number(),
    referenceCode: z.string(),
    message: z.string(),
  }),
});

export const contactMessageResponseSchema = z.object({
  data: z.object({
    id: z.number(),
    organizationId: z.number(),
    referenceCode: z.string(),
    fullName: z.string(),
    email: z.string(),
    topic: contactMessageTopicEnum,
    message: z.string(),
    status: contactMessageStatusEnum,
    internalNotes: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
});

export const contactMessageListResponseSchema = z.object({
  data: z.array(
    z.object({
      id: z.number(),
      referenceCode: z.string(),
      fullName: z.string(),
      email: z.string(),
      topic: contactMessageTopicEnum,
      status: contactMessageStatusEnum,
      createdAt: z.string(),
    }),
  ),
  meta: paginationMetaSchema,
});

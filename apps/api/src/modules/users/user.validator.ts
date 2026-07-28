import { z } from 'zod';
import { paginationMetaSchema } from '../../validators/api-responses.validator.js';

export const inviteRoleEnum = z.enum(['RECRUITER', 'SALES', 'ADMIN', 'CLIENT']);

export const createUserBodySchema = z
  .object({
    email: z.string().email().max(255),
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    phone: z.string().max(30).optional(),
    role: inviteRoleEnum,
    clientId: z.coerce.number().int().positive().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.role === 'CLIENT' && value.clientId == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['clientId'],
        message: 'clientId is required for CLIENT users',
      });
    }
    if (value.role !== 'CLIENT' && value.clientId != null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['clientId'],
        message: 'clientId is only allowed for CLIENT users',
      });
    }
  });

export const bulkInviteBodySchema = z.object({
  users: z.array(createUserBodySchema).min(1).max(200),
});

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort: z
    .string()
    .regex(
      /^(-?(createdAt|updatedAt|email|firstName|lastName))(,-?(createdAt|updatedAt|email|firstName|lastName))*$/,
      'Invalid sort format',
    )
    .optional(),
  search: z.string().max(200).optional(),
  role: inviteRoleEnum.optional(),
  isActive: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
});

export const userIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CreateUserBody = z.infer<typeof createUserBodySchema>;
export type BulkInviteBody = z.infer<typeof bulkInviteBodySchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;

const userListItemSchema = z.object({
  id: z.number(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string().nullable(),
  role: z.string().nullable(),
  clientId: z.number().nullable(),
  clientName: z.string().nullable(),
  isActive: z.boolean(),
  lastLoginAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const userListResponseSchema = z.object({
  data: z.array(userListItemSchema),
  meta: paginationMetaSchema,
});

export const userResponseSchema = z.object({
  data: userListItemSchema.extend({
    organizationId: z.number(),
    organizationName: z.string(),
    emailSent: z.boolean(),
  }),
});

export const bulkInviteResponseSchema = z.object({
  data: z.object({
    created: z.number(),
    failed: z.number(),
    results: z.array(
      z.object({
        email: z.string(),
        status: z.enum(['created', 'failed']),
        error: z.string().optional(),
        userId: z.number().optional(),
        emailSent: z.boolean().optional(),
      }),
    ),
  }),
});

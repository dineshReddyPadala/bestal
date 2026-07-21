import { z } from 'zod';
import { paginationQuerySchema } from '../../validators/common.validator.js';

export const adminIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const adminListQuerySchema = paginationQuerySchema.extend({
  search: z.string().max(200).optional(),
});

export const adminStatusBodySchema = z.object({
  isActive: z.boolean().optional(),
  status: z.string().max(50).optional(),
});

export const reasonBodySchema = z.object({
  reason: z.string().min(1).max(2000),
});

export const notesBodySchema = z.object({
  notes: z.string().max(5000).optional(),
});

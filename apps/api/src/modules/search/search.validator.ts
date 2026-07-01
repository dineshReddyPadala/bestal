import { z } from 'zod';
import { paginationMetaSchema } from '../../validators/api-responses.validator.js';

const searchEntityTypeEnum = z.enum([
  'candidates',
  'clients',
  'deployments',
  'evaluations',
]);

export const searchQuerySchema = z.object({
  q: z.string().min(1).max(200),
  types: z
    .string()
    .optional()
    .transform((value) => {
      if (!value) {
        return ['candidates', 'clients', 'deployments', 'evaluations'] as const;
      }
      return value
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
    })
    .pipe(z.array(searchEntityTypeEnum).min(1)),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;

export const searchResultItemSchema = z.object({
  type: searchEntityTypeEnum,
  id: z.number(),
  title: z.string(),
  subtitle: z.string().nullable(),
  status: z.string().nullable(),
  createdAt: z.string(),
});

export const searchResponseSchema = z.object({
  data: z.array(searchResultItemSchema),
  meta: paginationMetaSchema,
});

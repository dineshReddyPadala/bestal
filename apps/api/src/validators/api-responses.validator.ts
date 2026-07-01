import { z } from 'zod';

/** RFC 7807 Problem Details — used in error-handler.plugin.ts */
export const problemDetailSchema = z.object({
  type: z.string().url().optional(),
  title: z.string(),
  status: z.number().int(),
  detail: z.string().optional(),
  instance: z.string().optional(),
  code: z.string().optional(),
  errors: z
    .array(
      z.object({
        field: z.string(),
        message: z.string(),
      }),
    )
    .optional(),
});

export const messageResponseSchema = z.object({
  data: z.object({
    message: z.string(),
  }),
});

export const paginationMetaSchema = z.object({
  page: z.number().int(),
  limit: z.number().int(),
  total: z.number().int(),
  totalPages: z.number().int(),
});

export const errorResponses = {
  400: problemDetailSchema,
  401: problemDetailSchema,
  403: problemDetailSchema,
  404: problemDetailSchema,
  409: problemDetailSchema,
  422: problemDetailSchema,
  500: problemDetailSchema,
} as const;

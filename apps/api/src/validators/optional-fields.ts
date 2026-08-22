import { z } from 'zod';

/** Optional URL or empty string (cleared to undefined). */
export const optionalUrlField = z
  .string()
  .max(500)
  .optional()
  .transform((value) => (value && value.trim() ? value.trim() : undefined));

export const optionalTextField = (max = 5000) =>
  z
    .string()
    .max(max)
    .optional()
    .transform((value) => (value && value.trim() ? value.trim() : undefined));

export const optionalNullableTextField = (max = 5000) =>
  z
    .union([z.string().max(max), z.null()])
    .optional()
    .transform((value) => {
      if (value == null) return undefined;
      const trimmed = value.trim();
      return trimmed ? trimmed : undefined;
    });

export const optionalRateField = z.coerce.number().nonnegative().optional();

export const optionalIntField = z.coerce.number().int().min(0).optional();

/** Optional email — empty/whitespace is cleared; non-empty values must be valid. */
export const optionalEmailField = z
  .union([z.string().max(255), z.undefined()])
  .optional()
  .transform((value) => {
    if (!value?.trim()) return undefined;
    return value.trim().toLowerCase();
  })
  .refine((value) => value === undefined || z.string().email().safeParse(value).success, {
    message: 'Invalid email',
  });

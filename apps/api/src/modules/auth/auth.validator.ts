import { z } from 'zod';
import { PORTALS } from '../../constants/index.js';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be at most 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const loginBodySchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(128),
  portal: z.enum([
    PORTALS.ADMIN,
    PORTALS.RECRUITER,
    PORTALS.SALES,
    PORTALS.CLIENT,
  ]),
  organizationId: z.coerce.number().int().positive().optional(),
});

export const refreshTokenBodySchema = z.object({
  refreshToken: z.string().min(1),
});

export const logoutBodySchema = z.object({
  refreshToken: z.string().min(1).optional(),
});

export const forgotPasswordBodySchema = z.object({
  email: z.string().email().max(255),
  portal: z.enum([PORTALS.RECRUITER, PORTALS.SALES, PORTALS.CLIENT]),
});

export const resetPasswordBodySchema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
  confirmPassword: z.string().min(1),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const changePasswordBodySchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'New password must be different from current password',
  path: ['newPassword'],
});

export type LoginBody = z.infer<typeof loginBodySchema>;
export type RefreshTokenBody = z.infer<typeof refreshTokenBodySchema>;
export type LogoutBody = z.infer<typeof logoutBodySchema>;
export type ForgotPasswordBody = z.infer<typeof forgotPasswordBodySchema>;
export type ResetPasswordBody = z.infer<typeof resetPasswordBodySchema>;
export type ChangePasswordBody = z.infer<typeof changePasswordBodySchema>;

export const tokenResponseSchema = z.object({
  data: z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    expiresIn: z.string(),
    tokenType: z.literal('Bearer'),
  }),
});

export const meResponseSchema = z.object({
  data: z.object({
    id: z.number(),
    email: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    phone: z.string().nullable(),
    organizationId: z.number().nullable(),
    organizationName: z.string().nullable(),
    clientId: z.number().nullable(),
    clientName: z.string().nullable(),
    role: z.string(),
    portal: z.string(),
    permissions: z.array(z.string()),
    lastLoginAt: z.string().nullable(),
  }),
});

export const messageResponseSchema = z.object({
  data: z.object({
    message: z.string(),
  }),
});

export const forgotPasswordResponseSchema = z.object({
  data: z.object({
    message: z.string(),
    resetToken: z.string().optional(),
  }),
});

export const permissionsResponseSchema = z.object({
  data: z.object({
    role: z.string(),
    permissions: z.array(z.string()),
  }),
});

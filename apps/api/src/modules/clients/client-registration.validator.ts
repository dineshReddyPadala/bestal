import { z } from 'zod';
import { validateCompanyContactEmail } from '../../utils/work-email.js';

const signupDetailsFields = {
  companyName: z.string().trim().min(1, 'Company name is required').max(255),
  contactName: z.string().trim().min(1, 'Primary contact name is required').max(150),
  contactEmail: z.string().trim().email('Valid official email is required').max(255),
  contactPhone: z.string().trim().min(1, 'Phone number is required').max(30),
  contactDesignation: z.string().trim().min(1, 'Designation is required').max(150),
};

export const clientSignupRequestOtpBodySchema = z
  .object(signupDetailsFields)
  .superRefine((data, ctx) => {
    const result = validateCompanyContactEmail(data.contactEmail, data.companyName);
    if (!result.valid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: result.message ?? 'Invalid company email',
        path: ['contactEmail'],
      });
    }
  });

export const clientSignupVerifyBodySchema = z.object({
  contactEmail: z.string().trim().email('Valid email is required').max(255),
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Enter the 6-digit verification code'),
});

/** @deprecated Password-based registration — use OTP signup flow instead */
export const publicClientRegistrationBodySchema = z
  .object({
    ...signupDetailsFields,
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password is too long'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .superRefine((data, ctx) => {
    const result = validateCompanyContactEmail(data.contactEmail, data.companyName);
    if (!result.valid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: result.message ?? 'Invalid company email',
        path: ['contactEmail'],
      });
    }
  });

export type ClientSignupRequestOtpBody = z.infer<typeof clientSignupRequestOtpBodySchema>;
export type ClientSignupVerifyBody = z.infer<typeof clientSignupVerifyBodySchema>;
export type PublicClientRegistrationBody = z.infer<
  typeof publicClientRegistrationBodySchema
>;

export const clientSignupRequestOtpResponseSchema = z.object({
  data: z.object({
    message: z.string(),
    expiresInMinutes: z.number(),
  }),
});

export const publicClientRegistrationResponseSchema = z.object({
  data: z.object({
    message: z.string(),
    clientId: z.number(),
  }),
});

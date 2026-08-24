import { z } from 'zod';
import { validateCompanyContactEmail } from '../work-email-validation';

export const clientSignupDetailsSchema = z
  .object({
    companyName: z.string().trim().min(1, 'Company name is required'),
    contactName: z.string().trim().min(1, 'Primary contact name is required'),
    contactEmail: z.string().trim().email('Valid official email is required'),
    contactPhone: z.string().trim().min(1, 'Phone number is required'),
    contactDesignation: z.string().trim().min(1, 'Designation is required'),
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

export const clientSignupOtpSchema = z.object({
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Enter the 6-digit verification code'),
});

export type ClientSignupDetailsValues = z.infer<typeof clientSignupDetailsSchema>;
export type ClientSignupOtpValues = z.infer<typeof clientSignupOtpSchema>;

/** @deprecated Use OTP signup flow */
export const clientSignupFormSchema = clientSignupDetailsSchema
  .extend({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ClientSignupFormValues = z.infer<typeof clientSignupFormSchema>;

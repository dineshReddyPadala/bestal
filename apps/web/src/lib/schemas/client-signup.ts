import { z } from 'zod';
import { validateCompanyContactEmail } from '../work-email-validation';

const WEBSITE_PATTERN = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/i;

function isValidWebsite(value: string | undefined): boolean {
  if (!value?.trim()) return true;
  return WEBSITE_PATTERN.test(value.trim());
}

export const clientSignupDetailsSchema = z
  .object({
    companyName: z.string().trim().min(1, 'Company name is required'),
    contactName: z.string().trim().min(1, 'Primary contact name is required'),
    contactEmail: z.string().trim().email('Valid email is required'),
    contactPhone: z.string().trim().min(1, 'Primary contact phone is required'),
    contactDesignation: z.string().trim().min(1, 'Designation is required'),
    website: z
      .string()
      .trim()
      .max(255)
      .optional()
      .or(z.literal(''))
      .refine(isValidWebsite, { message: 'Enter a valid website (e.g. company.com)' }),
  })
  .superRefine((data, ctx) => {
    const result = validateCompanyContactEmail(
      data.contactEmail,
      data.companyName,
      data.website,
    );
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

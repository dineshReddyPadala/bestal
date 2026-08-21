import { z } from 'zod';

export const clientSignupFormSchema = z
  .object({
    companyName: z.string().trim().min(1, 'Company name is required'),
    contactName: z.string().trim().min(1, 'Primary contact name is required'),
    contactEmail: z.string().trim().email('Valid email is required'),
    contactPhone: z.string().trim().min(1, 'Primary contact phone is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ClientSignupFormValues = z.infer<typeof clientSignupFormSchema>;

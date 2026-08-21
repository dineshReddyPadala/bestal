import { z } from 'zod';

export const publicClientRegistrationBodySchema = z
  .object({
    companyName: z.string().trim().min(1, 'Company name is required').max(255),
    contactName: z.string().trim().min(1, 'Primary contact name is required').max(150),
    contactEmail: z.string().trim().email('Valid primary contact email is required').max(255),
    contactPhone: z.string().trim().min(1, 'Primary contact phone is required').max(30),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password is too long'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type PublicClientRegistrationBody = z.infer<
  typeof publicClientRegistrationBodySchema
>;

export const publicClientRegistrationResponseSchema = z.object({
  data: z.object({
    message: z.string(),
    clientId: z.number(),
  }),
});

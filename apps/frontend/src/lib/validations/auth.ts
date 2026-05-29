import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'At least 6 characters').max(30, 'Max 30 characters'),
});

export const registerSchema = z
  .object({
    name: z.string().min(3, 'At least 3 characters').max(100, 'Max 100 characters'),
    email: z.string().email('Invalid email address'),
    countryCode: z.string().regex(/^\+[0-9]{2}$/, 'Invalid country code'),
    phoneNumber: z
      .string()
      .regex(/^[0-9]{3}-[0-9]{7}$/, 'Format: 300-1234567'),
    password: z.string().min(6, 'At least 6 characters').max(30, 'Max 30 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type LoginFields = z.infer<typeof loginSchema>
export type RegisterFields = z.infer<typeof registerSchema>

import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres').max(30, 'Máximo 30 caracteres'),
});

export const registerSchema = z
  .object({
    name: z.string().min(3, 'Mínimo 3 caracteres').max(100, 'Máximo 100 caracteres'),
    email: z.string().email('Correo electrónico inválido'),
    countryCode: z.string().regex(/^\+[0-9]{2}$/, 'Código de país inválido'),
    phoneNumber: z
      .string()
      .regex(/^[0-9]{3}-[0-9]{7}$/, 'Formato: 300-1234567'),
    password: z.string().min(6, 'Mínimo 6 caracteres').max(30, 'Máximo 30 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type LoginFields = z.infer<typeof loginSchema>
export type RegisterFields = z.infer<typeof registerSchema>

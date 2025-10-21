import { z } from 'zod';

export const userRoles = z.enum(['USER', 'ADMIN', 'SUPER_ADMIN']);

export const userSchema = z.object({
  id: z.string(), 
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.email('Invalid email format'),
  role: userRoles,
  password: z.string().min(8, 'Password must be at least 8 characters'),
  middleName: z.string().nullable().optional(),
  phoneNo: z
    .string()
    .regex(/^\d{10}$|^\d{3}-\d{3}-\d{4}$|^$/, 'Invalid phone number format')
    .nullable()
    .optional(),
});

export type User = z.infer<typeof userSchema>;

export const userCreateSchema = userSchema.omit({ id: true });

export type UserCreatePayload = z.infer<typeof userCreateSchema>;

export const userUpdateSchema = z.object({
  firstName: z.string().min(1, 'First name is required').optional(),
  middleName: z.string().nullable().optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  phoneNo: z
    .string()
    .regex(/^\d{10}$|^\d{3}-\d{3}-\d{4}$|^$/, 'Invalid phone number format')
    .nullable()
    .optional(),
  role: userRoles.optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
});

export type UserUpdatePayload = z.infer<typeof userUpdateSchema>;
import { z } from 'zod';
import { userConstraints } from '@/utils/constraints';

export const userRolesSchema = z.enum(userConstraints.selectOptions.roles as [string, ...string[]]);
export const userStatusSchema = z.enum(
  userConstraints.selectOptions.status as [string, ...string[]],
);

export const userSchema = z.object({
  id: z.string(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.email('Invalid email format'),
  roles: z.array(userRolesSchema).min(1, 'At least one role is required'),
  status: z.array(userStatusSchema).optional().nullable(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  middleName: z.string().nullable().optional(),
  phoneNo: z
    .string()
    .regex(/^\+?\d{1,4}[1-9]\d{9,14}$/, 'Invalid phone number')
    .nullable()
    .optional(),
});

export type User = z.infer<typeof userSchema>;

export const userCreateSchema = userSchema.omit({ id: true, status: true });
export type UserCreatePayload = z.infer<typeof userCreateSchema>;
export const userUpdateSchema = userSchema.partial().omit({ id: true });

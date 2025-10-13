import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

//user register request
const UserRegisterRequestSchema = z.object({
  firstName: z.string().min(3, 'First name is required').max(20),
  middleName: z.string().optional(),
  lastName: z.string().min(3, 'Last name is required').max(20),
  phoneNo: z.string(),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/,
      'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.',
    ),
  role: z.enum(['USER', 'SUPER_ADMIN', 'ADMIN']),
});

export class UserRegisterRequest extends createZodDto(
  UserRegisterRequestSchema,
) {}
export type UserRegisterRequestDto = z.infer<typeof UserRegisterRequestSchema>;

//user update request
const UserUpdateRequestSchema = z.object({
  firstName: z.string().min(3, 'First name is required').max(20).optional(),
  middleName: z.string().optional(),
  lastName: z.string().min(3, 'Last name is required').max(20).optional(),
  phoneNo: z.string().optional(),
  role: z.enum(['USER', 'SUPER_ADMIN', 'ADMIN']),
});

export class UserUpdateRequest extends createZodDto(UserUpdateRequestSchema) {}
export type UserUpdateRequestDto = z.infer<typeof UserRegisterRequestSchema>;

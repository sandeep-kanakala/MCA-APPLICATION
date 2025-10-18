import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

const UserRegisterRequestSchema = z.object({
  firstName: z
    .string()
    .regex(/^[A-Za-z]+$/, 'First Name should only contain alphabets')
    .min(3, 'First Name should have at least 3 characters')
    .max(20, 'First Name should be no more than 20 characters'),
  lastName: z
    .string()
    .regex(/^[A-Za-z]+$/, 'Last Name should only contain alphabets')
    .min(3, 'Last Name should have at least 3 characters')
    .max(20, 'Last Name should be no more than 20 characters'),
  middleName: z
    .string()
    .regex(/^[A-Za-z]+$/, 'Middle Name should only contain alphabets')
    .min(3, 'Middle Name should have at least 3 characters')
    .max(20, 'Middle Name should be no more than 20 characters')
    .optional(),
  phoneNo: z
    .string()
    .regex(/^\+?\d{1,4}[1-9]\d{9,14}$/, 'Invalid phone number'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/,
      'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.',
    ),
  role: z.enum(['USER', 'SUPER_ADMIN', 'ADMIN']),
});

export class UserRegisterRequestDto extends createZodDto(
  UserRegisterRequestSchema,
) {}

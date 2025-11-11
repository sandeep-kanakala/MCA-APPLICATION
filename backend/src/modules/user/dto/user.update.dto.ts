import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

const UserUpdateRequestSchema = z.object({
  firstName: z
    .string()
    .trim()
    .regex(
      /^[A-Za-z]+(?: [A-Za-z]+)*$/,
      'First Name should only contain alphabets and spaces',
    )
    .min(3, 'First Name should have at least 3 characters')
    .max(20, 'First Name should be no more than 20 characters')
    .optional(),
  lastName: z
    .string()
    .trim()
    .regex(
      /^[A-Za-z]+(?: [A-Za-z]+)*$/,
      'Last Name should only contain alphabets and spaces',
    )
    .min(3, 'Last Name should have at least 3 characters')
    .max(20, 'Last Name should be no more than 20 characters')
    .optional(),
  middleName: z
    .string()
    .trim()
    .regex(
      /^[A-Za-z]+(?: [A-Za-z]+)*$/,
      'Middle Name should only contain alphabets and spaces',
    )
    .min(3, 'Middle Name should have at least 3 characters')
    .max(20, 'Middle Name should be no more than 20 characters')
    .optional(),
  phoneNo: z
    .string()
    .trim()
    .regex(/^\+?\d{1,4}[1-9]\d{9,14}$/, 'Invalid phone number')
    .optional(),
});

export class UserUpdateRequestDto extends createZodDto(
  UserUpdateRequestSchema,
) {}

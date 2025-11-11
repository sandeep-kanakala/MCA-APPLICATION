import { z } from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';
import { EContactStatus, EGender } from '@/utils/enum';

export const ContactCreateRequestSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  phone: z
    .string()
    .trim()
    .regex(/^\+?\d{1,4}[1-9]\d{9,14}$/, 'Invalid phone number'),
  salutation: z.string().trim(),
  firstName: z
    .string()
    .trim()
    .regex(
      /^[A-Za-z\s]+$/,
      'First Name should only contain alphabets and spaces',
    )
    .min(2, 'First Name must have at least 2 characters')
    .max(50, 'First Name must not exceed 50 characters'),
  middleName: z
    .string()
    .trim()
    .regex(
      /^[A-Za-z\s]+$/,
      'Middle Name should only contain alphabets and spaces',
    )
    .min(2, 'Middle Name must have at least 2 characters')
    .max(50, 'Middle Name must not exceed 50 characters')
    .optional(),
  lastName: z
    .string()
    .trim()
    .regex(
      /^[A-Za-z\s]+$/,
      'last Name should only contain alphabets and spaces',
    )
    .min(2, 'Last Name must have at least 2 characters')
    .max(50, 'Last Name must not exceed 50 characters'),
  birthDate: z.coerce.date().optional(),
  currency: z
    .string()
    .trim()
    .length(3, 'Currency must be a 3-letter code')
    .optional(),
  age: z.number().int().positive().optional(),
  status: z.enum(EContactStatus),
  idType: z.string().trim().optional(),
  passportExpirationDate: z.coerce.date().optional(),
  passportNumber: z.string().trim().optional(),
  idNumber: z.string().trim().optional(),
  countryCode: z
    .string()
    .trim()
    .length(3, 'Country code must have 3 characters'),
  icxContactNumber: z.string().trim().optional(),
  partnerCustomerNumber: z.string().trim().optional(),
  language: z.string().trim().optional(),
  signupOrigin: z.string().trim().optional(),
  communicationPreference: z.string().trim().optional(),
  segment: z.string().trim(),

  gender: z.enum(EGender),
  accountId: z.string().trim().cuid(),
  createdById: z.string().trim().optional(),
  updatedById: z.string().trim().optional(),

  isArchived: z.boolean().optional(),
  archivedAt: z.coerce.date().optional().nullable(),
});

export class ContactCreateRequestDto extends createZodDto(
  ContactCreateRequestSchema,
) {}

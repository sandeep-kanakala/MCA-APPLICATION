import { z } from 'zod';
import {
  EAccountStatus,
  EAccountType,
  EAddressType,
  EGender,
  EContactStatus,
} from '@/utils/enum';
import { createZodDto } from '@anatine/zod-nestjs';
import { AddressType } from '@prisma/client';

export const CreateAddressSchema = z.object({
  name: z
    .string()
    .trim()
    .regex(/^[A-Za-z\s]+$/, 'Name should only contain alphabets and spaces')
    .min(2, 'Name must have at least 2 characters')
    .max(50, 'Name must not exceed 50 characters'),
  province: z
    .string()
    .trim()
    .regex(/^[A-Za-z\s]+$/, 'Province should only contain letters and spaces')
    .min(2, 'Province must be at least 2 characters')
    .max(50, 'Province must be no more than 50 characters'),
  city: z
    .string()
    .trim()
    .regex(/^[A-Za-z\s]+$/, 'City should only contain letters and spaces')
    .min(2, 'City must be at least 2 characters')
    .max(50, 'City must be no more than 50 characters'),
  street: z
    .string()
    .trim()
    .min(3, 'Street must be at least 3 characters')
    .max(100, 'Street must be no more than 100 characters'),
  postalCode: z
    .string()
    .trim()
    .regex(/^[0-9A-Za-z\s-]{4,10}$/, 'Invalid postal code format'),
  country: z
    .string()
    .trim()
    .regex(/^[A-Za-z\s]+$/, 'Country should only contain letters and spaces')
    .min(2, 'Country must be at least 2 characters')
    .max(50, 'Country must be no more than 50 characters'),
  addressType: z.enum(EAddressType),
  icxAddressNumber: z.string().trim(),
  isDefault: z.boolean().optional(),
  isPrimary: z.boolean().optional(),
});

export const CreateContactSchema = z.object({
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
  birthDate: z
    .string()
    .datetime({ offset: true })
    .transform((val) => new Date(val))
    .optional(),
  currency: z
    .string()
    .trim()
    .length(3, 'Currency must be a 3-letter code')
    .optional(),
  age: z.number().int().positive().optional(),
  status: z.enum(EContactStatus),
  idType: z.string().trim().optional(),
  passportExpirationDate: z
    .string()
    .datetime({ offset: true })
    .transform((val) => new Date(val))
    .optional(),
  passportNumber: z.string().trim().optional(),
  idNumber: z.string().trim().optional(),
  countryCode: z
    .string()
    .trim()
    .length(3, 'Country code must have 3 characters'),
  partnerCustomerNumber: z.string().trim().optional(),
  language: z.string().optional(),
  signupOrigin: z.string().trim().optional(),
  communicationPreference: z.string().trim().optional(),
  segment: z.string().trim(),
  gender: z.enum(EGender),
});

export const CreateAccountDetailsSchema = z
  .object({
    name: z
      .string()
      .trim()
      .regex(/^[A-Za-z\s]+$/, 'Name should only contain alphabets and spaces')
      .min(2, 'Name must have at least 2 characters')
      .max(50, 'Name must not exceed 50 characters'),
    type: z.enum(EAccountType),
    currencyCode: z
      .string()
      .trim()
      .length(3, 'Currency code must have 3 characters'),
    preferredLanguage: z.string().trim().optional(),
    status: z.enum(EAccountStatus),
    countryCode: z
      .string()
      .trim()
      .length(3, 'Country code must have 3 characters'),
    signupOrigin: z.string().trim().optional(),
    viewingPlatform: z.string().trim().optional(),
    segment: z.string().trim().optional(),
    partnerCustomerNumber: z.string().trim().optional(),
    recordTypeDevName: z.string().trim().optional(),
    sameAsBilling: z.enum(['true', 'false']).default('false'),
    contacts: z.array(CreateContactSchema).optional(),
    address: z.array(CreateAddressSchema).optional(),
  })
  .refine(
    (data) => {
      const sameAsBilling = data.sameAsBilling === 'true';
      const addresses = data.address ?? [];

      if (sameAsBilling) {
        const hasBilling = addresses.some(
          (a) => a.addressType === AddressType.BILLING,
        );
        const hasShipping = addresses.some(
          (a) => a.addressType === AddressType.SHIPPING,
        );

        return hasBilling && !hasShipping;
      }
      return true;
    },
    {
      message:
        'When sameAsBilling is true, exactly one BILLING address is required and SHIPPING must not be provided.',
      path: ['addresses'],
    },
  );

export class CreateAccountDetailsDto extends createZodDto(
  CreateAccountDetailsSchema,
) {}

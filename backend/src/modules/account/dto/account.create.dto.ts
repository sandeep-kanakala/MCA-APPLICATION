import { EAccountStatus, EAccountType } from '@/utils/enum';
import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

export const CreateAccountSchema = z.object({
  name: z
    .string()
    .trim()
    .regex(/^[A-Za-z\s]+$/, 'Name should only contain alphabets and spaces')
    .min(3, 'Name must have at least 2 characters')
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
});
export class CreateAccountDto extends createZodDto(CreateAccountSchema) {}

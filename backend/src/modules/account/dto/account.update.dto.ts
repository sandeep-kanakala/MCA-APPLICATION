import { EAccountStatus, EAccountType } from '@/utils/enum';
import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

const AccountUpdateSchema = z.object({
  name: z
    .string()
    .trim()
    .regex(/^[A-Za-z\s]+$/, 'Name should only contain alphabets and spaces')
    .min(3, 'Name must have at least 2 characters')
    .max(50, 'Name must not exceed 50 characters')
    .optional(),
  type: z.enum(EAccountType).optional(),

  currencyCode: z
    .string()
    .trim()
    .length(3, 'Currency code must have 3 characters')
    .optional(),
  preferredLanguage: z.string().trim().optional(),
  status: z.enum(EAccountStatus).optional(),
  countryCode: z
    .string()
    .trim()
    .length(3, 'Country code must have 3 characters')
    .optional(),
  icxAccountNumber: z.string().trim().optional(),
  signupOrigin: z.string().trim().optional(),
  viewingPlatform: z.string().trim().optional(),
  type_c: z.string().trim().optional(),
  segment: z.string().trim().optional(),
  partnerCustomerNumber: z.string().trim().optional(),
  recordTypeDevName: z.string().trim().optional(),
  isArchived: z.boolean().optional(),
  archivedAt: z.coerce.date().optional(),
});

export class UpdateAccountDto extends createZodDto(AccountUpdateSchema) {}

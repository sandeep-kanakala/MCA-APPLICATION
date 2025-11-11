import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

export const CreatePriceListSchema = z.object({
  name: z.string().trim().min(1, 'Price List name is required'),
  description: z.string().trim().optional(),
  code: z.string().trim().min(1, 'Price List code is required'),
  currencyCode: z
    .string()
    .trim()
    .regex(/^[A-Z]{3}$/, 'Currency code must be a 3-letter ISO code')
    .optional(),
  country: z.string().trim().min(1, 'Country is required'),
  isActive: z.boolean().optional().default(true),
  accountType: z.string().trim().min(1, 'Account type is required'),
  accountId: z.string().trim().cuid('Invalid Account ID'),
  priceBookId: z.string().trim().cuid('Invalid Price Book ID'),
  effectiveFrom: z.string().datetime().optional(),
  effectiveTo: z.string().datetime().optional(),
  isTaxable: z.boolean().optional(),
});

export const UpdatePriceListSchema = z.object({
  name: z.string().trim().optional(),
  description: z.string().trim().optional(),
  code: z.string().trim().optional(),
  currencyCode: z
    .string()
    .trim()
    .regex(/^[A-Z]{3}$/, 'Currency code must be a 3-letter ISO code')
    .optional(),
  country: z.string().trim().optional(),
  isActive: z.boolean().optional(),
  accountType: z.string().trim().optional(),
  accountId: z.string().trim().cuid('Invalid Account ID').optional(),
  priceBookId: z.string().trim().cuid('Invalid Price Book ID').optional(),
  effectiveFrom: z.string().datetime().optional(),
  effectiveTo: z.string().datetime().optional(),
  isTaxable: z.boolean().optional(),
});

export const CreatePriceListEntrySchema = z.object({
  name: z.string().trim().min(3, 'Price List Entry name is required'),
  description: z.string().trim().optional(),
  priceListId: z.string().trim().cuid('Invalid Price List ID'),
  priceBookEntryId: z
    .string()
    .trim()
    .cuid('Invalid Price Book Entry ID')
    .optional(),
  productId: z.string().trim().cuid('Invalid Product ID'),

  discountPct: z
    .number()
    .min(0, 'Discount percent must be at least 0')
    .max(100, 'Discount percent cannot exceed 100')
    .optional(),

  amount: z.number().int().min(0, 'Amount must be at least 0'),

  currencyCode: z
    .string()
    .trim()
    .min(1, 'Currency code is required')
    .max(3, 'Currency code must be maximum 3 characters')
    .optional(),

  effectiveFrom: z.string().datetime('Invalid date format'),
  effectiveTo: z.string().datetime('Invalid date format').optional(),

  isActive: z.boolean().optional().default(true),
  type: z.string().trim().optional(),
  virtualPrice: z.boolean().optional(),
  override: z.boolean().optional(),

  recurringFrequency: z
    .enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'ONE_TIME', 'USAGE'])
    .optional(),
});

export const UpdatePriceListEntrySchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Name should be mininmum 3 characters')
    .optional(),
  description: z.string().trim().optional(),
  productId: z.string().trim().cuid('Invalid Product ID').optional(),
  amount: z.number().int().min(0, 'Amount must be at least 0').optional(),
  unitPrice: z.number().min(0, 'Unit price must be at least 0').optional(),
  discountPct: z
    .number()
    .min(0, 'Discount percent must be at least 0')
    .max(100, 'Discount percent cannot exceed 100')
    .optional(),
  billingFrequency: z
    .enum(['DAILY', 'MONTHLY', 'ONE_TIME', 'USAGE', 'WEEKLY', 'YEARLY'])
    .optional(),
  currency: z
    .string()
    .trim()
    .min(1, 'Currency is required')
    .max(3, 'Currency must be maximum 3 characters')
    .optional(),
  effectiveFrom: z.string().datetime().optional(),
  effectiveTo: z.string().datetime().optional(),
  priceBookEntryId: z
    .string()
    .trim()
    .cuid('Invalid Price Book Entry Id')
    .optional(),
});

export class CreatePriceListDto extends createZodDto(CreatePriceListSchema) {}
export class UpdatePriceListDto extends createZodDto(UpdatePriceListSchema) {}

export class CreatePriceListEntryDto extends createZodDto(
  CreatePriceListEntrySchema,
) {}
export class UpdatePriceListEntryDto extends createZodDto(
  UpdatePriceListEntrySchema,
) {}

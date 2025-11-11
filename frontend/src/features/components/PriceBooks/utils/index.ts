import { pricebookConstraints } from '@/utils/constraints';

import { z } from 'zod';

const optionalString = (
  minLength: number,
  minMessage: string,
  maxLength: number = 500,
  maxMessage: string = 'Exceeds maximum allowed length',
) =>
  z
    .string()
    .trim()
    .refine((val) => val.length === 0 || val.length >= minLength, {
      message: minMessage,
    })
    .refine((val) => val.length <= maxLength, {
      message: maxMessage,
    })
    .transform((val) => (val === '' ? undefined : val))
    .nullish();

const CurrencyCodeSchema = z
  .string()
  .optional()
  .refine((val) => !!val, { message: 'Please select Currency code' });

const PriceBookTypeSchema = z.enum(pricebookConstraints.selectOptions.type);

const BaseAuditSchema = z.object({
  createdAt: z.iso.datetime({ offset: true }).nullable().optional(),
  updatedAt: z.iso.datetime({ offset: true }).nullable().optional(),
  createdBy: z.string().nullable().optional(),
  updateBy: z.string().nullable().optional(),
  tenantId: z.string().nullable().optional(),
});

export const PriceBookSchema = z
  .object({
    id: z.string().nullable().optional(),
    name: z
      .string()
      .refine((s) => s.length > 0, { message: 'Price book name is required' })
      .min(3, { message: 'Price book name must be at least 3 characters' })
      .max(49, { message: 'Price book name cannot exceed 49 characters' })
      .transform((s) => s.trim()),
    description: optionalString(
      2,
      'Description must be at least 2 characters',
      300,
      'Description cannot exceed 300 characters',
    ),
    isActive: z.boolean().default(true).optional(),
    type: PriceBookTypeSchema.default('CUSTOM').optional(),
    entries: z.array(z.any()).optional(),
  })
  .extend(BaseAuditSchema.shape);

export const CreatePriceBookSchema = PriceBookSchema.pick({
  name: true,
  type: true,
  description: true,
});

export const UpdatePriceBookSchema = z.object({
  name: z
    .string()
    .trim()
    .optional()
    .refine((val) => val === undefined || val.length > 0, {
      message: 'Price book name cannot be empty',
    })
    .refine((val) => val === undefined || val.length >= 3, {
      message: 'Price book name must be at least 3 characters',
    })
    .refine((val) => val === undefined || val.length <= 49, {
      message: 'Price book name cannot exceed 49 characters',
    }),
  type: PriceBookTypeSchema.optional(),
  description: optionalString(
    5,
    'Description must be at least 5 characters',
    300,
    'Description cannot exceed 300 characters',
  ),
});

const BasePriceBookEntryFields = z.object({
  productId: z
    .string()
    .optional()
    .refine((val) => !!val, { message: 'Please select Product' }),
  unitPrice: z.coerce
    .number()
    .optional()
    .refine((val) => !!val && val >= 0, { message: 'Unit Price must be at least 0' }),
  currencyCode: CurrencyCodeSchema,
  isActive: z.boolean().default(true).optional(),
});

export const PriceBookEntrySchema = BasePriceBookEntryFields.extend({
  id: z.string(),
  priceBookId: z.string().min(1, { message: 'Price book ID is required' }).nullable().optional(),
}).extend(BaseAuditSchema.shape);

export const CreatePriceBookEntrySchema = BasePriceBookEntryFields.pick({
  productId: true,
  unitPrice: true,
  currencyCode: true,
});

export const UpdatePriceBookEntrySchema = CreatePriceBookEntrySchema.partial();

export type PriceBook = z.infer<typeof PriceBookSchema>;
export type PriceBookEntry = z.infer<typeof PriceBookEntrySchema>;
export type CreatePriceBookDto = z.infer<typeof CreatePriceBookSchema>;
export type UpdatePriceBookDto = z.infer<typeof UpdatePriceBookSchema>;
export type CreatePriceBookEntryDto = z.infer<typeof CreatePriceBookEntrySchema>;
export type UpdatePriceBookEntryDto = z.infer<typeof UpdatePriceBookEntrySchema>;
export const PRICEBOOK_FIELDS = [
  {
    name: 'name',
    label: 'Price Book Name',
    type: 'text',
    placeholder: 'Enter price book name',
    required: true,
  },
  {
    name: 'description',
    label: 'Description',
    type: 'text',
    placeholder: 'e.g., Standard pricing for products',
  },
  {
    name: 'type',
    label: 'Type',
    type: 'select',
    options: [
      { label: 'Standard', value: 'STANDARD' },
      { label: 'Custom', value: 'CUSTOM' },
    ],
  },
];

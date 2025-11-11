import { z } from 'zod';
import type { FieldConfig } from '../../EntityFormComponent';
import { priceListConstraints, pricelistEntryConstraints } from '@/utils/constraints';
export const PRICE_LIST_ENTRY_FIELDS = [
  {
    name: 'priceBook',
    label: 'Select Price Book',
    type: 'select',
    placeholder: 'Select price book',
    required: true,
    child: [
      {
        name: 'priceBookEntryId',
        label: 'Select Price Book Entry',
        type: 'select',
        placeholder: 'Select pricebook entry',
        required: true,
      },
    ],
  },

  {
    name: 'name',
    label: 'List Name',
    type: 'text',
    placeholder: 'Enter list name',
    required: true,
  },

  {
    name: 'amount',
    label: 'Amount',
    type: 'number',
    placeholder: 'Enter amount',
    required: true,
  },
  {
    name: 'discountPct',
    label: 'Discount Percentage',
    type: 'number',
    placeholder: 'Enter discount percentage',
    required: true,
  },
  {
    name: 'billingFrequency',
    label: 'Billing Frequency',
    type: 'select',
    placeholder: 'Select billing frequency',
    required: true,
    options: pricelistEntryConstraints.selectOptions.billingFrequency,
  },
  {
    name: 'effectiveFrom',
    label: 'Effective From',
    type: 'date',
    placeholder: 'Select start date',
  },
  {
    name: 'effectiveTo',
    label: 'Effective To',
    type: 'date',
    placeholder: 'Select end date',
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    placeholder: 'Enter description (optional)',
  },
];

export const PRICELIST_FIELDS: FieldConfig[] = [
  { name: 'name', label: 'Name', type: 'text', required: true },
  {
    name: 'accountType',
    label: 'Type',
    type: 'select',
    options: priceListConstraints.selectOptions.accountType,
    required: true,
  },
  {
    name: 'accountId',
    label: 'Account Type',
    type: 'select',
    required: true,
    disabled: (mode) => mode === 'edit',
  },
  {
    name: 'currencyCode',
    label: 'Currency',
    type: 'select',
    options: priceListConstraints.selectOptions.currencyCode,
    required: true,
  },
  {
    name: 'country',
    label: 'Country',
    type: 'select',
    options: priceListConstraints.selectOptions.country,
    required: true,
  },
  { name: 'code', label: 'Code', type: 'text', required: true },
  { name: 'effectiveFrom', label: 'Effective From', type: 'date' },
  { name: 'effectiveTo', label: 'Effective To', type: 'date' },
  { name: 'isTaxable', label: 'Is Taxable', type: 'checkbox' },
  { name: 'isActive', label: 'isActive', type: 'checkbox' },
];
export const priceListSchema = z.object({
  name: z.string().min(2, { message: 'List name must be at least 2 characters' }),
  description: z.string().nullable().optional(),

  accountType: z.string().min(2, { message: 'Type is required' }).or(z.literal('')),
  accountId: z.string().min(2, { message: 'account is required' }),
  country: z.string().min(2, { message: 'Country list is required' }),
  currencyCode: z.string().min(2, { message: 'Country code is required' }),

  id: z.string().nullable().optional(),
  effectiveFrom: z
    .union([z.date(), z.iso.datetime({ message: 'Invalid date format' })])

    .nullable()
    .optional(),
  effectiveTo: z
    .union([z.date(), z.iso.datetime({ message: 'Invalid date format' })])

    .nullable()
    .optional(),

  code: z.string().min(2, 'Code must be at least 3 characters'),
  isTaxable: z.boolean().default(false).optional(),
  isActive: z.boolean().default(false).optional(),
});

export type PriceList = z.infer<typeof priceListSchema>;
export const formatValue = (val: string | number | boolean | Date | null | undefined): string => {
  if (val === null || val === undefined || val === '') return '—';

  if (val instanceof Date) {
    return val.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  if (typeof val === 'boolean') return val ? 'Yes' : 'No';

  return val.toString();
};

export const pricelistEntrySchema = z.object({
  name: z.string().min(2, { message: 'List name must be at least 2 characters' }).trim(),
  description: z.string().nullable().optional(),
  amount: z.coerce.number().min(0, { message: 'amount price must be at least 0' }),
  discountPct: z.coerce.number().min(0, { message: 'discountPct price must be at least 0' }),
  billingFrequency: z.string().min(1, { message: 'Billing frequency is required' }).trim(),
  id: z.string().nullable().optional(),
  // priceBookEntryId: z.string().min(1, { message: 'Price book entry is required' }),
  effectiveFrom: z
    .union([
      z.date(),
      z
        .string()
        .datetime({ message: 'Invalid date format for Effective From' })
        .transform((val) => (val ? new Date(val) : null)),
    ])

    .nullable()
    .optional(),

  effectiveTo: z
    .union([
      z.date(),
      z
        .string()
        .datetime({ message: 'Invalid date format for Effective To' })
        .transform((val) => (val ? new Date(val) : null)),
    ])

    .nullable()
    .optional(),
});

export type PricelistEntry = z.infer<typeof pricelistEntrySchema>;

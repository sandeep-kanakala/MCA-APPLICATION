import { z } from 'zod';

const optionalNumber = (min: number = 0, message?: string) =>
  z
    .union([z.string(), z.number(), z.null()])
    .transform((val) => {
      if (val === null || val === undefined || val === '') return null;
      const num = typeof val === 'string' ? parseFloat(val) : val;
      return isNaN(num) ? null : num;
    })
    .pipe(
      z
        .number()
        .min(min, { message: message || `Value must be at least ${min}` })
        .nullable(),
    )
    .optional();

const optionalInteger = (min: number = 0, message?: string) =>
  z
    .union([z.string(), z.number(), z.null()])
    .transform((val) => {
      if (val === null || val === undefined || val === '') return null;
      const num = typeof val === 'string' ? parseInt(val, 10) : val;
      return isNaN(num) ? null : num;
    })
    .pipe(
      z
        .number()
        .int()
        .min(min, { message: message || `Value must be at least ${min}` })
        .nullable(),
    )
    .optional();

export const productSchema = z.object({
  id: z.string(),
  name: z.string().min(1, { message: 'Product name is required' }),
  type: z.enum(['GOOD', 'SERVICE', 'SUBSCRIPTION'], {
    message: 'Product type must be one of GOOD, SERVICE, or SUBSCRIPTION',
  }),
  sku: z.string().min(1, { message: 'Product Code is required' }),
  description: z.string().nullable().optional(),
  isArchived: z.boolean().optional(),
  family: z.string().nullable().optional(),
  unitPrice: optionalNumber(0, 'Unit price must be a non-negative number'),
  currencyCode: z
    .string()
    .length(3, { message: 'Currency code must be 3 characters' })
    .nullable()
    .optional(),
  defaultBillingPeriod: z.enum(['DAY', 'WEEK', 'MONTH', 'QUARTER', 'YEAR']).nullable().optional(),
  defaultTermMonths: optionalInteger(1, 'Default term months must be a positive integer'),
  specification: z.enum(['Simple', 'Bundle']).nullable().optional(),
  isTaxable: z.boolean().optional(),
  isBundle: z.boolean().optional(),
  bundlesAsParent: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        description: z.string().nullable().optional(),
      }),
    )
    .optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Product = z.infer<typeof productSchema>;

export const bundleItemSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  description: z.string().nullable().optional(),
});

export const productBundleSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  parentProductId: z.string(),
  name: z.string().min(1, 'Product Bundle name is required'),
  description: z.string().nullable().optional(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  isArchived: z.boolean(),
  archivedAt: z.string().nullable(),
  bundleItems: z.array(bundleItemSchema),
});

export type ProductBundle = z.infer<typeof productBundleSchema>;

export const PRODUCT_FIELDS = [
  {
    name: 'name',
    label: 'Product Name',
    type: 'text',
    placeholder: 'Enter product name',
    required: true,
  },
  {
    name: 'type',
    label: 'Product Type',
    type: 'select',
    options: ['GOOD', 'SERVICE', 'SUBSCRIPTION'],
    required: true,
  },
  { name: 'sku', label: 'SKU', type: 'text', placeholder: 'Enter SKU (optional)' },
  {
    name: 'description',
    label: 'Description',
    type: 'text',
    placeholder: 'Enter description (optional)',
  },
  { name: 'family', label: 'Family', type: 'text', placeholder: 'Enter product family (optional)' },
  { name: 'unitPrice', label: 'Unit Price', type: 'number', placeholder: 'e.g., 99.99' },
  { name: 'currencyCode', label: 'Currency Code', type: 'text', placeholder: 'e.g., USD' },
  {
    name: 'defaultBillingPeriod',
    label: 'Default Billing Period',
    type: 'select',
    options: ['DAY', 'WEEK', 'MONTH', 'QUARTER', 'YEAR'],
  },
  {
    name: 'defaultTermMonths',
    label: 'Default Term Months',
    type: 'number',
    placeholder: 'e.g., 12',
  },
  {
    name: 'specification',
    label: 'Specification',
    type: 'select',
    options: ['Simple', 'Bundle'],
  },
];

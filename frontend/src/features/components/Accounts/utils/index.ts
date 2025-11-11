import { z } from 'zod';
import type { FieldConfig } from '../../EntityFormComponent';
import { accountConstraints } from '@/utils/constraints';

const optionalString = (minLength: number, message: string) =>
  z
    .string()
    .trim()
    .superRefine((val, ctx) => {
      if (val && val.length > 0 && val.length < minLength) {
        ctx.addIssue({
          code: 'too_small',
          minimum: minLength,
          type: 'string',
          inclusive: true,
          origin: 'string',
          message: message,
        });
      }
    })
    .transform((e) => (e === '' ? undefined : e))
    .nullish();
const onlyLettersRegex = /^[A-Za-z]+(?:\s[A-Za-z]+)*$/;
const addressRegex = /^[A-Za-z0-9\s.,#/-]+$/;
const postalRegex = /^[A-Za-z0-9\s-]+$/;
export const ACCOUNT_FIELDS: FieldConfig[] = [
  { name: 'name', label: 'Account Name', type: 'text', required: true },
  {
    name: 'type',
    label: 'Account Type',
    type: 'select',
    required: true,
    options: accountConstraints.selectOptions.type,
  },
  {
    name: 'industry',
    label: 'Industry',
    type: 'select',
    options: accountConstraints.selectOptions.industry,
  },
  { name: 'website', label: 'Website', type: 'url', required: true },
  {
    name: 'phone',
    label: 'Phone',
    type: 'tel',
    placeholder: 'e.g., +911234567890',
    required: true,
  },

  { name: 'billingStreet', label: 'Billing Street', type: 'text' },
  { name: 'billingCity', label: 'Billing City', type: 'text' },
  { name: 'billingState', label: 'Billing State', type: 'text' },
  { name: 'billingPostal', label: 'Billing Postal Code', type: 'text' },
  { name: 'billingCountry', label: 'Billing Country', type: 'text' },

  { name: 'shippingStreet', label: 'Shipping Street', type: 'text' },
  { name: 'shippingCity', label: 'Shipping City', type: 'text' },
  { name: 'shippingState', label: 'Shipping State', type: 'text' },
  { name: 'shippingPostal', label: 'Shipping Postal Code', type: 'text' },
  { name: 'shippingCountry', label: 'Shipping Country', type: 'text' },
];
export const accountSchema = z.object({
  name: z
    .string({ error: 'Account name is required' })
    .trim()
    .min(2, { message: 'Account name must be at least 2 characters' })
    .max(49, { message: 'Account name cannot exceed 49 characters' })
    .regex(/^[A-Za-z\s]+$/, {
      message: 'Account name cannot contain numbers, special characters, or only spaces',
    }),
  type: z
    .string({
      error: 'Account type is required',
    })
    .min(2, {
      message: 'Account type is required',
    }),
  industry: optionalString(2, 'Industry must be at least 2 characters'),

  website: z
    .url('Invalid website URL')
    .trim()
    .transform((e) => (e === '' ? undefined : e))
    .nullish(),
  phone: z
    .string()
    .regex(/^\+?\d{1,4}[1-9]\d{9,14}$/, 'Invalid phone number')
    .nullable()
    .optional(),

  id: z.string().nullable().optional(),
  billingStreet: optionalString(2, 'Billing street must be at least 2 characters')
    .refine((val) => !val || addressRegex.test(val), {
      message:
        'Billing street can only contain letters, numbers, spaces, and characters (., #, /, -)',
    })
    .refine((val) => !val || val.length <= 49, {
      message: 'Billing street cannot exceed 49 characters',
    }),

  billingCity: optionalString(2, 'Billing city must be at least 2 characters')
    .refine((val) => !val || onlyLettersRegex.test(val), {
      message: 'Billing city cannot contain numbers, special characters, or only spaces',
    })
    .refine((val) => !val || val.length <= 49, {
      message: 'Billing city cannot exceed 49 characters',
    }),

  billingState: optionalString(2, 'Billing state must be at least 2 characters')
    .refine((val) => !val || onlyLettersRegex.test(val), {
      message: 'Billing state cannot contain numbers, special characters, or only spaces',
    })
    .refine((val) => !val || val.length <= 49, {
      message: 'Billing state cannot exceed 49 characters',
    }),

  billingPostal: optionalString(2, 'Billing postal code must be at least 2 characters')
    .refine((val) => !val || postalRegex.test(val), {
      message: 'Billing postal code can only contain letters, numbers, spaces, or dashes',
    })
    .refine((val) => !val || val.length <= 49, {
      message: 'Billing postal code cannot exceed 49 characters',
    }),

  billingCountry: optionalString(2, 'Billing country must be at least 2 characters')
    .refine((val) => !val || onlyLettersRegex.test(val), {
      message: 'Billing country cannot contain numbers, special characters, or only spaces',
    })
    .refine((val) => !val || val.length <= 49, {
      message: 'Billing country cannot exceed 49 characters',
    }),

  shippingStreet: optionalString(2, 'Shipping street must be at least 2 characters')
    .refine((val) => !val || addressRegex.test(val), {
      message:
        'Shipping street can only contain letters, numbers, spaces, and characters (., #, /, -)',
    })
    .refine((val) => !val || val.length <= 49, {
      message: 'Shipping street cannot exceed 49 characters',
    }),

  shippingCity: optionalString(2, 'Shipping city must be at least 2 characters')
    .refine((val) => !val || onlyLettersRegex.test(val), {
      message: 'Shipping city cannot contain numbers, special characters, or only spaces',
    })
    .refine((val) => !val || val.length <= 49, {
      message: 'Shipping city cannot exceed 49 characters',
    }),

  shippingState: optionalString(2, 'Shipping state must be at least 2 characters')
    .refine((val) => !val || onlyLettersRegex.test(val), {
      message: 'Shipping state cannot contain numbers, special characters, or only spaces',
    })
    .refine((val) => !val || val.length <= 49, {
      message: 'Shipping state cannot exceed 49 characters',
    }),

  shippingPostal: optionalString(2, 'Shipping postal code must be at least 2 characters')
    .refine((val) => !val || postalRegex.test(val), {
      message: 'Shipping postal code can only contain letters, numbers, spaces, or dashes',
    })
    .refine((val) => !val || val.length <= 49, {
      message: 'Shipping postal code cannot exceed 49 characters',
    }),

  shippingCountry: optionalString(2, 'Shipping country must be at least 2 characters')
    .refine((val) => !val || onlyLettersRegex.test(val), {
      message: 'Shipping country cannot contain numbers, special characters, or only spaces',
    })
    .refine((val) => !val || val.length <= 49, {
      message: 'Shipping country cannot exceed 49 characters',
    }),
  description: z.string().nullable().optional(),
});
export type Account = z.infer<typeof accountSchema>;

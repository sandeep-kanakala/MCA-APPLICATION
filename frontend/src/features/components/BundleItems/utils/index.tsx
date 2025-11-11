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

const optionalBoolean = () =>
  z
    .union([z.boolean(), z.string(), z.null()])
    .transform((val) => {
      if (val === null || val === undefined || val === '') return false;
      if (typeof val === 'string') return val.toLowerCase() === 'true';
      return val;
    })
    .optional();

export const bundleItemSchema = z.object({
  id: z.string().optional(),
  productId: z.string().min(1, { message: 'Product ID is required' }),
  quantity: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === 'string' ? parseInt(val, 10) : val))
    .pipe(z.number().int().min(1, { message: 'Quantity must be at least 1' })),
  pricingMode: z
    .enum(['INHERIT', 'OVERRIDE', 'INCLUDED'], {
      message: 'Pricing mode must be INHERIT, OVERRIDE, or INCLUDED',
    })
    .optional()
    .nullable(),
  overridePrice: optionalNumber(0, 'Override price must be a non-negative number'),
  isRequired: optionalBoolean(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type BundleItem = z.infer<typeof bundleItemSchema> & {
  product?: { id?: string; name: string };
};

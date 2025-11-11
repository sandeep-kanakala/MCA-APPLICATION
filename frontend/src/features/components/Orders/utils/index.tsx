import { z } from 'zod';

export const orderSchema = z.object({
  id: z.string(),

  tenantId: z.string(),
  billingAccountId: z.string(),
  opportunityId: z.string().nullable().optional(),
  quoteId: z.string().nullable().optional(),
  ownerId: z.string().nullable().optional(),

  orderNumber: z.number(),
  status: z.string(),

  orderedAt: z.string().nullable().optional(),
  activatedAt: z.string().nullable().optional(),

  totalAmount: z.coerce.number(),
  currencyCode: z.string(),

  originalOrderId: z.string().nullable().optional(),

  createdById: z.string().nullable().optional(),
  updatedById: z.string().nullable().optional(),

  createdAt: z.string(),
  updatedAt: z.string(),

  isArchived: z.boolean(),
  archivedAt: z.string().nullable().optional(),
  items: z.array(z.any()).optional(),
});

export type Order = z.infer<typeof orderSchema>;

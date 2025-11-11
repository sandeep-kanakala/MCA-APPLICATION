import { z } from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';

export const OrderItemReplaceRequestSchema = z.object({
  orderId: z.string().trim().cuid({ message: 'Invalid cart ID format' }),
  existingOrderItemId: z
    .string()
    .trim()
    .cuid({ message: 'Invalid existing order item ID format' }),
  targetPriceBookEntryId: z
    .string()
    .trim()
    .cuid({ message: 'Invalid target price book entry ID format' }),
});

export class OrderItemReplaceRequestDto extends createZodDto(
  OrderItemReplaceRequestSchema,
) {}

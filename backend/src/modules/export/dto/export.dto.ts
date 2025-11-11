import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

export enum ExportEntity {
  Account = 'account',
  Contact = 'contact',
  Product = 'product',
  Order = 'order',
  User = 'user',
  Asset = 'asset',
  ProductBundle = 'productBundle',
  ProductBundleItem = 'productBundleItem',
  PriceList = 'priceList',
  PriceListEntry = 'priceListEntry',
  PriceBook = 'priceBook',
  PriceBookEntry = 'priceBookEntry',
  OrderItem = 'orderItem',
}

const ExportSchema = z.object({
  entity: z.nativeEnum(ExportEntity),
  format: z.enum(['CSV', 'XLSX']),
  from: z.string().optional(),
  to: z.string().optional(),
  isArchived: z.string().optional(),
  min: z.coerce.number().optional().default(1),
  max: z.coerce.number().optional().default(1000),
});

export class ExportDto extends createZodDto(ExportSchema) {}

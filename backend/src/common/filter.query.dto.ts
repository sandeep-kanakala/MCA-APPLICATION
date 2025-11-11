import { z } from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';

const AccountsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  isArchived: z.enum(['true', 'false']).default('false'),
  sortByField: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  search: z.string().optional(),
  type: z.string().optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
});

const AssetsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(10),
  accountId: z.string().cuid().optional(),
  isArchived: z.enum(['true', 'false']).default('false'),
  status: z.string().optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  sortByField: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

const ContactsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  accountId: z.string().cuid('invalid account ID').optional(),
  isArchived: z.enum(['true', 'false']).default('false'),
  sortByField: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  search: z.string().optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
});

const OrdersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  accountId: z.string().cuid('invalid account ID').optional(),
  isArchived: z.enum(['true', 'false']).default('false'),
  sortByField: z.string().optional().default('createdAt'),
  status: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  search: z.string().optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
});

const PricebooksQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  search: z.string().optional(),
  isArchived: z.enum(['true', 'false']).default('false'),
  type: z.string().optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  sortByField: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

const PriceListsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  search: z.string().optional(),
  isArchived: z.enum(['true', 'false']).default('false'),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  sortByField: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

const BundlesQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

export const ProductsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  sortByField: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  search: z.string().optional(),
  isArchived: z.enum(['true', 'false']).default('false'),
  type: z.string().optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
});

export const UsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  isArchived: z.enum(['true', 'false']).default('false'),
  search: z.string().optional(),
  role: z.string().optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  sortByField: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export class UsersQueryDto extends createZodDto(UsersQuerySchema) {}
export class AccountsQueryDto extends createZodDto(AccountsQuerySchema) {}
export class AssetsQueryDto extends createZodDto(AssetsQuerySchema) {}
export class ContactsQueryDto extends createZodDto(ContactsQuerySchema) {}
export class OrdersQueryDto extends createZodDto(OrdersQuerySchema) {}
export class PriceBooksQueryDto extends createZodDto(PricebooksQuerySchema) {}
export class PriceListsQueryDto extends createZodDto(PriceListsQuerySchema) {}
export class ProductsQueryDto extends createZodDto(ProductsQuerySchema) {}
export class BundlesQueryDto extends createZodDto(BundlesQuerySchema) {}

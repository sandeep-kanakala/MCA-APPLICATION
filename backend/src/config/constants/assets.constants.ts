import { AssetStatus } from '@prisma/client';

export const ALLOWED_FILTER_FIELDS = [
  'status',
  'productId',
  'accountId',
  'createdById',
  'updatedById',
];

export const ALLOWED_SORT_FIELDS = [
  'createdAt',
  'updatedAt',
  'status',
  'activatedAt',
  'expiresAt',
];

export const VALID_STATUS_VALUES = Object.values(AssetStatus);

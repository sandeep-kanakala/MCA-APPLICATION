import type { PriceBook, PriceBookEntry } from '@/features/components/PriceBooks/utils';
export interface CreateAccountRequest {
  name?: string;
  type?: string;
  industry?: string;
  website?: string;
  phone?: string;
  billingStreet?: string;
  billingCity?: string;
  billingState?: string;
  billingPostal?: string;
  billingCountry?: string;
  shippingStreet?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingPostal?: string;
  shippingCountry?: string;
}

export interface GetAllParams {
  limit: number;
  page: number;
  filters?: Record<string, string[]>;
  sortByField?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface User {
  id: string;
  middleName: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phoneNo: string | null;
  roles: string[];
  message?: string;
}

export interface CreateContactRequest {
  id?: string;
  accountId: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  title: string;
  message?: string;
}

export interface FieldProps {
  label: string;
  value: string | string[] | null | undefined;
  fieldKey: keyof User;
  isEditable: boolean;
  isEditing: boolean;
  tempValue: string | string[];
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onTempChange: (value: string | string[]) => void;
}

export interface DetailFieldProps {
  label: string;
  value: string | number | boolean | any[] | null | undefined;
  fieldKey: string;
  isEditable: boolean;
  isEditing: boolean;
  tempValue: string;
  onEdit: (field: any) => void;
  onSave: () => void;
  onCancel: () => void;
  onTempChange: (value: string) => void;
}

export type AuditLogData = {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  createdAt: string;
  details: {
    before: any;
    after: any;
    body: any;
    response?: { message: string };
    user: {
      userId: string;
      tenantId: string;
      email: string;
    };
  };
};

export interface AuditLogResponse {
  statusCode: number;
  message: string;
  data: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    data: AuditLogData[];
  };
}
export interface EventLogItem {
  id: string;
  event: string;
  data: string;
  account: string;
  createdBy: string;
  createdAt: string;
}
export interface Response<T = any> {
  data: T | null;
  message: string;
  status: 'success' | 'error' | 'pending';
  statusCode: number;
}

export interface PriceBookFieldProps {
  label: string;
  value: string | string[] | null | undefined;
  fieldKey: keyof PriceBook | string;
  isEditable: boolean;
  isEditing: boolean;
  tempValue: string | string[];
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onTempChange: (value: string | string[]) => void;
}

export interface PriceBookEntryFieldProps {
  label: string;
  value: string | number | null | undefined;
  fieldKey: keyof PriceBookEntry | string;
  isEditable: boolean;
  isEditing: boolean;
  tempValue: string | number;
  onEdit: (field: keyof PriceBookEntry) => void;
  onSave: () => void;
  onCancel: () => void;
  onTempChange: (value: string | number) => void;
}
export interface Product {
  id?: string;
  name: string;
  sku?: string | null;
  description?: string | null;
  family?: string | null;
  type: 'GOOD' | 'SERVICE' | 'SUBSCRIPTION';
  unitPrice?: number | null;
  currencyCode?: string | null;
  defaultBillingPeriod?: 'DAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR' | null;
  defaultTermMonths?: number | null;
  specification?: 'Simple' | 'Bundle' | null;
  isTaxable?: boolean;
  isBundle?: boolean;
  bundlesAsParent?: ProductBundle[];
  createdAt?: string;
  updatedAt?: string;
}

export type CreateProductPayload = Omit<Product, 'id'>;
export type UpdateProductPayload = Partial<CreateProductPayload>;

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}

export interface ProductBundle {
  id: string;
  name: string;
  description?: string;
}

export type CreateProductBundlePayload = Omit<ProductBundle, 'id'>;

export interface ProductBundleListResponse {
  bundles: ProductBundle[];
  total: number;
  page: number;
  limit: number;
}

export interface BundleItem {
  id?: string;
  bundleId: string;
  productId: string;
  quantity: number;
  discount?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

// Create DTO
export type CreateBundleItemPayload = Omit<BundleItem, 'id' | 'createdAt' | 'updatedAt'>;

// Update DTO
export type UpdateBundleItemPayload = Partial<CreateBundleItemPayload>;

// List Response
export interface BundleItemListResponse {
  bundleItems: BundleItem[];
  total: number;
  page: number;
  limit: number;
}
export interface CreatePricelistRequest {
  name: string;
  description?: string;
  code?: string;
  currencyCode?: string;
  country?: string;
  accountType: string;
  accountId: string;

  effectiveFrom?: string; // ISO Date string
  effectiveTo?: string; // ISO Date string
  isTaxable?: boolean;
  isctive?: boolean;
}
export interface CreatePricelistEntryRequest {
  name: string;
  description?: string;
  productId: string;
  amount: number;
  unitPrice: number;
  discountPct: number;
  billingFrequency: string;

  currency?: string;

  effectiveFrom?: string; // ISO Date string
  effectiveTo?: string; // ISO Date string
  priceBookEntryId: string;
}

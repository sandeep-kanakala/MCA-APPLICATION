import type { ColumnDef } from '@tanstack/react-table';

export type FetchParams = {
  page?: number; // 1-based
  limit?: number;
  sort?: any;
  filters?: any;
  search?: string;
};

export type FetchResponse<T> = {
  data: T[];
  total: number;
};

export type EntityTableProps<T> = {
  entityName: string;
  columns: ColumnDef<T>[];
  fetchService: any;
  onRowClick?: (row: T) => void;
  onAdd?: () => void;
  initialPageSize?: number;
  rowIdKey?: keyof T | ((row: T) => string);
  serverFilterKeys?: any;
  sortFields?: readonly string[];
  customFilterKey?: string;
};

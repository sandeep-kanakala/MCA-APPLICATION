import { useMemo } from 'react';
import EntityTable from '@/features/components/EntityTable/EntityTable';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { getSelectableColumns } from '../EntityTable/utils';
import type { ColumnDef } from '@tanstack/react-table';
import { productSchema } from './utils';
import productService from '@/utils/services/Products';

type Product = z.infer<typeof productSchema> & { id: string };

export default function ProductsPage() {
  const navigate = useNavigate();

  const schemaKeys = useMemo<(keyof Product)[]>(
    () => ['name', 'type', 'description', 'specification'],
    [],
  );

  const serverFilterKeys = useMemo<(keyof Product)[]>(() => ['type', 'isArchived'], []);

  const sortFields = [
    ...Object.keys(productSchema.shape),
    'createdAt',
    'updatedAt',
    'createdBy',
    'updatedBy',
  ] as const;

  const columns: ColumnDef<Product>[] = useMemo(() => {
    const baseColumns = getSelectableColumns<Product>(schemaKeys, serverFilterKeys);
    return baseColumns.map((col) => {
      if ('accessorKey' in col && col.accessorKey === 'specification') {
        return {
          ...col,
          cell: ({ row }:any) => {
            const product = row.original;
            return <span className="font-medium">{product.isBundle ? 'Bundle' : 'Simple'}</span>;
          },
        };
      }
      return col;
    });
  }, [schemaKeys, serverFilterKeys]);

  return (
    <EntityTable<Product>
      entityName="Products"
      columns={columns}
      fetchService={productService}
      onAdd={() => navigate('create')}
      initialPageSize={10}
      rowIdKey="id"
      serverFilterKeys={serverFilterKeys}
      customFilterKey="productType"
      sortFields={sortFields}
      onRowClick={(row) => navigate(`/apps/sales/products/${row.id}`, { state: { product: row } })}
    />
  );
}

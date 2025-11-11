import { useMemo } from 'react';
import EntityTable from '@/features/components/EntityTable/EntityTable';
import orderService from '@/utils/services/Orders';
import { orderSchema, type Order } from './utils';
import { getSelectableColumns } from '../EntityTable/utils';
import type { ColumnDef } from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';

export default function OrdersPage() {
  const navigate = useNavigate();
  const schemaKeys = useMemo(
    () => ['orderNumber', 'status', 'accountId', 'totalAmount', 'orderedAt'] as (keyof Order)[],
    [],
  );

  const serverFilterKeys = useMemo(() => ['status'] as (keyof Order)[], []);

  const sortFields = useMemo(
    () =>
      [
        ...Object.keys(orderSchema.shape),
        'createdAt',
        'updatedAt',
        'createdBy',
        'updatedBy',
      ] as const,
    [],
  );

  const columns: ColumnDef<Order>[] = useMemo(() => {
    return getSelectableColumns<Order>(schemaKeys, serverFilterKeys);
  }, [schemaKeys, serverFilterKeys]);

  return (
    <EntityTable<Order>
      entityName="Orders"
      columns={columns}
      fetchService={orderService}
      onRowClick={(row) => navigate(`/apps/sales/orders/${row.id}`, { state: { order: row } })}
      initialPageSize={10}
      rowIdKey="id"
      serverFilterKeys={serverFilterKeys}
      sortFields={sortFields}
      customFilterKey={'orderStatus'}
    />
  );
}

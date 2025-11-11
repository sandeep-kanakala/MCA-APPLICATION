import { useMemo } from 'react';
import EntityTable from '@/features/components/EntityTable/EntityTable';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import type { ColumnDef } from '@tanstack/react-table';

import priceListService from '@/utils/services/product-pricelist';
import type { priceListSchema } from './utils';
import { getSelectableColumns } from '../EntityTable/utils';

type PriceList = z.infer<typeof priceListSchema>;

export default function ProductlistDetailView() {
  const navigate = useNavigate();
  const schemaKeys: any = useMemo(
    () => ['name', 'accountType', 'country', 'currencyCode', 'effectiveFrom', 'effectiveTo'],
    [],
  );
  const serverFilterKeys = useMemo(() => ['isArchived'] as unknown as (keyof PriceList)[], []);
  const columns: ColumnDef<PriceList>[] = useMemo(() => {
    return getSelectableColumns<PriceList>(schemaKeys, serverFilterKeys);
  }, [schemaKeys, serverFilterKeys]);

  return (
    <EntityTable<PriceList>
      entityName="Price List"
      columns={columns}
      fetchService={priceListService}
      onAdd={() => navigate('create')}
      onRowClick={(row) =>
        navigate(`/apps/sales/pricelist/${row.id}`, { state: { pricelist: row } })
      }
      initialPageSize={10}
      rowIdKey="id"
      serverFilterKeys={serverFilterKeys}
    />
  );
}

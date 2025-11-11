import { useMemo } from 'react';
import EntityTable from '@/features/components/EntityTable/EntityTable';
import pricebookService from '@/utils/services/pricebook';
import { useNavigate } from 'react-router-dom';
import { PriceBookSchema } from './utils';
import { z } from 'zod';
import { getSelectableColumns } from '../EntityTable/utils';
import type { ColumnDef } from '@tanstack/react-table';

type PriceBook = z.infer<typeof PriceBookSchema>;

export default function PriceBookTable() {
  const navigate = useNavigate();

  const schemaKeys: (keyof PriceBook)[] = useMemo(() => ['name', 'type', 'description'], []);

  const serverFilterKeys = useMemo(() => ['isArchived', 'type'] as (keyof PriceBook)[], []);

  const columns: ColumnDef<PriceBook>[] = useMemo(() => {
    return getSelectableColumns<PriceBook>(schemaKeys, serverFilterKeys);
  }, [schemaKeys, serverFilterKeys]);

  return (
    <EntityTable<PriceBook>
      entityName="Price Books"
      columns={columns}
      fetchService={pricebookService}
      onAdd={() => navigate('create')}
      onRowClick={(row) =>
        navigate(`/apps/sales/pricebooks/${row.id}`, { state: { priceBook: row } })
      }
      initialPageSize={10}
      rowIdKey="id"
      serverFilterKeys={serverFilterKeys}
      customFilterKey="pricebookType"
    />
  );
}

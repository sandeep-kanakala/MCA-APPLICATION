import { useMemo } from 'react';
import EntityTable from '@/features/components/EntityTable/EntityTable';
import accountService from '@/utils/services/accounts';
import { useNavigate } from 'react-router-dom';
import { accountSchema } from './utils';
import { z } from 'zod';
import { getSelectableColumns } from '../EntityTable/utils';
import type { ColumnDef } from '@tanstack/react-table';

type Account = z.infer<typeof accountSchema>;

export default function AccountsPage() {
  const navigate = useNavigate();
  const schemaKeys: any = useMemo(() => ['name', 'type', 'website', 'phone', 'industry'], []);
  const serverFilterKeys = useMemo(
    () => ['type', 'industry', 'isArchived'] as (keyof Account)[],
    [],
  );
  const sortFields = [
    ...Object.keys(accountSchema.shape),
    'createdAt',
    'updatedAt',
    'createdBy',
    'updatedBy',
  ] as const;

  const columns: ColumnDef<Account>[] = useMemo(() => {
    return getSelectableColumns<Account>(schemaKeys, serverFilterKeys);
  }, [schemaKeys, serverFilterKeys]);
  return (
    <EntityTable<Account>
      entityName="Accounts"
      columns={columns}
      fetchService={accountService}
      onAdd={() => navigate('create')}
      onRowClick={(row) => navigate(`/apps/sales/accounts/${row.id}`, { state: { account: row } })}
      initialPageSize={10}
      rowIdKey="id"
      serverFilterKeys={serverFilterKeys}
      sortFields={sortFields}
      customFilterKey="accountType"
    />
  );
}

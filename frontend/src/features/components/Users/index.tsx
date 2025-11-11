import { useMemo } from 'react';
import EntityTable from '@/features/components/EntityTable/EntityTable';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { getSelectableColumns } from '../EntityTable/utils';
import type { ColumnDef } from '@tanstack/react-table';
import { userSchema } from './utils';
import userService from '@/utils/services/user';

type User = z.infer<typeof userSchema>;

export default function UsersPage() {
  const navigate = useNavigate();
  const schemaKeys = ['email', 'firstName', 'lastName', 'roles'] as any;
  const serverFilterKeys = useMemo(() => ['isArchived', 'roles'] as (keyof User)[], []);
  const sortFields = [
    ...Object.keys(userSchema.shape),
    'createdAt',
    'updatedAt',
    'createdBy',
    'updatedBy',
  ] as const;
  const columns: ColumnDef<User>[] = useMemo(() => {
    return getSelectableColumns<User>(schemaKeys, serverFilterKeys);
  }, [schemaKeys, serverFilterKeys]);
  return (
    <EntityTable<User>
      entityName="Users"
      columns={columns}
      fetchService={userService}
      onAdd={() => navigate('create')}
      onRowClick={(row: any) => navigate(`/setting/users/${row.id}`, { state: { user: row } })}
      initialPageSize={10}
      rowIdKey={'id' as any}
      serverFilterKeys={serverFilterKeys}
      sortFields={sortFields}
    />
  );
}

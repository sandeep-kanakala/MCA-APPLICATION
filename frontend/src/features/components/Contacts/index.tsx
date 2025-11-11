import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import type { contactSchema } from './utils';
import type { AccessorKeyColumnDef, ColumnDef } from '@tanstack/react-table';

import EntityTable from '@/features/components/EntityTable/EntityTable';
import contactService from '@/utils/services/contacts';
import { getSelectableColumns } from '../EntityTable/utils';
type Contact = z.infer<typeof contactSchema>;

export default function ContactsPage() {
  const navigate = useNavigate();

  const schemaKeys: (keyof Contact)[] = [
    'firstName',
    'email',
    'phone',
    'accountId',
    'lastName',
    'title',
    'description',
  ];

  const serverFilterKeys: (keyof Contact)[] = ['firstName', 'lastName'];

  const columns: ColumnDef<Contact>[] = useMemo(() => {
    const baseColumns = getSelectableColumns<Contact>(schemaKeys, serverFilterKeys, true);

    return baseColumns.map((col) => {
      const accessorCol = col as AccessorKeyColumnDef<Contact>;

      if (accessorCol.accessorKey === 'accountId') {
        return {
          ...accessorCol,
          header: 'Account',
          cell: ({ row }) => {
            return row.original.account?.name ?? '-';
          },
        };
      }
      if (accessorCol.accessorKey === 'description') {
        return {
          ...accessorCol,
          cell: ({ row }) => {
            const desc = row.original.description;
            return desc ? (desc.length > 60 ? desc.slice(0, 60) + '...' : desc) : '-';
          },
        };
      }

      return accessorCol;
    });
  }, [schemaKeys, serverFilterKeys]);

  return (
    <EntityTable<Contact>
      entityName="Contacts"
      columns={columns}
      fetchService={contactService}
      onAdd={() => navigate('create')}
      onRowClick={(row: any) =>
        navigate(`/apps/sales/contacts/${row.id}`, { state: { contact: row } })
      }
      initialPageSize={10}
      serverFilterKeys={serverFilterKeys}
    />
  );
}

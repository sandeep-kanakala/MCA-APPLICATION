import { Checkbox } from '@/components/ui/checkbox';
import type { ColumnDef } from '@tanstack/react-table';

export function getSelectableColumns<T extends Record<string, any>>(
  schemaKeys: (keyof T)[],
  serverFilterKeys: (keyof T)[] = [],
  enableRowSelection: boolean = true,
): ColumnDef<T>[] {
  const selectColumn: ColumnDef<T> = {
    id: 'select',
    header: ({ table }) => (
      <div className="flex items-center justify-start">
        <Checkbox
          className="cursor-pointer"
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(v: any) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-start" onClick={(e) => e.stopPropagation()}>
        <Checkbox
          className="cursor-pointer"
          checked={row.getIsSelected()}
          onCheckedChange={(v: any) => row.toggleSelected(!!v)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    size: 50,
  };
  const dataColumns: ColumnDef<T>[] = schemaKeys.map((key) => {
    const isServerFiltered = serverFilterKeys.includes(key);
    const headerLabel = String(key).charAt(0).toUpperCase() + String(key).slice(1);

    let columnDefinition: ColumnDef<T> = {
      accessorKey: key as string,
      header: headerLabel,
      enableHiding: true,
      enableColumnFilter: isServerFiltered,
      filterFn: isServerFiltered ? 'arrIncludesSome' : 'includesString',
      size: key === 'website' ? 200 : 150,
      cell: ({ getValue }: any) => {
        const value = getValue();
        return <span className="font-medium">{value ? value : 'N/A'}</span>;
      },
    } as ColumnDef<T>;

    if (key === 'isArchived') {
      columnDefinition = {
        ...columnDefinition,
        accessorFn: (row: T) => {
          const value = row[key];
          if (value === true || value === 'true') return 'InActive';
          if (value === false || value === 'false') return 'Active';
          return 'N/A';
        },
        cell: ({ row }: any) => {
          const isArchived = row.original?.isArchived;
          if (isArchived === true || isArchived === 'true') {
            return <span className="font-medium">InActive</span>;
          } else if (isArchived === false || isArchived === 'false') {
            return <span className="font-medium">Active</span>;
          }
          return <span className="font-medium">N/A</span>;
        },
      } satisfies ColumnDef<T>;
    } else if (key === 'specification') {
      columnDefinition = {
        ...columnDefinition,
        accessorFn: (row: T) => {
          const isBundle = row.isBundle;
          if (isBundle === true || isBundle === 'true') return 'Bundle';
          if (isBundle === false || isBundle === 'false') return 'Simple';
          return 'N/A';
        },
        cell: ({ row }: any) => {
          const isBundle = row.original?.isBundle;
          if (isBundle === true || isBundle === 'true') {
            return <span className="font-medium">Bundle</span>;
          } else if (isBundle === false || isBundle === 'false') {
            return <span className="font-medium">Simple</span>;
          }
          return <span className="font-medium">N/A</span>;
        },
      } satisfies ColumnDef<T>;
    }

    return columnDefinition;
  });

  return enableRowSelection ? [selectColumn, ...dataColumns] : dataColumns;
}

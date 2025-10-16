import * as React from 'react';
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
  type RowSelectionState,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface CustomTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  globalFilter?: string;
  onGlobalFilterChange?: (filter: string) => void;
  enableRowSelection?: boolean;
  initialPageSize?: number;
  className?: string;
  rowIdKey?: keyof TData;
  sorting: SortingState;
  onSortingChange: (updater: any) => void;
  pagination: { pageIndex: number; pageSize: number };
  onPaginationChange: (updater: any) => void;
  columnVisibility: VisibilityState;
  onColumnVisibilityChange: (updater: any) => void;
  rowSelection: RowSelectionState;
  onRowSelectionChange: (updater: any) => void;
  columnFilters: ColumnFiltersState;
  onColumnFiltersChange: (updater: any) => void;
}

export function CustomTable<TData>({
  data,
  columns,
  globalFilter = '',
  onGlobalFilterChange,
  enableRowSelection = false,
  className = '',
  rowIdKey = 'id' as keyof TData,
  sorting,
  onSortingChange,
  pagination,
  onPaginationChange,
  columnVisibility,
  onColumnVisibilityChange,
  rowSelection,
  onRowSelectionChange,
  columnFilters,
  onColumnFiltersChange,
}: CustomTableProps<TData>) {
  const [internalData, setInternalData] = React.useState(data);

  React.useEffect(() => {
    setInternalData(data);
  }, [data]);

  const totalMinWidth = React.useMemo(() => {
    return columns.reduce((sum, col) => sum + (col.size || 0), 0) + 20;
  }, [columns]);

  const table = useReactTable({
    data: internalData,
    columns,
    state: { sorting, columnVisibility, rowSelection, columnFilters, pagination, globalFilter },
    getRowId: (row) => String(row[rowIdKey]),
    enableRowSelection,
    onGlobalFilterChange,
    onRowSelectionChange,
    onSortingChange,
    onColumnFiltersChange,
    onColumnVisibilityChange,
    onPaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    globalFilterFn: 'includesString',
  });

  return (
    <div
      className={`overflow-x-auto overflow-y-auto w-full rounded-lg border border-gray-300 ${className}`}
    >
      <Table
        className="[&_th]:text-left [&_td]:text-left [&_th]:px-3 [&_td]:px-3 [&_th]:py-1 [&_td]:py-0"
        style={{ minWidth: `${totalMinWidth}px` }}
      >
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id} className="bg-gray-100 dark:bg-gray-800">
              {hg.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="text-sm font-semibold text-gray-900 dark:text-gray-100"
                  style={{ width: header.column.columnDef.size }}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-100">
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className="font-semibold text-gray-900 dark:text-gray-100"
                  style={{ width: cell.column.columnDef.size }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

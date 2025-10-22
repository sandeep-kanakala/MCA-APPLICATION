import * as React from 'react';
import {
  type ColumnDef,
  type ColumnFiltersState,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
  type RowSelectionState,
} from '@tanstack/react-table';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { ChevronDown, Columns } from 'lucide-react';
import '@/index.css';
import accountService from '@/utils/services/accounts';
import { useEffect, useState } from 'react';
import { accountSchema } from './utils';
import { CustomTable } from '@/features/components/CustomTable';
import AccountCreate from '@/features/components/Accounts/createAccount/index';

type FormValues = z.infer<typeof accountSchema>;

const schemaKeys = ['name', 'type', 'website', 'phone', 'industry'];

const columns: ColumnDef<FormValues>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <div className="flex items-center justify-start">
        <Checkbox
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
          checked={row.getIsSelected()}
          onCheckedChange={(v: any) => row.toggleSelected(!!v)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    size: 50,
  },
  ...schemaKeys.map((key) => ({
    accessorKey: key,
    header: key.charAt(0).toUpperCase() + key.slice(1),
    cell: ({ getValue }: any) => {
      const value = getValue();
      return <span className="font-medium">{value || 'N/A'}</span>;
    },
    enableHiding: true,
  })),
];

export default function AccountsTable() {
  const navigate = useNavigate();
  const [data, setData] = React.useState<FormValues[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 20 });

  const fetchAccounts = React.useCallback(async () => {
    try {
      const response = await accountService.getAll({
        limit: pagination.pageSize,
        page: pagination.pageIndex + 1,
      });

      if (!response || !Array.isArray(response.data)) {
        throw new Error('Invalid response: accounts array is missing or not an array');
      }

      setData(response.data);
      setTotalRows(response.total ?? 0);
    } catch (err: any) {
      if (pagination.pageIndex > 0) {
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
      }
    }
  }, [pagination.pageIndex, pagination.pageSize]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleGlobalFilterChange = React.useCallback(
    (filter: string) => setGlobalFilter(filter),
    [],
  );
  const handleRowSelectionChange = React.useCallback(
    (updater: any) => setRowSelection(updater),
    [],
  );
  const handleSortingChange = React.useCallback((updater: any) => setSorting(updater), []);
  const handleColumnFiltersChange = React.useCallback(
    (updater: any) => setColumnFilters(updater),
    [],
  );
  const handleColumnVisibilityChange = React.useCallback(
    (updater: any) => setColumnVisibility(updater),
    [],
  );
  const handlePaginationChange = React.useCallback((updater: any) => setPagination(updater), []);
  const handleRowClick = React.useCallback(
    (row: any) => {
      if (row?.id) {
        navigate(`/apps/sales/accounts/${row.id}`, { state: { account: row } });
      }
    },
    [navigate],
  );
  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnVisibility, rowSelection, columnFilters, pagination, globalFilter },
    getRowId: (row: any) => row.id,
    enableRowSelection: true,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    globalFilterFn: 'includesString',
  });

  return (
    <Tabs defaultValue="outline" className="flex flex-col h-full gap-6">
      <div className="flex items-center justify-between  p-3  px-4 lg:px-6 flex-shrink-0 relative z-10">
        {/* Left side: Table title */}
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Accounts</h2>
        </div>

        {/* Right side: search, columns, add account */}
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search all columns..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="max-w-sm"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 cursor-pointer"
              >
                <Columns className="h-4 w-4" />
                <span className="hidden lg:inline">Customize Columns</span>
                <span className="lg:hidden">Columns</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="bg-gray-700 text-gray-50 border-gray-600 max-h-60 overflow-auto"
            >
              {table
                .getAllColumns()
                .filter((col) => col.getCanHide())
                .map((col) => (
                  <DropdownMenuCheckboxItem
                    key={col.id}
                    checked={col.getIsVisible()}
                    onCheckedChange={(v) => col.toggleVisibility(!!v)}
                    className="capitalize"
                  >
                    {col.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <AccountCreate onAccountCreated={fetchAccounts} />
        </div>
      </div>

      <TabsContent
        value="outline"
        className="relative flex flex-col gap-4 flex-1 min-h-0 px-4 lg:px-6"
      >
        <div className="flex-1 overflow-auto">
          <CustomTable
            data={data}
            columns={columns}
            globalFilter={globalFilter}
            onGlobalFilterChange={handleGlobalFilterChange}
            enableRowSelection={true}
            initialPageSize={20}
            className="h-[calc(100vh-200px)]"
            rowIdKey={'id' as any}
            sorting={sorting}
            onSortingChange={handleSortingChange}
            pagination={pagination}
            onPaginationChange={handlePaginationChange}
            columnVisibility={columnVisibility}
            onColumnVisibilityChange={handleColumnVisibilityChange}
            rowSelection={rowSelection}
            onRowSelectionChange={handleRowSelectionChange}
            columnFilters={columnFilters}
            onColumnFiltersChange={handleColumnFiltersChange}
            totalRows={totalRows}
            onRowClick={handleRowClick}
          />
        </div>
      </TabsContent>
    </Tabs>
  );
}

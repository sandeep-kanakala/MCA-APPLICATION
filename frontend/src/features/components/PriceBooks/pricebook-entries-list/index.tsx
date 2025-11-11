import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import type { JSX } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@radix-ui/react-checkbox';
import { CustomTable } from '@/features/components/CustomTable';
import PriceBookEntryCreateDialog from '@/features/components/PriceBooks/create-pricebook-entry';
import { type PriceBookEntry, PriceBookEntrySchema } from '../utils';
import type {
  ColumnDef,
  ColumnFiltersState,
  RowSelectionState,
  SortingState,
  VisibilityState,
  PaginationState,
} from '@tanstack/react-table';
import { formatFieldName } from '@/utils';

const customRenderers: Record<string, (value: any) => JSX.Element> = {
  isActive: (value: any) => <span className="font-medium">{value ? 'Yes' : 'No'}</span>,
  createdAt: (value: any) => (
    <span className="font-medium">{value ? new Date(value).toLocaleDateString() : 'N/A'}</span>
  ),
};

const excludedKeys = ['id', 'priceBookId', 'updatedAt', 'createdBy', 'tenantId'];

const createPriceBookEntryColumns = (): ColumnDef<PriceBookEntry, any>[] => {
  const dynamicColumns = Object.keys(PriceBookEntrySchema.shape)
    .filter((key) => !excludedKeys.includes(key))
    .map((key) => {
      const accessorKey = key as keyof PriceBookEntry;
      const customCell = customRenderers[key];

      const column: ColumnDef<PriceBookEntry, any> = {
        accessorKey: accessorKey,
        header: formatFieldName(key),
        cell: ({ getValue }) => {
          const value = getValue();
          if (customCell) {
            return customCell(value);
          }
          return <span className="font-medium">{value || 'N/A'}</span>;
        },
        enableHiding: true,
      };
      return column;
    });

  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(v: any) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v: any) => row.toggleSelected(!!v)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 50,
    },
    ...dynamicColumns,
  ];
};

interface PriceBookEntriesTabProps {
  entries: PriceBookEntry[];
  totalRows: number;
  refreshEntries: () => void;
}

const PriceBookEntriesTab: React.FC<PriceBookEntriesTabProps> = ({
  entries,
  totalRows,
  refreshEntries,
}) => {
  const navigate = useNavigate();
  const { pricebookId } = useParams<{ pricebookId: string }>();

  const [globalFilter, setGlobalFilter] = useState('');
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [entryDialogOpen, setEntryDialogOpen] = useState(false);

  const columns = useMemo(() => createPriceBookEntryColumns(), []);

  const handleRowClick = useCallback(
    (row: any) => {
      const pbookId = pricebookId;
      const pricebookentryId = row.original?.id;

      if (pbookId && pricebookentryId) {
        const targetPath = `/apps/sales/pricebook/${pbookId}/entry/${pricebookentryId}`;
        navigate(targetPath, { state: { entry: row.original } });
      } else {
        console.error('Missing IDs for navigation:', { pbookId, pricebookentryId });
      }
    },
    [navigate, pricebookId],
  );

  return (
    <div className="p-4 sm:p-6 mt-0">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-semibold">Price book entries</h1>
        <Button
          size="sm"
          className="flex items-center gap-1 bg-primary hover:bg-primary/90 text-white cursor-pointer"
          onClick={() => setEntryDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Add Entry
        </Button>
      </div>
      <div>
        {entries && entries.length > 0 ? (
          <CustomTable
            data={entries}
            columns={columns}
            globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter}
            enableRowSelection={true}
            initialPageSize={pagination.pageSize}
            className="min-w-full"
            rowIdKey={'id' as any}
            sorting={sorting}
            onSortingChange={setSorting}
            pagination={pagination}
            onPaginationChange={setPagination}
            columnVisibility={columnVisibility}
            onColumnVisibilityChange={setColumnVisibility}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            columnFilters={columnFilters}
            onColumnFiltersChange={setColumnFilters}
            totalRows={totalRows}
            showPagination={false}
            onRowClick={handleRowClick}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center px-4">
            <div className="flex flex-col items-center justify-center bg-gray-100 rounded-2xl p-10 shadow-md border border-gray-200 max-w-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-16 h-16 text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 13h6m-3-3v6m9 4H3a2 2 0 01-2-2V7a2 2 0 012-2h5l2-2h4l2 2h5a2 2 0 012 2v11a2 2 0 01-2 2z"
                />
              </svg>
              <h2 className="text-xl font-semibold text-gray-700">No Related Entries Found</h2>
              <p className="text-gray-500 mt-2 text-sm">
                This price book has no related entries yet.
              </p>
            </div>
          </div>
        )}
      </div>

      <PriceBookEntryCreateDialog
        open={entryDialogOpen}
        onOpenChange={setEntryDialogOpen}
        onSuccess={refreshEntries}
      />
    </div>
  );
};

export default PriceBookEntriesTab;

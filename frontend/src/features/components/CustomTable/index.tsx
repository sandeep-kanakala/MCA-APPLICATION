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
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
} from 'lucide-react';
import TableSkeleton from '../TableSkeleton';
import { useAppSelector } from '@/app/hooks';
import type { AppState } from '@/app/store';
import NoDataFound from '../common/noDataFound';

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
  totalRows?: number;
  onRowClick?: (row: TData) => void;
  showPagination?: boolean;
  onAddClick?: (...args: any) => void;
  emptyMessage?: string;
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
  totalRows,
  onRowClick,
  showPagination = true,
  onAddClick,
  emptyMessage,
}: CustomTableProps<TData>) {
  const [internalData, setInternalData] = React.useState(data);
  const { loader }: any = useAppSelector((state: AppState) => state.global);

  React.useEffect(() => {
    setInternalData(data);
  }, [data]);

  const totalMinWidth = React.useMemo(() => {
    return columns.reduce((sum, col) => sum + (col.size || 0), 0) + 20;
  }, [columns]);

  const table = useReactTable({
    data: internalData,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
      globalFilter,
    },
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
    manualPagination: true,
    pageCount: Math.max(Math.ceil((totalRows || 0) / pagination.pageSize), 1),
  });
  if (loader) {
    return <TableSkeleton columns={columns} />;
  }
  if (data?.length === 0) {
    return <NoDataFound message={emptyMessage} onAddClick={onAddClick} />;
  }
  return (
    <>
      <div
        className={`border-input relative flex flex-col rounded-[8px] border mx-2 justify-between overflow-hidden bg-white ${className}`}
      >
        <div className="overflow-x-auto overflow-y-auto max-h-[70vh] w-full">
          <Table
            className="w-full border-collapse table-fixed whitespace-nowrap"
            style={{ minWidth: `${totalMinWidth}px` }}
          >
            <TableHeader className="sticky top-0 z-10 bg-white dark:bg-gray-900">
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id} className="bg-white">
                  {hg.headers.map((header, index) => {
                    const isLast = index === hg.headers.length - 1;
                    const canSort = header.column.getCanSort();
                    const isSorted = header.column.getIsSorted();
                    const sortDirection =
                      isSorted === 'asc' ? 'asc' : isSorted === 'desc' ? 'desc' : false;

                    return (
                      <TableHead
                        key={header.id}
                        className="sticky top-0 z-10 bg-white border-b border-[#eaeaea] px-5 py-3 whitespace-nowrap"
                        style={{
                          width: header.column.getSize(),
                          minWidth: header.column.getSize(),
                          maxWidth: header.column.getSize(),
                        }}
                        onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                        title={canSort ? `Sort by ${header.column.id}` : undefined}
                      >
                        <div className="flex items-center gap-1">
                          {flexRender(header.column.columnDef.header, header.getContext())}

                          {canSort && (
                            <span className="ml-1">
                              {sortDirection === 'desc' ? (
                                <ArrowDown className="h-3.5 w-3.5 text-primary cursor-pointer" />
                              ) : sortDirection === 'asc' ? (
                                <ArrowUp className="h-3.5 w-3.5 text-primary cursor-pointer" />
                              ) : (
                                <ArrowUpDown className="h-3.5 w-3.5 text-gray-400 cursor-pointer" />
                              )}
                            </span>
                          )}
                        </div>

                        {!isLast && (
                          <span className="absolute right-0 top-1/2 h-4 w-px -translate-y-1/2 bg-gray-200"></span>
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {table.getRowModel().rows.map((row, index) => {
                return (
                  <>
                    <TableRow
                      key={row.id}
                      className={`h-12 cursor-pointer border-b border-[#eaeaea] transition-all duration-200 ${
                        index % 2 === 0 ? 'bg-white ' : 'bg-gray-100 '
                      } hover:bg-gray-200`}
                      onClick={() => onRowClick?.(row.original)}
                    >
                      {row.getVisibleCells().map((cell, cellIndex) => (
                        <TableCell
                          key={cell.id}
                          className="px-5 py-3 font-normal align-middle truncate max-w-[200px] whitespace-nowrap relative"
                          style={{
                            width: cell.column.getSize(),
                            minWidth: cell.column.getSize(),
                            maxWidth: cell.column.getSize(),
                          }}
                          title={String(cell.getValue() ?? '')}
                        >
                          {cellIndex === 0 && row.getIsSelected() && (
                            <div className="absolute left-0 top-1/2 h-10 w-0.5 -translate-y-1/2 bg-primary rounded"></div>
                          )}
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  </>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {showPagination && (
          <div className="flex items-center justify-between px-4 py-1 border-t border-[#eaeaea] flex-shrink-0">
            <div className="hidden flex-1 lg:flex font-medium">
              Showing {table.getRowModel().rows.length} of {totalRows} rows
            </div>
            <div className="flex w-full items-center gap-8 lg:w-fit">
              <div className="hidden items-center gap-2 lg:flex">
                <Label htmlFor="rows-per-page">Rows per page</Label>
                <Select
                  value={`${table.getState().pagination.pageSize}`}
                  onValueChange={(v) => table.setPageSize(Number(v))}
                >
                  <SelectTrigger size="sm" className="w-20 cursor-pointer" id="rows-per-page">
                    <SelectValue placeholder={table.getState().pagination.pageSize} />
                  </SelectTrigger>
                  <SelectContent side="top" className="bg-white border border-gray-200">
                    {[5, 10, 20, 30, 40, 50].map((s) => (
                      <SelectItem className="cursor-pointer" key={s} value={`${s}`}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex w-fit items-center justify-center">
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </div>
              <div className="ml-auto flex items-center gap-2 lg:ml-0">
                <Button
                  variant="outline"
                  className={`hidden h-8 w-8 p-0 lg:flex ${table.getCanPreviousPage() ? 'cursor-pointer' : ''}`}
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronsLeft />
                </Button>
                <Button
                  variant="ghost"
                  className={`size-8 ${table.getCanPreviousPage() ? 'cursor-pointer' : ''}`}
                  size="icon"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronLeft />
                </Button>
                <Button
                  variant="ghost"
                  className={`size-8 ${table.getCanNextPage() ? 'cursor-pointer' : ''}`}
                  size="icon"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronRight />
                </Button>
                <Button
                  variant="outline"
                  className={`hidden size-8 lg:flex ${table.getCanNextPage() ? 'cursor-pointer' : ''}`}
                  size="icon"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronsRight />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div
        aria-live="assertive"
        className="pointer-events-none fixed inset-0 z-50 flex items-end px-4 py-6 sm:p-6"
      >
        <div className="flex w-full flex-col items-center space-y-4 sm:items-end"></div>
      </div>
    </>
  );
}

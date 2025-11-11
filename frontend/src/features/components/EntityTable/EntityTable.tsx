import { useCallback, useEffect, useRef, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  type RowSelectionState,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { CustomTable } from '@/features/components/CustomTable';
import { useAppDispatch } from '@/app/hooks';
import { globalSliceActions } from '@/features/redux/slice';
import { useSearchParams } from 'react-router-dom';
import type { EntityTableProps, FetchParams } from './types';
import { DataTableToolbar } from '../CustomFilter';
import { extractErrorMessage } from '@/utils';
import NoDataFound from '../common/noDataFound';

function debounce<T extends (...args: any[]) => void>(fn: T, ms = 300) {
  let t: any;
  return (...args: Parameters<T>) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

export function EntityTable<T extends Record<string, any>>({
  entityName,
  columns,
  fetchService,
  onRowClick,
  onAdd,
  initialPageSize = 20,
  rowIdKey = 'id' as any,
  serverFilterKeys,
  sortFields,
  customFilterKey,
}: EntityTableProps<T>) {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPageIndex = parseInt(searchParams.get('page') || '1', 10) - 1;
  const initialPageLimit = parseInt(searchParams.get('limit') || String(initialPageSize), 10);
  const initialSearch = searchParams.get('search') || '';
  const initialSortField = searchParams.get('sortByField');
  const initialSortOrder = searchParams.get('sortOrder');
  const initialFilters: ColumnFiltersState = [];
  searchParams.forEach((value, key) => {
    if (!['page', 'limit', 'search', 'sortByField', 'sortOrder'].includes(key)) {
      initialFilters.push({ id: key, value: value.split(',') });
    }
  });

  const [data, setData] = useState<T[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [globalFilter, setGlobalFilter] = useState(initialSearch);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(initialFilters);
  const [sorting, setSorting] = useState<SortingState>(
    initialSortField ? [{ id: initialSortField, desc: initialSortOrder === 'desc' }] : [],
  );
  const [pagination, setPagination] = useState({
    pageIndex: initialPageIndex >= 0 ? initialPageIndex : 0,
    pageSize: initialPageLimit > 0 ? initialPageLimit : initialPageSize,
  });

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('page', String(pagination.pageIndex + 1));
    params.set('limit', String(pagination.pageSize));
    if (globalFilter) params.set('search', globalFilter);
    if (sorting.length > 0) {
      params.set('sortByField', sorting[0].id);
      params.set('sortOrder', sorting[0].desc ? 'desc' : 'asc');
    }

    columnFilters.forEach((f) => {
      const value = f.value;
      if (
        (Array.isArray(value) && value.length > 0) ||
        (typeof value === 'string' && value.trim() !== '')
      ) {
        params.set(f.id, Array.isArray(value) ? value.join(',') : String(value));
      }
    });
    setSearchParams(params);
  }, [pagination, globalFilter, columnFilters, sorting, setSearchParams]);

  useEffect(() => {
    const urlSortField = searchParams.get('sortByField');
    const urlSortOrder = searchParams.get('sortOrder');
    if (urlSortField) {
      setSorting([{ id: urlSortField, desc: urlSortOrder === 'desc' }]);
    } else {
      setSorting([]);
    }
  }, [searchParams]);
  const getServerFilters = useCallback(
    (currentFilters: ColumnFiltersState) => {
      const filters: Record<string, string[]> = {};
      currentFilters.forEach((filter) => {
        if (serverFilterKeys.includes(filter.id) && Array.isArray(filter.value)) {
          filters[filter.id] = filter.value;
        }
      });
      return filters;
    },
    [serverFilterKeys],
  );

  const debouncedFetchRef: any = useRef<ReturnType<typeof debounce> | null>(null);
  const fetchData = useCallback(async () => {
    const filters = getServerFilters(columnFilters);
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('No authentication token found. Please log in.');
      return;
    }
    setError(null);
    dispatch(globalSliceActions.setLoader(true));

    try {
      const sortField = sorting[0]?.id;
      const sortOrder = sorting[0]?.desc ? 'desc' : 'asc';

      const params: FetchParams = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        sort: sorting,
        filters,
        search: globalFilter,
        ...(sortField && { sortByField: sortField }),
        ...(sortOrder && { sortOrder }),
      };

      const resp = await fetchService.getAll(params);
      if (!resp || !Array.isArray(resp.data)) throw new Error('Invalid response');
      setData(resp.data);
      setTotalRows(resp.total ?? resp.data.length ?? 0);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(extractErrorMessage(err));
        if (pagination.pageIndex > 0) {
          setPagination((p) => ({ ...p, pageIndex: 0 }));
        }
      }
    } finally {
      dispatch(globalSliceActions.setLoader(false));
    }
  }, [
    fetchService,
    pagination.pageIndex,
    pagination.pageSize,
    sorting,
    columnFilters,
    globalFilter,
    dispatch,
    getServerFilters,
  ]);
  if (!debouncedFetchRef.current) {
    debouncedFetchRef.current = debounce(() => fetchData(), 500);
  }
  useEffect(() => {
    debouncedFetchRef.current = debounce(() => fetchData(), 500);
  }, [fetchData]);

  useEffect(() => {
    debouncedFetchRef.current?.();
    dispatch(globalSliceActions.setLoader(true));
    return () => {
      abortRef.current?.abort();
      debouncedFetchRef.current?.cancel?.();
    };
  }, [pagination.pageIndex, pagination.pageSize, sorting, columnFilters, globalFilter]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
      globalFilter,
    },
    getRowId: (row) => {
      if (typeof rowIdKey === 'function') return rowIdKey(row);
      return String(row[rowIdKey as keyof T] ?? row.id ?? '');
    },
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
    manualPagination: true,
    pageCount: Math.ceil(totalRows / pagination.pageSize),
  });

  const handleRowClick = useCallback(
    (row: any) => {
      if (onRowClick) onRowClick(row);
    },
    [onRowClick],
  );

  if (error) {
    const isAuthError =
      error.toLowerCase().includes('session') || error.toLowerCase().includes('token');
    return (
      <div className="text-center p-6">
        <NoDataFound message={error} onAddClick={onAdd} />
        <div className="mt-4 flex justify-center gap-2">
          {isAuthError ? (
            <Button variant="outline" onClick={() => (window.location.href = '/')}>
              Go to Login
            </Button>
          ) : (
            <></>
          )}
        </div>
      </div>
    );
  }

  return (
    <Tabs defaultValue="outline" className="flex flex-col h-full gap-6">
      <DataTableToolbar
        table={table}
        entityName={entityName}
        onAddClick={onAdd}
        sortFields={sortFields}
        serverFilterKeys={serverFilterKeys}
        customFilterKey={customFilterKey}
      />
      <TabsContent
        value="outline"
        className="relative flex flex-col gap-4 flex-1 min-h-0 px-4 lg:px-6"
      >
        <div className="flex-1 overflow-auto">
          <CustomTable
            data={data}
            columns={columns}
            globalFilter={globalFilter}
            onGlobalFilterChange={(v) => {
              setGlobalFilter(v);
              setPagination((p) => ({ ...p, pageIndex: 0 }));
            }}
            enableRowSelection
            initialPageSize={initialPageSize}
            className="h-[calc(100vh-160px)]"
            rowIdKey={rowIdKey as any}
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
            onRowClick={handleRowClick}
            onAddClick={onAdd}
          />
        </div>
      </TabsContent>
    </Tabs>
  );
}

export default EntityTable;

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  type RowSelectionState,
  type VisibilityState,
  type ColumnFiltersState,
  type SortingState,
} from '@tanstack/react-table';
import { CustomTable } from '@/features/components/CustomTable';
import { getSelectableColumns } from '@/features/components/EntityTable/utils';
import { useAppDispatch } from '@/app/hooks';
import { globalSliceActions } from '@/features/redux/slice';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface RelatedEntityTableProps<T> {
  parentIdKey: string;
  service: {
    getAllByParentId: (
      parentId: string,
      params?: { limit?: number; page?: number },
    ) => Promise<{ data: T[]; total?: number }>;
  };
  // Optional explicit parent id (bypass reading from route params)
  parentIdProp?: string;
  schemaKeys: string[];
  navigateBasePath: string;
  emptyMessage?: string;
  limit?: number;
  onAddClick?: (...args: any) => void;
  addLabel?: string;
}

export default function RelatedEntityTable<T>({
  parentIdKey,
  service,
  schemaKeys,
  navigateBasePath,
  emptyMessage = 'No related records found.',
  limit = 20,
  onAddClick,
  addLabel = 'Add Record',
  parentIdProp,
}: RelatedEntityTableProps<T>) {
  const [data, setData] = useState<T[]>([]);
  const [totalRows, setTotalRows] = useState(0);

  const [globalFilter, setGlobalFilter] = useState('');
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams<Record<string, string>>();
  const parentId = parentIdProp ?? params[parentIdKey];
  const dispatch = useAppDispatch();
  const columns = useMemo(
    () => getSelectableColumns<any>(schemaKeys as string[], [], false),
    [schemaKeys],
  );

  useEffect(() => {
    const fetchData = async () => {
      dispatch(globalSliceActions.setLoader(true));
      if (!parentId) {
        dispatch(globalSliceActions.setLoader(false));
        return;
      }
      try {
        const response = await service.getAllByParentId(parentId, { limit, page: 1 });
        setData(response.data);
        setTotalRows(response.total ?? 0);
      } catch (err) {
        console.error('Error fetching related data:', err);
      } finally {
        dispatch(globalSliceActions.setLoader(false));
      }
    };
    fetchData();
  }, [location.state, parentId, navigate, service, limit]);

  const handleRowClick = useCallback(
    (row: any) => {
      if (row?.id) {
        navigate(`${navigateBasePath}/${row.id}`, { state: { from: parentIdKey } });
      }
    },
    [navigate, navigateBasePath, parentIdKey],
  );

  return (
    <div className="related-entity-table-wrapper">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-semibold">Related Records</h1>
        {onAddClick && (
          <Button
            size="sm"
            className="flex items-center gap-1 bg-primary hover:bg-primary/90 text-white cursor-pointer"
            onClick={onAddClick}
          >
            <Plus className="h-4 w-4" />
            {addLabel}
          </Button>
        )}
      </div>
      <CustomTable
        data={data}
        columns={columns}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        enableRowSelection={false}
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
        emptyMessage={emptyMessage}
        onAddClick={onAddClick}
      />
    </div>
  );
}

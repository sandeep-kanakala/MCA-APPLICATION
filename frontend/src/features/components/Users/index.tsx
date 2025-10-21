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
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Columns, ChevronDown } from 'lucide-react';
import { CustomTable } from '@/features/components/CustomTable';
import userService from '@/utils/services/user';
import RegisterUser from './CreateUser';
import '@/index.css';
import { useState, useCallback, useEffect, useMemo } from 'react';

import { userSchema, type User } from '@/features/components/Users/utils';

const formatFieldName = (field: string): string => {
  return field.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
};

export default function DataTable() {
  const navigate = useNavigate();
  const [data, setData] = useState<User[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [globalFilter, setGlobalFilter] = useState('');
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [error, setError] = useState<string | null>(null);

  const handleGlobalFilterChange = useCallback((filter: string) => setGlobalFilter(filter), []);
  const handleRowSelectionChange = useCallback((updater: any) => setRowSelection(updater), []);
  const handleSortingChange = useCallback((updater: any) => setSorting(updater), []);
  const handleColumnFiltersChange = useCallback((updater: any) => setColumnFilters(updater), []);
  const handleColumnVisibilityChange = useCallback(
    (updater: any) => setColumnVisibility(updater),
    [],
  );
  const handlePaginationChange = useCallback((updater: any) => {
    setPagination(updater);
  }, []);

  const handleViewUser = useCallback(
    async (id: string) => {
      try {
        const response = await userService.getById(id);
        navigate(id, { state: { user: response } });
      } catch (error) {
        // This alert is temporary; ideally, you'd use a toast or modal for error display.
        alert('Failed to load user details. Please try again.');
      }
    },
    [navigate],
  );

  const userFieldKeys: (keyof User)[] = ['firstName', 'lastName', 'email', 'phoneNo', 'role'];

  const columns = useMemo<ColumnDef<User>[]>(() => {
    const selectColumn: ColumnDef<User> = {
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
    };

    const dataColumns: ColumnDef<User>[] = userFieldKeys.map((key) => {
      const headerText = formatFieldName(key);
      const column: ColumnDef<User> = {
        accessorKey: key,
        header: headerText,
        enableHiding: true,
        size: key === 'email' ? 200 : 150,
        cell: ({ row }) => (
          <div className="flex items-center justify-start">
            <span className="font-medium text--700 dark:text-gray-100 group-hover:text-gray-600 dark:group-hover:text-gray-400 ">
              {row.original[key]?.toString() || 'N/A'}
            </span>
          </div>
        ),
      };

      return column;
    });

    return [selectColumn, ...dataColumns];
  }, []);

  const fetchUsers = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('No authentication token found. Please log in.');
      navigate('/');
      return;
    }
    setError(null);
    try {
      const response = await userService.getAll({
        limit: pagination.pageSize,
        page: pagination.pageIndex + 1,
      });
      if (!response.users || !Array.isArray(response.users)) {
        throw new Error('Invalid response: users array is missing or not an array');
      }

      const displaySchema = userSchema.omit({ password: true });

      const normalizedUsers = response.users.map((u) => {
        const normalized = {
          id: u.id ?? '',
          firstName: u.firstName ?? '',
          middleName: u.middleName ?? null,
          lastName: u.lastName ?? '',
          email: u.email ?? '',
          phoneNo: u.phoneNo ?? null,
          role: u.role ?? 'USER',
        };
        
        const parsedResult = displaySchema.safeParse(normalized);
        if (!parsedResult.success) {
            return normalized as User; 
        }
        return parsedResult.data as User;
      });

      setData(normalizedUsers);
      setTotalRows(response.total ?? 0);
    } catch (err: any) {
      let errorMessage = 'Failed to fetch users';
      if (err.status === 401) {
        localStorage.removeItem('access_token');
        errorMessage = 'Session expired. Please log in again.';
        navigate('/');
      } else if (err.status) {
        errorMessage = `Failed to fetch users: ${err.status} - ${err.data || 'Unknown error'}`;
      } else {
        errorMessage = `Failed to fetch users: ${err.message || 'Network error or server not responding'}`;
      }
      setError(errorMessage);
      setData([]);
    }
  }, [pagination.pageIndex, pagination.pageSize, navigate]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnVisibility, rowSelection, columnFilters, pagination, globalFilter },
    getRowId: (row, index) => row.id ?? `row-${index}`,
    enableRowSelection: true,
    onGlobalFilterChange: handleGlobalFilterChange,
    onRowSelectionChange: handleRowSelectionChange,
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: handleColumnFiltersChange,
    onColumnVisibilityChange: handleColumnVisibilityChange,
    onPaginationChange: handlePaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    globalFilterFn: 'includesString',
    manualPagination: true,
    pageCount: Math.max(Math.ceil(totalRows / pagination.pageSize), 1),
  });

  if (error) {
    return (
      <div className="text-center p-4 text-red-500">
        <p>{error}</p>
        {error.includes('Unauthorized') ||
        error.includes('Session expired') ||
        error.includes('No authentication token') ? (
          <Button variant="outline" onClick={() => navigate('/')} className="mt-4">
            Go to Login
          </Button>
        ) : (
          <Button variant="outline" onClick={fetchUsers} className="mt-4">
            Retry
          </Button>
        )}
      </div>
    );
  }

  return (
    <Tabs defaultValue="outline" className="flex flex-col h-full gap-6">
      <div className="flex items-center justify-between border-b-2 p-3 border-gray-200 px-4 lg:px-6 flex-shrink-0 relative z-10">
        <Label htmlFor="view-selector" className="sr-only">
          View
        </Label>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search all columns..."
            value={globalFilter}
            onChange={(e) => handleGlobalFilterChange(e.target.value)}
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
          <RegisterUser onUserAdded={fetchUsers} />
        </div>
      </div>
      <TabsContent
        value="outline"
        className="relative flex flex-col gap-4 flex-1 min-h-0 px-4 lg:px-6"
      >
        {data.length === 0 && pagination.pageIndex === 0 ? (
          <div className="text-center p-4">No users found.</div>
        ) : (
          <CustomTable
            data={data}
            columns={columns}
            globalFilter={globalFilter}
            onGlobalFilterChange={handleGlobalFilterChange}
            enableRowSelection={true}
            initialPageSize={10}
            className="h-[calc(100vh-200px)]"
            rowIdKey="id"
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
            onRowClick={(row) => row.id && handleViewUser(row.id)}
          />
        )}
      </TabsContent>
    </Tabs>
  );
}
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Pencil,
  Eye,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Columns,
  Plus,
} from 'lucide-react';
import DrawerDirections from '@/features/components/drawer-layout';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CustomTable } from '@/features/components/CustomTable';
import '@/index.css';

const schema = z.object({
  id: z.string(),
  middleName: z.string().nullable(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  phoneNo: z.string(),
});
const formSchema = z.object({
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters' }),
  middleName: z.string().optional(),
  lastName: z.string().min(2, { message: 'Last name must be at least 2 characters' }),
  email: z.string().email({ message: 'Invalid email format' }),
  phoneNo: z.string().min(10, { message: 'Phone number must be at least 10 digits' }),
});
type FormValues = z.infer<typeof formSchema>;

const columns: ColumnDef<z.infer<typeof schema>>[] = [
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
      <div className="flex items-center justify-start">
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
  {
    accessorKey: 'firstName',
    header: 'First Name',
    cell: ({ row }) => (
      <div className="flex items-center justify-start">
        <span className="font-medium">{row.original.firstName || 'N/A'}</span>
      </div>
    ),
    enableHiding: true,
    size: 150,
  },
  {
    accessorKey: 'middleName',
    header: 'Middle Name',
    cell: ({ row }) => (
      <div className="flex items-center justify-start">
        <span className="font-medium">{row.original.middleName || 'N/A'}</span>
      </div>
    ),
    enableHiding: true,
    size: 150,
  },
  {
    accessorKey: 'lastName',
    header: 'Last Name',
    cell: ({ row }) => (
      <div className="flex items-center justify-start">
        <span className="font-medium">{row.original.lastName || 'N/A'}</span>
      </div>
    ),
    enableHiding: true,
    size: 150,
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => (
      <div className="flex items-center justify-start">
        <span className="font-medium">{row.original.email || 'N/A'}</span>
      </div>
    ),
    enableHiding: true,
    size: 200,
  },
  {
    accessorKey: 'phoneNo',
    header: 'Phone Number',
    cell: ({ row }) => (
      <div className="flex items-center justify-start">
        <span className="font-medium">{row.original.phoneNo || 'N/A'}</span>
      </div>
    ),
    enableHiding: true,
    size: 150,
  },
  {
    accessorKey: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const navigate = useNavigate();
      return (
        <div className="flex items-center justify-start gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`user`, { state: { user: row.original, edit: true } })}
            aria-label="Edit row"
            className="cursor-pointer h-7 w-7"
          >
            <Pencil className="text-blue-600 h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`user`, { state: { user: row.original } })}
            aria-label="View row"
            className="cursor-pointer h-7 w-7"
          >
            <Eye className="text-blue-600 h-4 w-4" />
          </Button>
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
    size: 100,
  },
];
export default function DataTable({ data: initialData }: { data: z.infer<typeof schema>[] }) {
  const [data, setData] = React.useState(initialData);
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 20 });

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

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      middleName: '',
      lastName: '',
      email: '',
      phoneNo: '',
    },
  });

  const onSubmit = (formData: FormValues) => {
    const newUser = {
      id: crypto.randomUUID(),
      ...formData,
      middleName: formData.middleName || null,
    };
    setData((prev) => [...prev, newUser]);
    reset();
  };

  React.useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnVisibility, rowSelection, columnFilters, pagination, globalFilter },
    getRowId: (row) => row.id,
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
  });

  return (
    <Tabs defaultValue="outline" className="flex flex-col h-full gap-6">
      <div className="flex items-center justify-between border-b-2 p-3 border-gray-200 px-4 lg:px-6 flex-shrink-0 relative z-10">
        <Label htmlFor="view-selector" className="sr-only">
          View
        </Label>
        <Select defaultValue="outline">
          <SelectTrigger className="flex w-fit @4xl/main:hidden" size="sm" id="view-selector">
            <SelectValue placeholder="Select a view" />
          </SelectTrigger>
          <SelectContent className="bg-gray-700 text-gray-50 border-gray-600">
            <SelectItem value="outline">Outline</SelectItem>
            <SelectItem value="past-performance">Past Performance</SelectItem>
            <SelectItem value="key-personnel">Key Personnel</SelectItem>
            <SelectItem value="focus-documents">Focus Documents</SelectItem>
          </SelectContent>
        </Select>
        <TabsList className="hidden @4xl/main:flex">
          <TabsTrigger value="outline">Outline</TabsTrigger>
          <TabsTrigger value="past-performance">
            Past Performance <Badge variant="secondary">3</Badge>
          </TabsTrigger>
          <TabsTrigger value="key-personnel">
            Key Personnel <Badge variant="secondary">2</Badge>
          </TabsTrigger>
          <TabsTrigger value="focus-documents">Focus Documents</TabsTrigger>
        </TabsList>
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
          <DrawerDirections
            title="Add New User"
            description="Please fill in the details below."
            onSave={handleSubmit(onSubmit)}
            trigger={
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 bg-primary hover:bg-primary/90 text-white hover:text-white cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden lg:inline ">Add User</span>
              </Button>
            }
          >
            <form onSubmit={handleSubmit(onSubmit)} className="contents">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="Enter first name"
                  {...register('firstName')}
                  className={`${errors.firstName ? 'border-red-500' : 'border-black'} focus-visible:ring-0`}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm">{errors.firstName.message}</p>
                )}
              </div>
              <div className="flex flex-col space-y-2">
                <Label htmlFor="middleName">Middle Name (Optional)</Label>
                <Input
                  id="middleName"
                  placeholder="Enter middle name"
                  {...register('middleName')}
                  className="focus-visible:ring-0"
                />
              </div>
              <div className="flex flex-col space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Enter last name"
                  {...register('lastName')}
                  className={`${errors.lastName ? 'border-red-500' : 'border-black'} focus-visible:ring-0`}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm">{errors.lastName.message}</p>
                )}
              </div>
              <div className="flex flex-col space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email"
                  {...register('email')}
                  className={`${errors.email ? 'border-red-500' : 'border-black'} focus-visible:ring-0`}
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
              </div>
              <div className="flex flex-col space-y-2">
                <Label htmlFor="phoneNo">Phone Number</Label>
                <Input
                  id="phoneNo"
                  placeholder="Enter phone number"
                  {...register('phoneNo')}
                  className={`${errors.phoneNo ? 'border-red-500' : 'border-black'} focus-visible:ring-0`}
                />
                {errors.phoneNo && <p className="text-red-500 text-sm">{errors.phoneNo.message}</p>}
              </div>
            </form>
          </DrawerDirections>
        </div>
      </div>
      <TabsContent
        value="outline"
        className="relative flex flex-col gap-4 flex-1 min-h-0 px-4 lg:px-6"
      >
        <CustomTable
          data={data}
          columns={columns}
          globalFilter={globalFilter}
          onGlobalFilterChange={handleGlobalFilterChange}
          enableRowSelection={true}
          initialPageSize={20}
          className="max-h-[calc(100vh-300px)]"
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
        />
        <div className="flex items-center justify-between px-4 flex-shrink-0">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of{' '}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(v) => table.setPageSize(Number(v))}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue placeholder={table.getState().pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top" className="bg-gray-700 text-gray-50 border-gray-600">
                  {[5, 10, 20, 30, 40, 50].map((s) => (
                    <SelectItem key={s} value={`${s}`}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeft />
              </Button>
              <Button
                variant="ghost"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft />
              </Button>
              <Button
                variant="ghost"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}

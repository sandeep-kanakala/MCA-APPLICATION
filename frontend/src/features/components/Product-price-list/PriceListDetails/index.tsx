import React, { useEffect, useState, type JSX } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  SquarePen,
  Check,
  X,
  Building2,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Plus,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/sonner';
import { priceListConstraints } from '@/utils/constraints';
import { extractErrorMessage } from '@/utils';
import type {
  ColumnDef,
  ColumnFiltersState,
  RowSelectionState,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table';
import { Checkbox } from '@radix-ui/react-checkbox';
import priceListService from '@/utils/services/product-pricelist';
import { formatValue, pricelistEntrySchema, priceListSchema, type PriceList } from '../utils';
import { CustomTable } from '../../CustomTable';
import ActivityLogs from '../../ActivityLogs';
import { entities } from '../../Events/utils';
import auditLogService from '@/utils/services/events';
import { gatActivityLogs } from '../../ActivityLogs/utils';

type SelectOptionKeys = keyof typeof priceListConstraints.selectOptions;

const formatFieldName = (field: string): string => {
  return field.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
};
const customRenderers: Record<string, (value: any) => JSX.Element> = {
  isActive: (value: any) => <span className="font-medium">{value ? 'Yes' : 'No'}</span>,
  createdAt: (value: any) => (
    <span className="font-medium">{value ? new Date(value).toLocaleDateString() : 'N/A'}</span>
  ),
};

const excludedKeys = ['id'];
const dynamicColumns = Object.keys(pricelistEntrySchema.shape)
  .filter((key) => !excludedKeys.includes(key))
  .map((key) => {
    const accessorKey = key as keyof PriceList;
    const customCell = customRenderers[key];

    const column: ColumnDef<PriceList, any> = {
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

export const columns: ColumnDef<PriceList, any>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
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
interface DetailFieldProps {
  label: string;
  value: string | null | undefined | boolean | Date;
  fieldKey: keyof PriceList | string;
  isEditable: boolean;
  isEditing: boolean;
  tempValue: string;
  onEdit: (field: keyof PriceList) => void;
  onSave: () => void;
  onCancel: () => void;
  onTempChange: (value: string) => void;
}
const DetailField: React.FC<DetailFieldProps> = ({
  label,
  value,
  fieldKey,
  isEditable,
  isEditing,
  tempValue,
  onEdit,
  onSave,
  onCancel,
  onTempChange,
}) => {
  const pricelistFieldKey = fieldKey as keyof PriceList;
  const isSelectField = (fieldKey as string) in priceListConstraints.selectOptions;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center py-0 px-0 sm:px-0 border-b border-gray-400 last:border-b-0">
      <span className="text-gray-500 text-sm sm:text-xs w-full sm:w-[130px] font-medium pr-4 mb-1 sm:mb-0">
        {label}
      </span>
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="flex items-center gap-0.5 w-full">
            {isSelectField ? (
              <Select
                value={tempValue}
                onValueChange={(value) => onTempChange(value === 'none' ? '' : value)}
              >
                <SelectTrigger className="border border-blue-300 bg-white rounded-sm px-2 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 flex-grow min-w-0 h-6">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {pricelistFieldKey !== 'accountType' && (
                    <SelectItem value="none">None</SelectItem>
                  )}
                  {priceListConstraints.selectOptions[pricelistFieldKey as SelectOptionKeys]?.map(
                    (opt) => {
                      const value = typeof opt === 'string' ? opt : opt.value;
                      const label = typeof opt === 'string' ? opt : opt.label;

                      return (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      );
                    },
                  )}
                </SelectContent>
              </Select>
            ) : (
              <input
                className="border border-blue-300 bg-white rounded-sm px-2 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 flex-grow min-w-0 h-6"
                value={tempValue}
                onChange={(e) => onTempChange(e.target.value)}
                autoFocus
              />
            )}
            <button
              onClick={onSave}
              className="text-green-600 hover:bg-green-100 rounded p-0.5 transition h-6 flex items-center justify-center flex-shrink-0 cursor-pointer"
              aria-label={`Save ${label}`}
            >
              <Check size={16} />
            </button>
            <button
              onClick={onCancel}
              className="text-red-500 hover:bg-red-100 rounded p-0.5 transition h-6 flex items-center justify-center flex-shrink-0 cursor-pointer"
              aria-label={`Cancel ${label}`}
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div
            className={`flex items-center justify-between gap-1 group relative w-full ${isEditable ? 'cursor-pointer' : 'cursor-default'}`}
            onClick={() => isEditable && onEdit(pricelistFieldKey)}
          >
            <span
              className={`text-gray-800 text-sm break-words py-0.5 pr-2 truncate ${isEditable ? 'group-hover:text-blue-600' : ''}`}
            >
              {formatValue(value)}
            </span>
            <span className="flex-shrink-0 p-0.5">
              <SquarePen
                size={12}
                className={
                  isEditable
                    ? 'text-gray-500 hover:text-blue-500 transition-colors cursor-pointer'
                    : 'text-gray-300 cursor-default'
                }
                onClick={(e) => {
                  if (isEditable) {
                    e.stopPropagation();
                    onEdit(pricelistFieldKey);
                  }
                }}
              />
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const ProductlistDetailView: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { pricelistId } = useParams<{ pricelistId: string }>();
  const [pricelist, setPricelist] = useState<PriceList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [entries, setEntries] = useState<any | null>(null);
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [totalRows, setTotalRows] = React.useState(0);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });
  const [activityData, setActivityData] = useState([]);
  useEffect(() => {
    const fetchPriceList = async () => {
      try {
        const response = await priceListService.getById(`${pricelistId}`);

        const apiPricelist: any = response;

        const activity = await auditLogService.getActivity(entities.priceList, {
          entityId: pricelistId,
        });
        setActivityData(activity);
        const parsedPricelist = priceListSchema.parse(apiPricelist);

        setPricelist(parsedPricelist);
        setTotalRows(100);
        setEntries(apiPricelist?.entries);
      } catch (err: any) {
        console.log('err', err);
        setError('Failed to load price list data');
        navigate('/apps/sales/pricelist', { replace: true });
      }
    };

    fetchPriceList();
  }, [location.state, pricelistId, navigate]);

  const [editField, setEditField] = useState<keyof PriceList | null>(null);
  const [tempValue, setTempValue] = useState<string>('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'related'>('details');
  const [isPricelistInfoOpen, setIsPricelistInfoOpen] = useState(true);

  const handleEdit = (field: keyof PriceList) => {
    if (isSaving || isDeleting || !pricelist) return;
    setEditField(field);
    setTempValue(pricelist?.[field]?.toString() || '');
  };

  const handleSave = async () => {
    if (!editField || !pricelist) return;

    const fieldToUpdate = editField;
    let valueToSave: string | null = tempValue;
    if (editField === 'name' && tempValue === '') {
      valueToSave = null;
    }

    const apiPayload = {
      [editField]: valueToSave === null ? undefined : valueToSave,
    };

    setError(null);
    setIsSaving(true);

    const mergedData = { ...pricelist, [editField]: valueToSave };

    const updatePromise = priceListService
      .update('' + pricelistId, apiPayload)
      .then(() => {
        gatActivityLogs('priceList', pricelistId, setActivityData);
        const parsedPricelist = priceListSchema.parse(mergedData);
        setPricelist(parsedPricelist);
        setEditField(null);
        return { message: `${formatFieldName(fieldToUpdate)} updated successfully.` };
      })
      .catch((error: any) => {
        const errorMessage = extractErrorMessage(error);
        setError(errorMessage);
        throw new Error(errorMessage);
      })
      .finally(() => {
        setIsSaving(false);
      });

    toast.promise(updatePromise, {
      loading: `Updating ${formatFieldName(fieldToUpdate)}...`,
      success: (data: { message: string }) => data.message,
      error: (err) => err.message,
    });
  };
  const handleRowClick = React.useCallback(
    (row: any) => {
      if (row?.id) {
        navigate(`/apps/sales/pricelist/${row.priceListId}/entry/${row.id}`, {
          state: { pricelist: row },
        });
      }
    },
    [navigate],
  );
  const handleCancel = () => {
    setEditField(null);
    setTempValue('');
    setError(null);
  };

  const handleDelete = async () => {
    if (!pricelist) return;
    setIsDeleting(true);

    const deletePromise = priceListService
      .delete('' + pricelistId)
      .then(() => {
        setIsDeleteModalOpen(false);
        navigate('/apps/sales/pricelist');
        return { message: `${pricelist.name} deleted successfully.` };
      })
      .catch((error: any) => {
        const errorMessage = extractErrorMessage(error);
        setError(errorMessage);
        throw new Error(errorMessage);
      })
      .finally(() => {
        setIsDeleting(false);
      });

    toast.promise(deletePromise, {
      loading: `Deleting ${pricelist.name}...`,
      success: (data: { message: string }) => data.message,
      error: (err) => err.message,
    });
  };

  const editableFields: (keyof PriceList)[] = Object.keys(priceListSchema.shape)
    .filter(
      (key) => key !== 'id' && key !== 'accountId' && key !== 'isTaxable' && key !== 'isActive',
    )
    .map((key) => key as keyof PriceList);

  const pricelistFields = Object.keys(priceListSchema.shape).map((key) => {
    const typedKey = key as keyof PriceList;
    return {
      label: typedKey.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()),
      key: typedKey,
      isEditable: editableFields.includes(typedKey),
    };
  });

  const midIndex = Math.ceil(pricelistFields.length / 2);
  const leftColumnFields = pricelistFields.slice(0, midIndex);
  const rightColumnFields = pricelistFields.slice(midIndex);

  if (error && error.includes('Failed to load price list data')) {
    return (
      <div className="p-4 text-red-500">
        <p>{error}</p>
        <Button
          variant="outline"
          onClick={() => navigate('/apps/sales/pricelist')}
          className="mt-4"
        >
          Back to Price list
        </Button>
      </div>
    );
  }
  if (!pricelist) {
    return <div className="text-center mt-50">Loading...</div>;
  }

  return (
    <div className="bg-gray-100">
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto p-4 sm:px-6">
          <div className="flex justify-between items-center mb-3">
            <div>
              <div className="text-xs text-gray-500 flex items-center mb-1">
                <Building2 size={12} className="mr-1" />
                Price list
              </div>
              <h1 className="text-2xl font-normal flex items-center">
                {pricelist?.name} - Details
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-8 w-8 p-0 cursor-pointer"
                    disabled={isDeleting || isSaving}
                    aria-label="More actions"
                  >
                    <MoreVertical className="h-4 w-4 " />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => navigate(`/apps/sales/pricelist/edit/${pricelistId}`)}
                    className="cursor-pointer"
                  >
                    <SquarePen size={16} className="mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="text-red-500 cursor-pointer"
                  >
                    <Trash2 size={16} className="mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 min-h-[600px] flex flex-col">
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as any)}
            className="w-full"
          >
            <div className="bg-white rounded-md shadow-md mb-6">
              <TabsList className="bg-white border-b border-gray-200 h-10 w-full justify-start px-4 p-0 rounded-none inline-flex items-center">
                <TabsTrigger
                  value="details"
                  className="h-full border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-blue-600 rounded-none px-4 py-0 bg-transparent text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Details
                </TabsTrigger>
                <TabsTrigger
                  value="related"
                  className="h-full border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-blue-600 rounded-none px-4 py-0 bg-transparent text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Related
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="p-4 sm:p-6 mt-0">
                <div className="mb-8 border border-gray-200 rounded-md">
                  <div
                    className="p-4 bg-gray-50/50 cursor-pointer transition-colors hover:bg-gray-100"
                    onClick={() => setIsPricelistInfoOpen(!isPricelistInfoOpen)}
                  >
                    <h3 className="text-base font-semibold text-gray-800 flex items-center">
                      {isPricelistInfoOpen ? (
                        <ChevronDown size={16} className="mr-2" />
                      ) : (
                        <ChevronRight size={16} className="mr-2" />
                      )}
                      Price list Information
                    </h3>
                  </div>

                  {isPricelistInfoOpen && (
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                        <div className="space-y-2">
                          {leftColumnFields.map((item) => (
                            <DetailField
                              key={item.key}
                              label={item.label}
                              value={pricelist[item.key as keyof PriceList]}
                              fieldKey={item.key}
                              isEditable={
                                item.isEditable &&
                                editableFields.includes(item.key as keyof PriceList)
                              }
                              isEditing={editField === item.key}
                              tempValue={tempValue}
                              onEdit={handleEdit}
                              onSave={handleSave}
                              onCancel={handleCancel}
                              onTempChange={setTempValue}
                            />
                          ))}
                        </div>
                        <div className="space-y-2">
                          {rightColumnFields.map((item) => (
                            <DetailField
                              key={item.key}
                              label={item.label}
                              value={pricelist[item.key as keyof PriceList]}
                              fieldKey={item.key}
                              isEditable={
                                item.isEditable &&
                                editableFields.includes(item.key as keyof PriceList)
                              }
                              isEditing={editField === item.key}
                              tempValue={tempValue}
                              onEdit={handleEdit}
                              onSave={handleSave}
                              onCancel={handleCancel}
                              onTempChange={setTempValue}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="related" className="p-4 sm:p-6 mt-0">
                <div className="flex justify-between items-center mb-4">
                  <h1 className="text-lg font-semibold">Price list entries</h1>
                  <Button
                    size="sm"
                    className="flex items-center gap-1 bg-primary hover:bg-primary/90 text-white hover:text-white cursor-pointer"
                    onClick={() => {
                      if (!pricelistId) return;
                      navigate(`/apps/sales/pricelist/${pricelistId}/entry/create`);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    Add Entry
                  </Button>
                </div>
                <div className="">
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
                        <h2 className="text-xl font-semibold text-gray-700">
                          No Related entries Found
                        </h2>
                        <p className="text-gray-500 mt-2 text-sm">
                          This price list has no related entries yet.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <div className="lg:col-span-1 bg-white rounded-md shadow-md h-full sticky top-[138px] max-h-[80vh] overflow-y-auto">
          <Tabs defaultValue="activity" className="w-full">
            <TabsList className="bg-gray-100 border-b border-gray-200 h-10 rounded-none w-full justify-start sticky top-0 z-5 p-0">
              <TabsTrigger
                value="activity"
                className="h-full data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-r data-[state=active]:border-l rounded-none px-6 py-0 bg-transparent text-gray-700"
              >
                Activity
              </TabsTrigger>
            </TabsList>
            <TabsContent value="activity" className="p-4 mt-0">
              <ActivityLogs activities={activityData} entity={entities.priceList} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent className="sm:max-w-[425px] bg-white border-gray-300">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this price list? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductlistDetailView;

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  SquarePen,
  Check,
  X,
  Building2,
  ChevronDown,
  ChevronRight,
  MoreVertical,
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
import { pricelistEntryConstraints } from '@/utils/constraints';

import { extractErrorMessage } from '@/utils';

import type { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@radix-ui/react-checkbox';

import priceListService from '@/utils/services/product-pricelist';
import { formatValue, pricelistEntrySchema, type PricelistEntry } from '../utils';
import ActivityLogs from '../../ActivityLogs';
import auditLogService from '@/utils/services/events';
import { entities } from '../../Events/utils';

type SelectOptionKeys = keyof typeof pricelistEntryConstraints.selectOptions;

const formatFieldName = (field: string): string => {
  return field.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
};
const schemaKeys = Object.keys(pricelistEntrySchema.shape);

export const columns: ColumnDef<PricelistEntry, any>[] = [
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
  ...(schemaKeys.map((key) => ({
    accessorKey: key as keyof PricelistEntry,
    header: key.charAt(0).toUpperCase() + key.slice(1),
    cell: ({ getValue }) => <span className="font-medium">{getValue() || 'N/A'}</span>,
    enableHiding: true,
  })) as ColumnDef<PricelistEntry, any>[]),
];
interface DetailFieldProps {
  label: string;
  value: string | null | undefined | boolean | Date | number;
  fieldKey: keyof PricelistEntry | string;
  isEditable: boolean;
  isEditing: boolean;
  tempValue: string;
  onEdit: (field: keyof PricelistEntry) => void;
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
  const pricelistEntryFieldKey = fieldKey as keyof PricelistEntry;
  const isSelectField = (fieldKey as string) in pricelistEntryConstraints.selectOptions;

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
                  {pricelistEntryFieldKey !== 'id' && <SelectItem value="none">None</SelectItem>}
                  {pricelistEntryConstraints.selectOptions[
                    pricelistEntryFieldKey as SelectOptionKeys
                  ]?.map((opt) => {
                    // Handle both string and object types
                    const value = typeof opt === 'string' ? opt : opt.key;
                    const label = typeof opt === 'string' ? opt : opt.name;

                    return (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    );
                  })}
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
            onClick={() => isEditable && onEdit(pricelistEntryFieldKey)}
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
                    onEdit(pricelistEntryFieldKey);
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

const ProductlisEntryDetailView: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { pricelistId, pricelistEntryId } = useParams<{
    pricelistId: string;
    pricelistEntryId: string;
  }>();
  const [pricelist, setPricelist] = useState<PricelistEntry | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [activityData, setActivityData] = useState([]);
  useEffect(() => {
    const fetchPriceList = async () => {
      try {
        const apiPricelistEntry = await priceListService.getEntryId(`${pricelistEntryId}`);
        const activity = await auditLogService.getActivity(entities.pricelistEntry, {
          entityId: pricelistEntryId,
        });
        setActivityData(activity);

        const cleanedData = {
          ...apiPricelistEntry,
          discountPct: String(apiPricelistEntry.discountPct ?? 0),
          amount: String(apiPricelistEntry.amount ?? 0),
          unitPrice: String(apiPricelistEntry.unitPrice ?? 0),
        };
        console.log('cleanedData######', cleanedData);
        const parsedPricelistEntry = pricelistEntrySchema.parse(cleanedData);

        setPricelist(parsedPricelistEntry);
      } catch (err: any) {
        console.log('err', err);
        setError('Failed to load price list entry data');
        navigate('/apps/sales/pricelist', { replace: true });
      }
    };

    fetchPriceList();
  }, [location.state, pricelistId, pricelistEntryId, navigate]);

  const [editField, setEditField] = useState<keyof PricelistEntry | null>(null);
  const [tempValue, setTempValue] = useState<string>('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'related'>('details');
  const [isPricelistInfoOpen, setIsPricelistInfoOpen] = useState(true);

  const handleEdit = (field: keyof PricelistEntry) => {
    if (isSaving || isDeleting || !pricelist) return;
    setEditField(field);
    setTempValue(pricelist?.[field]?.toString() || '');
  };

  const handleSave = async () => {
    if (!editField || !pricelist) return;

    const fieldToUpdate = editField;
    let valueToSave: string | null | number = tempValue;
    if (editField === 'name' && tempValue === '') {
      valueToSave = null;
    }
    if (['amount', 'discountPct'].includes(editField)) {
      valueToSave = tempValue === '' || tempValue === null ? 0 : Number(tempValue);
    }
    const apiPayload = {
      [editField]: valueToSave === null ? undefined : valueToSave,
    };

    setError(null);
    setIsSaving(true);

    const mergedData = { ...pricelist, [editField]: valueToSave };

    const updatePromise = priceListService
      .updateEntry('' + pricelistEntryId, apiPayload)
      .then(() => {
        const parsedPricelist = pricelistEntrySchema.parse(mergedData);
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

  const handleCancel = () => {
    setEditField(null);
    setTempValue('');
    setError(null);
  };

  const handleDelete = async () => {
    if (!pricelist) return;
    setIsDeleting(true);

    const deletePromise = priceListService
      .deleteEntry('' + pricelistEntryId)
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

  const editableFields: (keyof PricelistEntry)[] = Object.keys(pricelistEntrySchema.shape)
    .filter((key) => key !== 'id' && key !== 'description')
    .map((key) => key as keyof PricelistEntry);

  const pricelistFields = Object.keys(pricelistEntrySchema.shape).map((key) => {
    const typedKey = key as keyof PricelistEntry;
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
              <h1 className="text-2xl font-normal flex items-center">{pricelist?.name} - Entry</h1>
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
                    onClick={() =>
                      navigate(
                        `/apps/sales/pricelist/${pricelistId}/entry/${pricelistEntryId}/edit`,
                      )
                    }
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
                      Price list Entry Information
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
                              value={pricelist[item.key as keyof PricelistEntry]}
                              fieldKey={item.key}
                              isEditable={
                                item.isEditable &&
                                editableFields.includes(item.key as keyof PricelistEntry)
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
                              value={pricelist[item.key as keyof PricelistEntry]}
                              fieldKey={item.key}
                              isEditable={
                                item.isEditable &&
                                editableFields.includes(item.key as keyof PricelistEntry)
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
              Are you sure you want to delete this entry? This action cannot be undone.
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

export default ProductlisEntryDetailView;

import React, { useEffect, useState, useContext, createContext, useCallback } from 'react';
import productService from '@/utils/services/Products';
import { useNavigate, useParams } from 'react-router-dom';
import { z, ZodType } from 'zod';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { extractErrorMessage } from '@/utils';
import { gatActivityLogs } from '../../ActivityLogs/utils';
import { entities } from '../../Events/utils';
import { ViewSkeleton } from '../../EntitiesView/ViewSkeleton/ViewSkeleton';
import DetailField from '../../EntitiesView/DetailField';
import TabsHeader from '../../common/TabsHeader';
import ActivityLogs from '../../ActivityLogs';
import { ChevronDown, ChevronRight, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DetailHeader from '../DetaiHeader';
import NoDataFound from '../../common/noDataFound';

type SupportedEntity =
  | 'account'
  | 'user'
  | 'contact'
  | 'product'
  | 'pricebook'
  | 'pricebookentry'
  | 'priceList'
  | 'pricelistEntry'
  | 'order'
  | 'productBundle'
  | 'bundleItem';

type DetailFieldEntity =
  | 'account'
  | 'user'
  | 'product'
  | 'pricebook'
  | 'priceList'
  | 'pricelistEntry'
  | 'bundleItem';

type EntityKey = keyof typeof entities;

interface DetailViewContextType<T> {
  entityData: T | null;
  refetchEntityData: () => Promise<void>;
  entityType: SupportedEntity;
}

const DetailViewContext = createContext<DetailViewContextType<any> | undefined>(undefined);

export const useDetailViewContext = <T,>() => {
  const context = useContext(DetailViewContext) as DetailViewContextType<T>;
  if (context === undefined) {
    throw new Error('useDetailViewContext must be used within an EntityDetailView');
  }
  return context;
};

interface EntityDetailViewProps<T> {
  entityType: SupportedEntity;
  schema: ZodType<T>;
  service: {
    getById: (id: string) => Promise<any>;
    update?: (id: string, data: Partial<T>) => Promise<any>;
    delete?: (id: string) => Promise<any>;
  };
  labelField?: keyof T;
  topFields?: (keyof T)[];
  isActivity?: boolean;
  RelatedDetails?: React.ComponentType<any>;
  onEditClick?: () => void;
  noneditableFields?: string[];
  hiddenFields?: string[];
  extraProps?: Record<string, any>;
  hideName?: boolean;
}

const EntityDetailView = <T extends Record<string, any>>({
  entityType,
  schema,
  service,
  labelField,
  topFields,
  isActivity = true,
  RelatedDetails,
  hiddenFields = [],
  extraProps,
  hideName = false,
  onEditClick,
}: EntityDetailViewProps<T>) => {
  const navigate = useNavigate();
  const params = useParams<Record<string, string>>();
  const BUNDLE_ITEM_PARAM = 'itemId';
  const entityId =
    entityType === 'bundleItem'
      ? params[BUNDLE_ITEM_PARAM]
      : params.contactId ||
        params.accountId ||
        params.userId ||
        params.pricebookId ||
        params.pricebookentryId ||
        params.orderId ||
        params.pricelistId ||
        params.productId ||
        params.bundleId;

  const [entity, setEntity] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editField, setEditField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(true);
  const [activityData, setActivityData] = useState([]);
  const [activeTab, setActiveTab] = useState<'details' | 'related'>('details');
  const cleanNulls: any = (obj: any) => {
    if (obj === null) return '';
    if (Array.isArray(obj)) return obj.map(cleanNulls);
    if (typeof obj === 'object') {
      return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, cleanNulls(v)]));
    }
    return obj;
  };
  useEffect(() => {
    const cleanNulls = (obj: any): any => {
      if (obj === null) return '';
      if (Array.isArray(obj)) return obj.map(cleanNulls);
      if (typeof obj === 'object') {
        return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, cleanNulls(v)]));
      }
      return obj;
    };

    const fetchEntity = async () => {
      setLoading(true);
      try {
        const res = await service.getById(`${entityId}`);
        const cleanedRes = cleanNulls(res);
        gatActivityLogs(entityType, entityId, setActivityData);

        const result = schema.safeParse(cleanedRes);

        if (result.success) {
          setEntity(result.data);
        } else {
          console.warn(`Zod validation failed for ${entityType}:`, result.error);

          setEntity(cleanedRes);
        }
      } catch (err) {
        console.error(`Failed to fetch ${entityType}:`, err);
        setError(`Failed to load ${entityType} data`);
      } finally {
        setLoading(false);
      }
    };

    fetchEntity();
  }, [entityId, navigate, entityType]);

  const formatFieldName = (field: string) =>
    field.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());

  const fetchEntity = useCallback(async () => {
    if (!entityId) {
      setLoading(false);
      setError(`No ID provided for ${entityType}`);
      return;
    }
    setLoading(true);
    try {
      const res = await service.getById(entityId);
      const rawData = res.data ?? res;
      const parsed: any = schema.parse(rawData);
      if (entityType === 'bundleItem') {
        if (rawData?.bundleId) parsed.bundleId = rawData.bundleId;
        if (parsed?.productId) {
          try {
            const product = await productService.getById(parsed.productId);
            parsed.product = product;
          } catch (err) {
            console.error('Failed to load linked product for bundleItem:', err);
          }
        }
      }
      if (entityType === 'product') {
        parsed.specification = parsed.isBundle ? 'Bundle' : 'Simple';
      }
      setEntity(parsed);
      gatActivityLogs(entityType as EntityKey, entityId, setActivityData);
    } catch (err) {
      console.error(`Error loading ${entityType}:`, err);
      setError(`Failed to load ${formatFieldName(entityType)} data.`);
      toast.error(`Failed to load ${formatFieldName(entityType)} data.`);
      navigate(`/apps/sales/${entityType}s`, { replace: true });
    } finally {
      setLoading(false);
    }
  }, [entityId, navigate, entityType, schema, service]);

  const refetchEntityData = useCallback(async () => {
    await fetchEntity();
  }, [fetchEntity]);

  useEffect(() => {
    fetchEntity();
  }, [fetchEntity]);

  const handleEdit = (field: string) => {
    setEditField(field);
    setTempValue((entity?.[field as keyof T] as any)?.toString() || '');
    setError(null);
  };

  const handleSave = async () => {
    if (!editField || !entity) return;
    if (!service.update) return;

    try {
      const fieldSchema = (schema as any).shape?.[editField];
      if (!(fieldSchema && fieldSchema.safeParse(tempValue).success) && fieldSchema) {
        throw new z.ZodError([
          {
            code: z.ZodIssueCode.custom,
            path: [editField],
            message: 'Invalid format or value',
          },
        ]);
      }
      let updatedValue: any = { [editField]: tempValue };

      if (
        editField === 'unitPrice' ||
        editField === 'defaultTermMonths' ||
        editField === 'quantity' ||
        editField === 'overridePrice'
      ) {
        updatedValue[editField] = tempValue === '' ? null : parseFloat(tempValue);
      } else if (editField === 'specification') {
        updatedValue = {
          isBundle: tempValue === 'Bundle',
        };
      }
      const updatePromise = service
        .update(entityId!, updatedValue)
        .then(async (res: any) => {
          await refetchEntityData();
          setEntity((prev: any) => ({
            ...prev,
            ...(editField === 'specification'
              ? { isBundle: tempValue === 'Bundle' }
              : { [editField]: tempValue }),
          }));
          setEditField(null);
          setError(null);
          return { message: res?.message ?? res?.data?.message ?? '' };
        })
        .catch((err) => {
          const msg = extractErrorMessage(err);
          setError(msg);
          throw new Error(msg);
        });

      toast.promise(updatePromise, {
        loading: `Updating ${formatFieldName(editField)}...`,
        success: (data) => data.message,
        error: (err) => err.message,
      });
    } catch (err: any) {
      const errorMessage =
        err instanceof z.ZodError
          ? err.issues
              .map((i: z.core.$ZodIssue) => `${formatFieldName(i.path[0] as string)}: ${i.message}`)
              .join(', ')
          : err.message || 'Invalid value provided.';
      setError(errorMessage);
    }
  };

  const handleDelete = async () => {
    if (!entity || !entityId) return;
    if (!service.delete) return;
    const deletePromise = service
      .delete(entityId)
      .then((res) => {
        setIsDeleteModalOpen(false);
        if (entityType === 'pricebookentry') {
          navigate(`/apps/sales/pricebooks`);
        } else if (entityType === 'bundleItem') {
          navigate(`/apps/sales/products`);
        } else {
          navigate(`/apps/sales/${entityType}s`);
        }
        return { message: `${res?.message}` };
      })
      .catch((err) => {
        const msg = extractErrorMessage(err);
        setError(msg);
        throw new Error(msg);
      });

    toast.promise(deletePromise, {
      loading: `Deleting ${entity[labelField || 'id']}...`,
      success: (message) => message,
      error: (err) => err.message,
    });
  };

  const showRelatedTab = entityType !== 'pricebookentry' && RelatedDetails;

  const shape = (schema as z.ZodObject<any>).shape;
  const fields = Object.keys(shape)
    .filter((key) => !hiddenFields.includes(key))
    .map((key) => {
      const typedKey = key as keyof T;
      return {
        key: typedKey,
        label: key === 'sku' ? 'Product Code' : formatFieldName(key),
        value: entity?.[typedKey],
        isEditable: entityType !== 'productBundle' && key !== 'id' && key !== 'accountId',
      };
    });

  const mid = Math.ceil(fields.length / 2);
  const left = fields.slice(0, mid);
  const right = fields.slice(mid);

  if (loading) return <ViewSkeleton />;

  if (!entity && !loading) {
    return (
      <NoDataFound message={`No ${formatFieldName(entityType)} found or an error occurred.`}>
        <Button
          variant="outline"
          onClick={() => navigate(`/apps/sales/${entityType}s`)}
          className="mt-4"
        >
          Go Back
        </Button>
      </NoDataFound>
    );
  }

  const entityForActivity = entities[entityType as EntityKey] ?? entityType;
  const detailFieldEntity =
    entityType === 'pricebookentry' ? 'pricelistEntry' : (entityType as DetailFieldEntity);
  const onEdit = () => {
    if (onEditClick) {
      return onEditClick();
    } else {
      return navigate(`/apps/sales/${entityType}s/edit/${entityId}`);
    }
  };
  return (
    <DetailViewContext.Provider value={{ entityData: entity, refetchEntityData, entityType }}>
      <div className="bg-gray-100">
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto p-4 sm:px-6 flex justify-between items-center mb-3">
            <DetailHeader
              entityType={entityType}
              entityData={entity}
              topFields={topFields}
              labelField={labelField as string | undefined}
              hideName={hideName}
            />
            {entityType !== 'productBundle' && (service.update || service.delete) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {service.update && (
                    <DropdownMenuItem className="cursor-pointer" onClick={onEdit}>
                      Edit
                    </DropdownMenuItem>
                  )}
                  {service.delete && (
                    <DropdownMenuItem
                      onClick={() => setIsDeleteModalOpen(true)}
                      className="text-red-500 cursor-pointer"
                    >
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div
            className={`${isActivity ? 'lg:col-span-2' : 'lg:col-span-3'} min-h-[600px] flex flex-col`}
          >
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <div className="bg-white rounded-md shadow-md mb-6">
                {showRelatedTab ? (
                  <TabsHeader
                    tabs={[
                      { value: 'details', label: 'Details' },
                      { value: 'related', label: 'Related' },
                    ]}
                  />
                ) : (
                  <div className="px-6 py-3 border-b border-gray-200">
                    <h2 className="text-lg font-semibold">Details</h2>
                  </div>
                )}

                <TabsContent value="details" className="p-4 sm:p-6 mt-0">
                  <div className="mb-8 border border-gray-200 rounded-md">
                    <div
                      className="p-4 bg-gray-50/50 cursor-pointer hover:bg-gray-100"
                      onClick={() => setIsInfoOpen(!isInfoOpen)}
                    >
                      <h3 className="text-base font-semibold flex items-center">
                        {isInfoOpen ? (
                          <ChevronDown size={16} className="mr-2" />
                        ) : (
                          <ChevronRight size={16} className="mr-2" />
                        )}
                        {formatFieldName(entityType)} Information
                      </h3>
                    </div>

                    {isInfoOpen && (
                      <div className="p-2 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                        {[left, right].map((col, i) => (
                          <div key={i} className="space-y-2">
                            {col.map((item) => (
                              <DetailField
                                key={item.key as string}
                                entity={detailFieldEntity}
                                fieldKey={item.key as string}
                                value={item.value}
                                isEditable={item.isEditable}
                                isEditing={editField === item.key}
                                error={editField === item.key ? (error ?? undefined) : undefined}
                                tempValue={tempValue}
                                onEdit={handleEdit}
                                onSave={handleSave}
                                onCancel={() => {
                                  setEditField(null);
                                  setError(null);
                                }}
                                onTempChange={setTempValue}
                                {...(extraProps ?? {})}
                                entityType={entityType}
                              />
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="related" className="p-4 sm:p-6 mt-0">
                  {RelatedDetails ? (
                    <RelatedDetails product={entity} />
                  ) : (
                    <NoDataFound message="No related records found." />
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {isActivity && (
            <div className="lg:col-span-1 bg-white rounded-md shadow-md h-full sticky top-[138px] max-h-[60vh] pb-7 flex flex-col">
              <Tabs defaultValue="activity" className="w-full flex flex-col h-full">
                <TabsList className="bg-gray-100 border-b border-gray-200 h-10">
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>
                <TabsContent value="activity" className="flex-1 overflow-y-auto p-4 mt-0">
                  <ActivityLogs activities={activityData} entity={entityForActivity} />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
        {service.delete && (
          <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this {entityType}?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </DetailViewContext.Provider>
  );
};

export default EntityDetailView;

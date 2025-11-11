import * as React from 'react';
import { Check, X, SquarePen, Lock } from 'lucide-react';
import ReusableSelect from '@/features/components/common/ReusableSelect';
import {
  accountConstraints,
  userConstraints,
  productConstraints,
  pricebookConstraints,
  priceListConstraints,
  pricelistEntryConstraints,
  bundleItemConstraints,
} from '@/utils/constraints';
import { useMemo } from 'react';

const constraintsMap = {
  account: accountConstraints,
  user: userConstraints,
  product: productConstraints,
  pricebook: pricebookConstraints,
  priceList: priceListConstraints,
  pricelistEntry: pricelistEntryConstraints,
  bundleItem: bundleItemConstraints,
} as const;

type EntityKey = keyof typeof constraintsMap;
interface Option {
  label: string;
  value: string;
}

interface DetailFieldProps {
  entity: EntityKey;
  fieldKey: string;
  value: string | number | null | undefined;
  isEditable?: boolean;
  isEditing?: boolean;
  tempValue?: string;
  disabled?: boolean;
  onEdit: (fieldKey: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onTempChange: (newValue: string) => void;
  productOptions?: Option[];
  productLoading?: boolean;
  error?: string;
  entityType: string;
  customFields?: Record<string, (value: any) => React.ReactNode>;
}

const DetailField: React.FC<DetailFieldProps> = ({
  entity,
  fieldKey,
  value,
  isEditable = false,
  isEditing = false,
  tempValue = '',
  disabled = false,
  onEdit,
  onSave,
  onCancel,
  onTempChange,
  productOptions = [],
  productLoading = false,
  error,
  customFields,
}) => {
  const constraints = constraintsMap[entity];
  const selectOptions = constraints?.selectOptions ?? {};

  const currencyOptions: Option[] = useMemo(() => {
    const raw =
      'currency' in selectOptions
        ? (selectOptions as any).currency
        : (pricelistEntryConstraints.selectOptions.currency ?? []);
    return raw.map((c: any) => ({
      label: c.name ?? c.key ?? c,
      value: c.key ?? c,
    }));
  }, [selectOptions]);

  const formatFieldName = (fieldName: string) =>
    fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();

  const getLabel = (fieldName: string) => {
    // Special case: show 'Product Code' for sku field
    if (fieldName === 'sku') return 'Product Code';
    const label = formatFieldName(fieldName);
    const requiredFields = ['name', 'type', 'website'];
    return requiredFields.includes(fieldName) ? `${label} *` : label;
  };

  const getFieldType = (fieldName: string): 'text' | 'url' | 'tel' | 'select' | 'number' => {
    if (fieldName === 'website') return 'url';
    if (fieldName === 'phone') return 'tel';
    if (fieldName === 'unitPrice') return 'number';
    if (['productId', 'pricingMode'].includes(fieldName)) return 'select';
    if (
      [
        'type',
        'industry',
        'title',
        'roles',
        'status',
        'accountType',
        'currency',
        'billingFrequency',
        'defaultBillingPeriod',
        'isArchived',
        'specification',
      ].includes(fieldName)
    )
      return 'select';
    return 'text';
  };

  const fieldType = getFieldType(fieldKey);
  const displayValue =
    fieldKey === 'specification' && (value === 'simple' || value === 'bundle')
      ? String(value).charAt(0).toUpperCase() + String(value).slice(1)
      : value === null || value === undefined || value === ''
        ? '—'
        : String(value);

  const isSelectField = fieldType === 'select';
  const rawOptions = isSelectField ? ((selectOptions as any)[fieldKey] ?? []) : [];
  const genericOptions: Option[] = Array.isArray(rawOptions)
    ? rawOptions.map((o: any) => {
        if (typeof o === 'string') return { label: o, value: o };
        return { label: o.name || o.key || o, value: o.key || o };
      })
    : [];

  const finalOptions =
    fieldKey === 'productId'
      ? productOptions
      : fieldKey === 'currencyCode'
        ? currencyOptions
        : genericOptions;

  const finalPlaceholder =
    fieldKey === 'productId' && productLoading ? 'Loading products…' : 'Select…';

  return (
    <div className={`group flex flex-col py-1 transition-all ${disabled ? 'opacity-70' : ''}`}>
      <span
        className={`text-[11px] font-semibold tracking-wide mb-0.5 ${
          disabled ? 'text-gray-800 dark:text-gray-700' : 'text-gray-500 dark:text-gray-400'
        }`}
      >
        {fieldKey === 'productId'
          ? 'Product'
          : fieldKey === 'currencyCode'
            ? 'Currency'
            : getLabel(fieldKey)}
      </span>

      {isEditing && !disabled ? (
        <div className="relative mt-1">
          {isSelectField || fieldKey === 'productId' || fieldKey === 'currencyCode' ? (
            <ReusableSelect
              fieldName={`${formatFieldName(fieldKey).toLowerCase()}`}
              options={finalOptions}
              value={tempValue}
              onChange={onTempChange}
              searchable={fieldKey === 'productId' || fieldKey === 'currencyCode'}
              placeholder={finalPlaceholder}
              isEditing={isEditing}
            />
          ) : (
            <input
              type={
                fieldType === 'number'
                  ? 'number'
                  : fieldType === 'url'
                    ? 'url'
                    : fieldType === 'tel'
                      ? 'tel'
                      : 'text'
              }
              className="w-full bg-transparent border-0 border-b-2 border-gray-300 dark:border-gray-700 focus:border-blue-500 hover:border-blue-400 focus:ring-0 px-0 pr-16 py-1 text-sm text-gray-900 dark:text-gray-100 transition-all outline-none"
              value={tempValue}
              onChange={(e) => onTempChange(e.target.value)}
              autoFocus
            />
          )}
          <div className="absolute inset-y-0 right-0 flex items-center gap-1.5 pr-1.5">
            <button
              onClick={onSave}
              className="p-1 cursor-pointer rounded-md text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 hover:scale-110 transition-all"
              aria-label={`Save ${fieldKey}`}
            >
              <Check size={16} strokeWidth={2.5} />
            </button>
            <button
              onClick={onCancel}
              className="p-1 rounded-md cursor-pointer text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 hover:scale-110 transition-all"
              aria-label={`Cancel ${fieldKey}`}
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          </div>
          {error && <p className="text-red-500 text-xs mt-1 pl-1">{error}</p>}
        </div>
      ) : (
        <div
          className={`flex items-center justify-between text-[15px] mt-0.5 border-b-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 transition-colors ${
            !disabled && isEditable ? 'cursor-pointer' : 'cursor-default'
          }`}
          onClick={() => !disabled && isEditable && onEdit(fieldKey)}
        >
          <span
            className={`truncate pb-1 ${
              disabled
                ? 'text-gray-500 dark:text-gray-400'
                : 'text-gray-900 dark:text-gray-100 group-hover:text-blue-600'
            }`}
          >
            {customFields?.[fieldKey]
              ? customFields[fieldKey](value)
              : fieldKey === 'productId'
                ? (productOptions.find((o) => o.value === value)?.label ?? displayValue)
                : fieldKey === 'currencyCode'
                  ? (currencyOptions.find((o) => o.value === value)?.label ?? displayValue)
                  : displayValue}
          </span>

          {disabled ? (
            <Lock
              size={14}
              className="text-gray-400 dark:text-gray-500 ml-2"
              aria-label="Field is locked"
            />
          ) : (
            isEditable && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(fieldKey);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all ml-1"
                aria-label={`Edit ${fieldKey}`}
              >
                <SquarePen size={14} strokeWidth={2} />
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
};
export default DetailField;

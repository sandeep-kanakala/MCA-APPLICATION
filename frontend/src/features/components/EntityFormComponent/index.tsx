import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { Save, Loader2 } from 'lucide-react';
import FormPageLayout from '@/features/components/form-layout';
import { DateTimePicker } from '../CustomDatePicker';
import { Checkbox } from '@/components/ui/checkbox';
import ReusableSelect from '../common/ReusableSelect';

export type FieldType =
  | 'text'
  | 'email'
  | 'tel'
  | 'url'
  | 'select'
  | 'textarea'
  | 'checkbox'
  | 'date'
  | 'number';

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }> | string[];
  gridSpan?: 1 | 2;
  disabled?: boolean | ((mode: 'create' | 'edit') => boolean);
  readOnly?: boolean | ((mode: 'create' | 'edit') => boolean);
  child?: FieldConfig[]; // support nested dependent fields
}

export interface DynamicFormProps {
  mode: 'create' | 'edit';
  entityName: string;
  schema: z.ZodObject<any>;
  fields: FieldConfig[];
  initialData?: Record<string, any>;
  backPath: string;
  onSubmit: (data: any) => Promise<any>;
  fetchInitialData?: () => Promise<any>;
  excludeFields?: string[];
  customLabels?: Record<string, string>;
  onSuccess?: () => void;
  onCancel?: () => void;
  fieldOptions?: Record<string, Array<{ value: string; label: string; entries?: [] }>>;
  loadingFields?: string[];
  disabledFields?: string[];
  readOnlyFields?: string[];
  onFieldChange?: (fieldName: string, value: any, allValues: Record<string, any>) => void;
}

const formatFieldName = (fieldName: string): string => {
  return fieldName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

const EntityFormComponent: React.FC<DynamicFormProps> = ({
  mode,
  entityName,
  schema,
  fields,
  initialData = {},
  backPath,
  onSubmit,
  fetchInitialData,
  excludeFields = [],
  customLabels = {},
  onSuccess,
  fieldOptions = {},
  loadingFields = [],
  disabledFields = [],
  readOnlyFields = [],
  onFieldChange,
}) => {
  const [isLoading, setIsLoading] = useState(mode === 'edit' && !!fetchInitialData);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = mode === 'edit';
  const title = `${isEditMode ? 'Edit' : 'Add New'} ${entityName}`;
  const cardTitle = `${entityName} ${isEditMode ? 'Information' : 'Details'}`;

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialData,
  });

  const { handleSubmit: formHandleSubmit, reset, watch, setValue } = form;

  // Flatten parent-child structure
  const flattenFields = (fields: FieldConfig[]): FieldConfig[] => {
    const flattened: FieldConfig[] = [];
    fields.forEach((field) => {
      flattened.push(field);
      if (field.child && Array.isArray(field.child)) {
        flattened.push(...flattenFields(field.child));
      }
    });
    return flattened;
  };

  const allFields = flattenFields(fields);

  // helper to check visibility of a field based on parent value
  const shouldFieldBeVisible = (field: FieldConfig, formValues: Record<string, any>): boolean => {
    const parentField = fields.find((f) => f.child?.some((c) => c.name === field.name));
    if (!parentField) return true;
    const parentValue = formValues[parentField.name];
    return !!parentValue;
  };

  useEffect(() => {
    if (isEditMode && fetchInitialData) {
      const loadData = async () => {
        try {
          setIsLoading(true);
          const data = await fetchInitialData();
          reset(data);
          setError(null);
        } catch (err: any) {
          const errorMsg = err.response?.data?.message || err.message || 'Failed to load data';
          setError(errorMsg);
          toast.error(errorMsg);
        } finally {
          setIsLoading(false);
        }
      };
      loadData();
    }
  }, [isEditMode, fetchInitialData, reset]);

  const formValues = watch();
  const visibleFields = allFields.filter(
    (field) => !excludeFields.includes(field.name) && shouldFieldBeVisible(field, formValues),
  );

  const filledCount = Object.keys(schema.shape).filter((key) => {
    const value = formValues[key];
    return value !== '' && value !== null && value !== undefined && value !== 'none';
  }).length;
  const totalCount = Object.keys(schema.shape).length;

  const handleFormSubmit = async (data: any) => {
    try {
      setIsSaving(true);
      setError(null);

      const cleanedData = Object.fromEntries(
        Object.entries(data).filter(
          ([_, value]) => value !== undefined && value !== '' && value !== 'none',
        ),
      );

      const response = await onSubmit(cleanedData);
      if (!response) return;
      const successMessage =
        response?.message || `${entityName} ${isEditMode ? 'updated' : 'created'} successfully!`;

      toast.success(successMessage);
      reset();
      onSuccess?.();
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        `Failed to ${isEditMode ? 'update' : 'create'} ${entityName.toLowerCase()}`;
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldValueChange = (fieldName: string, value: any) => {
    setValue(fieldName, value === 'none' ? '' : value);

    if (onFieldChange) {
      const allValues = form.getValues();
      onFieldChange(fieldName, value === 'none' ? '' : value, {
        ...allValues,
        [fieldName]: value === 'none' ? '' : value,
      });
    }
  };

  const renderField = (field: FieldConfig) => {
    const fieldLabel = customLabels[field.name] || field.label || formatFieldName(field.name);
    const isRequired = field.required;
    const placeholder = field.placeholder || `Enter ${fieldLabel.toLowerCase()}`;
    const finalOptions = fieldOptions[field.name] || field.options || [];
    const isLoadingOptions = loadingFields.includes(field.name);

    const fieldDisabled =
      typeof field.disabled === 'function' ? field.disabled(mode) : field.disabled;
    const propDisabled = disabledFields.includes(field.name);
    const isDisabled = fieldDisabled || propDisabled || isLoadingOptions;

    const fieldReadOnly =
      typeof field.readOnly === 'function' ? field.readOnly(mode) : field.readOnly;
    const propReadOnly = readOnlyFields.includes(field.name);
    const isReadOnly = fieldReadOnly || propReadOnly;

    return (
      <div
        key={field.name}
        className={`space-y-2 transition-all duration-300 ${
          field.gridSpan === 2 ? 'md:col-span-2' : ''
        }`}
      >
        <Label htmlFor={field.name}>
          {fieldLabel}
          {isRequired && <span className="text-red-500"> *</span>}
        </Label>

        {field.type === 'select' ? (
          <ReusableSelect
            value={watch(field.name) || ''}
            onChange={(value) => handleFieldValueChange(field.name, value)}
            options={[
              ...(!isRequired ? [{ label: 'None', value: 'none' }] : []),
              ...finalOptions.map((opt: any) =>
                typeof opt === 'string' ? { label: opt, value: opt } : opt,
              ),
            ]}
            fieldName={fieldLabel}
            placeholder={isLoadingOptions ? `Loading ${fieldLabel}...` : placeholder}
            disabled={isDisabled}
            className={`focus-visible:ring-0 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            searchable={true}
          />
        ) : field.type === 'textarea' ? (
          <textarea
            id={field.name}
            placeholder={placeholder}
            {...form.register(field.name)}
            onChange={(e) => handleFieldValueChange(field.name, e.target.value)}
            rows={4}
            disabled={isDisabled}
            readOnly={isReadOnly}
            className={`w-full px-3 py-2 border border-input rounded-md focus-visible:ring-0 focus-visible:ring-offset-0 ${
              isDisabled ? 'opacity-50 cursor-not-allowed bg-muted' : ''
            } ${isReadOnly ? 'bg-muted' : ''}`}
          />
        ) : field.type === 'date' ? (
          <DateTimePicker
            value={watch(field.name) || null}
            onChange={(date) => {
              if (!isDisabled && !isReadOnly) handleFieldValueChange(field.name, date);
            }}
          />
        ) : field.type === 'checkbox' ? (
          <Checkbox
            id={field.name}
            checked={watch(field.name) || false}
            onCheckedChange={(checked) => {
              if (!isDisabled && !isReadOnly) handleFieldValueChange(field.name, checked);
            }}
            disabled={isDisabled}
          />
        ) : (
          <Input
            id={field.name}
            type={field.type}
            placeholder={placeholder}
            {...form.register(field.name)}
            onChange={(e) => handleFieldValueChange(field.name, e.target.value)}
            disabled={isDisabled}
            readOnly={isReadOnly}
            className={`focus-visible:ring-0 w-full ${
              isDisabled ? 'opacity-50 cursor-not-allowed bg-muted' : ''
            } ${isReadOnly ? 'bg-muted cursor-default' : ''}`}
          />
        )}

        {form.formState.errors[field.name] && (
          <p className="text-red-500 text-sm">
            {form.formState.errors[field.name]?.message as string}
          </p>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-6 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        <p className="text-gray-600">Loading {entityName.toLowerCase()} data...</p>
      </div>
    );
  }

  if (error && isEditMode && !formValues) {
    return (
      <div className="flex-1 space-y-4 p-6 text-center text-red-500">
        <p>{error}</p>
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }

  const ActionArea = (
    <Button className="cursor-pointer" type="submit" disabled={isSaving}>
      {isSaving ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Save className="h-4 w-4 mr-2" />
      )}
      {isSaving
        ? `${isEditMode ? 'Updating' : 'Creating'}...`
        : `${isEditMode ? 'Save Changes' : `Save ${entityName}`}`}
    </Button>
  );

  return (
    <FormPageLayout
      title={title}
      cardTitle={cardTitle}
      backPath={backPath}
      filledCount={filledCount}
      totalCount={totalCount}
      error={error}
      onSubmit={formHandleSubmit(handleFormSubmit)}
      actionArea={ActionArea}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{visibleFields.map(renderField)}</div>
    </FormPageLayout>
  );
};

export default EntityFormComponent;

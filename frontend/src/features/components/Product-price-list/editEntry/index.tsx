import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { Save, Loader2 } from 'lucide-react';
import FormPageLayout from '@/features/components/form-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { toast } from '@/components/ui/sonner';
import { pricelistEntrySchema, type PricelistEntry } from '../utils';
import priceListService from '@/utils/services/product-pricelist';
import { pricelistEntryConstraints } from '@/utils/constraints';
import { DateTimePicker } from '../../CustomDatePicker';

type UpdatePricelistEntryPayload = {
  [K in keyof Omit<PricelistEntry, 'id'>]?: PricelistEntry[K] extends string | null | undefined
    ? string | undefined
    : PricelistEntry[K];
};

type SelectOptionKeys = keyof typeof pricelistEntryConstraints.selectOptions;

const formatFieldName = (field: string): string => {
  return field.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
};

const extractErrorMessage = (error: any): string => {
  const backendMessage = error.response?.data?.message || error.response?.data?.error;
  if (backendMessage && typeof backendMessage === 'string' && backendMessage.trim() !== '') {
    return backendMessage;
  }
  if (error.message && typeof error.message === 'string' && error.message.trim() !== '') {
    return error.message;
  }
  return 'An unknown error occurred.';
};

const pricelistEntryViewSchema = pricelistEntrySchema;

const formEditableKeys: (keyof PricelistEntry)[] = Object.keys(pricelistEntryViewSchema.shape)
  .filter((key) => key !== 'id')
  .map((key) => key as keyof PricelistEntry);

const formRenderKeys: (keyof PricelistEntry)[] = formEditableKeys;

const cleanUpdatePayload = (
  data: Partial<PricelistEntry>,
  originalPricelistEntry: PricelistEntry,
): UpdatePricelistEntryPayload => {
  const dataToSend: UpdatePricelistEntryPayload = {};

  const editableKeys: (keyof UpdatePricelistEntryPayload)[] = formEditableKeys.filter(
    (key): key is keyof UpdatePricelistEntryPayload => key !== 'id',
  );

  editableKeys.forEach((key) => {
    let formValue = data[key];
    const originalValue = originalPricelistEntry[key];

    let canonicalFormValue: any;

    if (typeof formValue === 'string' || formValue === null || formValue === undefined) {
      canonicalFormValue =
        formValue === null || formValue === undefined || formValue === '' ? undefined : formValue;
    } else {
      canonicalFormValue = formValue;
    }

    const canonicalOriginalValue =
      originalValue === null || originalValue === undefined || originalValue === ''
        ? undefined
        : originalValue;

    const hasChanged = canonicalFormValue !== canonicalOriginalValue;

    if (hasChanged) {
      dataToSend[key] = canonicalFormValue;
    }
  });

  return dataToSend;
};

const PricelistEntryEditForm: React.FC = () => {
  const navigate = useNavigate();
  const { pricelistId, entryId } = useParams<{
    pricelistId: string;
    entryId: string;
  }>();

  const [pricelistEntry, setPricelistEntry] = useState<PricelistEntry | null>(null);
  const [formData, setFormData] = useState<Partial<PricelistEntry>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const backPath = pricelistId ? `/apps/sales/pricelist/${pricelistId}` : '/apps/sales/pricelist';

  useEffect(() => {
    if (!entryId) {
      setError('Entry ID is missing from the URL.');
      setIsLoading(false);
      return;
    }

    const fetchPricelist = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const apiPricelistEntry = await priceListService.getEntryId(`${entryId}`);
        const cleanedData = {
          ...apiPricelistEntry,
          discountPct: Number(apiPricelistEntry.discountPct ?? 0),
          unitPrice: Number(apiPricelistEntry.unitPrice ?? 0),
        };
        const parsedResult = pricelistEntryViewSchema.safeParse(cleanedData);

        if (parsedResult.success) {
          const fetchedPricelistEntry = parsedResult.data as PricelistEntry;
          setPricelistEntry(fetchedPricelistEntry);
          const initialFormData: Partial<PricelistEntry> = {};
          formEditableKeys.forEach((key) => {
            const value = fetchedPricelistEntry[key];

            if (typeof value === 'string' || value === null || value === undefined) {
              initialFormData[key] = (value ?? '') as any;
            } else {
              initialFormData[key] = value as any;
            }
          });

          setFormData(initialFormData);
        } else {
          const zodError = parsedResult.error;
          const errorDetails = zodError.issues
            .map((issue) => `${formatFieldName(issue.path[0] as string)}: ${issue.message}`)
            .join('; ');
          setError('Fetched entry data is invalid. Schema error(s): ' + errorDetails);
        }
      } catch (err) {
        const errorMessage = extractErrorMessage(err);

        setError(`Failed to load entry details: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPricelist();
  }, [pricelistId, entryId]);

  const handleChange = (field: keyof PricelistEntry, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError(null);
  };

  const handleSelectChange = (field: keyof PricelistEntry, value: string) => {
    if (field === 'id' && (value === 'none' || value === '')) {
      return;
    }
    handleChange(field, value === 'none' ? '' : value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!pricelistEntry || isSaving) return;

    const dataToSend: any = cleanUpdatePayload(formData, pricelistEntry);

    const numericFields = ['amount', 'discountPct'];
    for (const key of numericFields) {
      if (key in dataToSend && dataToSend[key] !== '' && dataToSend[key] !== null) {
        dataToSend[key] = Number(dataToSend[key]);
      }
    }
    if (Object.keys(dataToSend).length === 0) {
      toast.info('No changes detected to save.');
      return;
    }

    try {
      pricelistEntryViewSchema.parse({ ...pricelistEntry, ...dataToSend });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const validationError = error.issues
          .map((e) => `${formatFieldName(e.path[0] as string)}: ${e.message}`)
          .join(', ');
        setError('Validation failed: ' + validationError);
      } else {
        setError('A validation error occurred.');
      }
      return;
    }

    setIsSaving(true);

    const updatePromise = priceListService
      .updateEntry(entryId || '', dataToSend)
      .then((res: any) => {
        if (res && (res.statusCode === 200 || res.statusCode === 204 || res.id)) {
          navigate(backPath);
          return { message: `${pricelistEntry.name}'s entry updated successfully.` };
        } else {
          throw new Error(res.message || 'Update failed with unknown status.');
        }
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
      loading: `Saving changes for ${pricelistEntry.name}...`,
      success: (data: { message: string }) => data.message,
      error: (err) => err.message,
    });
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-6 text-center">
        <p className="text-gray-600">Loading entry data for editing...</p>
      </div>
    );
  }

  if (error && !pricelistEntry) {
    return (
      <div className="flex-1 space-y-4 p-6 text-center text-red-500">
        <p>{error}</p>
        <Button onClick={() => navigate('/apps/sales/pricelist')}>Go Back</Button>
      </div>
    );
  }

  if (!pricelistEntry) {
    return (
      <div className="flex-1 space-y-4 p-6 text-center text-red-500">
        <p>Could not load entry data.</p>
      </div>
    );
  }

  return (
    <FormPageLayout
      title={`Edit Entry: ${pricelistEntry.name}`}
      cardTitle="Entry Information"
      backPath={backPath}
      error={error}
      onSubmit={handleSubmit}
      actionArea={
        <Button className="cursor-pointer" type="submit" disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Changes
        </Button>
      }
    >
      {formRenderKeys.map((key) => {
        const label = formatFieldName(key);
        const isSelect = (key as string) in pricelistEntryConstraints.selectOptions;
        const value = formData[key] || '';
        const isDateField = ['effectiveTo', 'effectiveFrom']?.includes(key);
        return (
          <div className="space-y-2" key={key}>
            <Label htmlFor={key}>
              {key === 'name' || key === 'billingFrequency' ? `${label} *` : label}
            </Label>
            <div className="flex items-center w-full">
              {isSelect ? (
                <Select
                  value={value as string}
                  onValueChange={(value) => handleSelectChange(key, value)}
                >
                  <SelectTrigger id={key} className="w-full cursor-pointer focus-visible:ring-0">
                    <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {key !== 'billingFrequency' && <SelectItem value="none">None</SelectItem>}
                    {pricelistEntryConstraints.selectOptions[key as SelectOptionKeys]?.map(
                      (opt: any) => {
                        const optionValue = typeof opt === 'string' ? opt : opt.key;
                        const optionLabel = typeof opt === 'string' ? opt : opt.name;

                        return (
                          <SelectItem key={optionValue} value={optionValue}>
                            {optionLabel}
                          </SelectItem>
                        );
                      },
                    )}
                  </SelectContent>
                </Select>
              ) : isDateField ? (
                <DateTimePicker
                  value={value ? new Date(value as string) : null}
                  onChange={(val) => handleChange(key, val ? val.toISOString() : '')}
                />
              ) : (
                <Input
                  id={key}
                  name={key}
                  value={value as string}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="focus-visible:ring-0 w-full"
                />
              )}
            </div>
          </div>
        );
      })}
    </FormPageLayout>
  );
};

export default PricelistEntryEditForm;

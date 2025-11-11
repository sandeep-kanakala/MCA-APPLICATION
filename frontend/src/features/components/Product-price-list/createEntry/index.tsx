import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Form, FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { Save } from 'lucide-react';
import { pricelistEntryConstraints } from '@/utils/constraints';
import { toast } from '@/components/ui/sonner';
import { useNavigate, useParams } from 'react-router-dom';
import FormPageLayout from '@/features/components/form-layout';
import { Checkbox } from '@/components/ui/checkbox';
import { DateTimePicker } from '../../CustomDatePicker';
import priceListService from '@/utils/services/product-pricelist';

import { pricelistEntrySchema } from '../utils';
import { useEffect } from 'react';

type FormValues = z.infer<typeof pricelistEntrySchema>;

const formatFieldName = (fieldName: string) => {
  return fieldName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

const getPlaceholder = (fieldName: keyof FormValues) =>
  `Enter ${formatFieldName(fieldName).toLowerCase()}`;

const getLabel = (fieldName: keyof FormValues) => {
  return formatFieldName(fieldName);
};

const formFieldConfig: {
  name: keyof FormValues;
  type: 'text' | 'url' | 'tel' | 'select' | 'checkbox' | 'date' | 'number';
  gridSpan?: 1 | 2;
}[] = Object.keys(pricelistEntrySchema.shape)
  .filter((key) => key !== 'id')
  .map((key) => {
    const name = key as keyof FormValues;
    let type: 'text' | 'url' | 'tel' | 'select' | 'checkbox' | 'date' = 'text';
    if (name === 'billingFrequency') type = 'select';
    else if (name === 'effectiveFrom' || name === 'effectiveTo') type = 'date';
    return { name, type };
  });

interface PriceListEntryCreateProps {
  onPriceListCreated?: () => void;
}

export default function PriceListCreateEntry({ onPriceListCreated }: PriceListEntryCreateProps) {
  const navigate = useNavigate();
  const { pricelistId } = useParams<{ pricelistId: string }>();
  const [error, setError] = React.useState<string | null>(null);
  const [priceBooksData, setPriceBooksData] = React.useState<any[]>([]);
  const [selectedBook, setSelectedBook] = React.useState<any | null>(null);
  const [selectedEntry, setSelectedEntry] = React.useState<any | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(pricelistEntrySchema) as any,
  });

  const {
    formState: { isSubmitting },
    reset,
    control,
    watch,
    handleSubmit,
  } = form;

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const books = await priceListService.getBooks({ limit: 100, page: 1 });
        if (books?.data) setPriceBooksData(books.data);
      } catch (err) {
        console.error('Error fetching price books:', err);
      }
    };
    fetchBooks();
  }, []);

  const apiSubmit = (formData: FormValues) => {
    setError(null);
    if (!selectedBook || !selectedEntry) {
      toast.error('Please select both a Price Book and an Entry.');
      return;
    }

    const payload: any = {
      ...formData,
      productId: selectedEntry.productId,
      unitPrice: Number(selectedEntry.unitPrice),
      currency: selectedEntry.currencyCode,
      priceBookEntryId: selectedEntry.id,
    };

    const apiPromise = priceListService
      .createEntry(`${pricelistId}`, payload)
      .then((res: any) => {
        if (res.statusCode === 201) {
          reset();
          navigate('/apps/sales/pricelist');
          onPriceListCreated?.();
          return { message: res.message || 'List created successfully' };
        } else {
          throw new Error(res.message || 'List creation failed');
        }
      })
      .catch((error: any) => {
        const message =
          error.response?.data?.message ||
          error.message ||
          'Failed to create list. Please try again.';
        setError(message);
        throw new Error(message);
      });

    toast.promise(apiPromise, {
      loading: 'Creating price list entry...',
      success: (data) => data.message,
      error: (err) => err.message,
    });
  };

  const ActionArea = (
    <Button className="cursor-pointer" type="submit" disabled={isSubmitting}>
      <Save className="h-4 w-4 mr-2" />
      {isSubmitting ? 'Creating Product List...' : 'Save List'}
    </Button>
  );

  const filledCount = Object.keys(pricelistEntrySchema.shape).filter((key) => {
    const value = watch(key as keyof FormValues);
    return value !== '' && value !== null && value !== undefined && value !== 'none';
  }).length;
  const totalCount = Object.keys(pricelistEntrySchema.shape).length;
  return (
    <Form {...form}>
      <FormPageLayout
        title="Add New Entry"
        cardTitle="Entry details"
        backPath={`/apps/sales/pricelist/${pricelistId}`}
        filledCount={filledCount}
        totalCount={totalCount}
        error={error}
        onSubmit={handleSubmit(apiSubmit)}
        actionArea={ActionArea}
      >
        <FormItem>
          <Label>
            Select Price Book <span className="text-red-500">*</span>
          </Label>
          <FormControl>
            <Select
              onValueChange={(value) => {
                const book = priceBooksData.find((b) => b.id === value);
                setSelectedBook(book);
                setSelectedEntry(null);
              }}
              value={selectedBook?.id ?? ''}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Price Book" />
              </SelectTrigger>
              <SelectContent>
                {priceBooksData.map((book) => (
                  <SelectItem key={book.id} value={book.id}>
                    {book.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>

        {selectedBook && (
          <FormItem>
            <Label>
              Select Entry <span className="text-red-500">*</span>
            </Label>
            <FormControl>
              <Select
                onValueChange={(value) => {
                  const entry = selectedBook.entries.find((e: any) => e.id === value);

                  setSelectedEntry(entry);
                }}
                value={selectedEntry?.id ?? ''}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Entry" />
                </SelectTrigger>
                <SelectContent>
                  {selectedBook.entries.map((entry: any) => (
                    <SelectItem key={entry.id} value={entry.id}>
                      {`Product: ${entry.productId} | Price: ${entry.unitPrice} ${entry.currencyCode}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}

        {formFieldConfig.map((field) => (
          <FormField
            key={field.name}
            control={control}
            name={field.name}
            render={({ field: formField }) => {
              const isSelectField =
                field.type === 'select' &&
                (field.name as string) in pricelistEntryConstraints.selectOptions;
              const isCheckboxField = field.type === 'checkbox';
              const isDateField = field.type === 'date';
              const value = isSelectField ? formField.value : (formField.value ?? '');

              return (
                <FormItem className={`space-y-2 ${field.gridSpan === 2 ? 'md:col-span-2' : ''}`}>
                  {!isCheckboxField && (
                    <Label htmlFor={field.name}>
                      {getLabel(field.name)}{' '}
                      {['name', 'type', 'amount', 'discountPct', 'billingFrequency'].includes(
                        field.name,
                      ) && <span className="text-red-500">*</span>}
                    </Label>
                  )}
                  <FormControl>
                    {isSelectField ? (
                      <Select
                        onValueChange={(value) =>
                          formField.onChange(value === 'none' ? undefined : value)
                        }
                        defaultValue={value as string}
                      >
                        <SelectTrigger className="w-full cursor-pointer">
                          <SelectValue
                            placeholder={`Select ${formatFieldName(field.name).toLowerCase()}`}
                          />
                        </SelectTrigger>

                        <SelectContent>
                          {(field.name as string) !== 'productId' && (
                            <SelectItem value="none">None</SelectItem>
                          )}

                          {pricelistEntryConstraints.selectOptions[
                            field.name as keyof typeof pricelistEntryConstraints.selectOptions
                          ]?.map((opt: any) => {
                            const value = typeof opt === 'string' ? opt.trim() : opt.key;
                            const label = typeof opt === 'string' ? opt.trim() : opt.name;
                            return (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    ) : isCheckboxField ? (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={field.name}
                          checked={!!formField.value}
                          onCheckedChange={(checked) => formField.onChange(checked ? true : false)}
                        />
                        <Label htmlFor={field.name} className="flex items-center gap-1">
                          {getLabel(field.name)}
                          {['name', 'type', 'amount', 'discountPct', 'billingFrequency'].includes(
                            field.name,
                          ) && <span className="text-red-500">*</span>}
                        </Label>
                      </div>
                    ) : isDateField ? (
                      <DateTimePicker
                        value={formField?.value}
                        onChange={(val) => formField.onChange(val)}
                      />
                    ) : (
                      <Input
                        id={field.name}
                        type={field.type}
                        // step={field.type === 'number' ? '0.01' : undefined}
                        placeholder={getPlaceholder(field.name)}
                        {...formField}
                        value={value as any}
                        className="focus-visible:ring-0 w-full"
                      />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        ))}
      </FormPageLayout>
    </Form>
  );
}

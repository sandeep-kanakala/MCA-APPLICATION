'use client';

import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Save } from 'lucide-react';
import pricebookService from '@/utils/services/pricebook';
import productService from '@/utils/services/Products';
import {
  type CreatePriceBookEntryDto,
  CreatePriceBookEntrySchema,
} from '@/features/components/PriceBooks/utils';
import { toast } from '@/components/ui/sonner';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { formatFieldName } from '@/utils';
import z from 'zod';
import { pricelistEntryConstraints } from '@/utils/constraints';

const PriceBookEntryFormSchema = CreatePriceBookEntrySchema.extend({
  priceBookId: z.string().min(1),
});

const getLabel = (field: string) => {
  const label = formatFieldName(field);
  return ['productId', 'unitPrice', 'currencyCode', 'priceBookId'].includes(field)
    ? `${label} *`
    : label;
};

const getPlaceholder = (field: string) => {
  if (field === 'currencyCode') return 'e.g. INR';
  if (field === 'unitPrice') return 'e.g. 99.99';
  return `Enter ${formatFieldName(field).toLowerCase()}`;
};

type FieldConfig = { name: keyof CreatePriceBookEntryDto; type: 'text' | 'number' | 'select' };

const fields: FieldConfig[] = [
  { name: 'productId', type: 'select' },
  { name: 'unitPrice', type: 'number' },
  { name: 'currencyCode', type: 'select' },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function PriceBookEntryCreateDialog({ open, onOpenChange, onSuccess }: Props) {
  const navigate = useNavigate();
  const { pricebookId } = useParams<{ pricebookId: string }>();
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productService.getAll({ limit: 500, page: 1 });
      setProducts((res?.data ?? []).map((p: any) => ({ id: p.id, name: p.name })));
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) fetchProducts();
  }, [open, fetchProducts]);

  const form = useForm<z.infer<typeof PriceBookEntryFormSchema>>({
    resolver: zodResolver(PriceBookEntryFormSchema) as Resolver<
      z.infer<typeof PriceBookEntryFormSchema>
    >,
    defaultValues: {
      priceBookId: pricebookId ?? '',
    },
  });

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting },
  } = form;

  useEffect(() => {
    if (pricebookId) setValue('priceBookId', pricebookId);
  }, [pricebookId, setValue]);
  useEffect(() => {
    if (!open) {
      reset();
      setError(null);
    }
  }, [open, reset]);

  const currencyOptions = useMemo(() => {
    const raw = pricelistEntryConstraints.selectOptions.currency ?? [];
    return raw.map((c: any) => ({
      label: c.name ?? c.key ?? c,
      value: c.key ?? c,
    }));
  }, []);

  const onSubmit = async (data: z.infer<typeof PriceBookEntryFormSchema>) => {
    setError(null);
    const { priceBookId, ...payload } = data;
    if (!priceBookId) return setError('Price book ID is missing.');

    const promise = pricebookService
      .createPriceBookEntry(priceBookId, payload)
      .then((res) => {
        if (!res?.data?.id) throw new Error(res.message || 'Failed');
        reset();
        onOpenChange(false);
        onSuccess?.();
        navigate(`/apps/sales/pricebooks/${priceBookId}`);
        return { message: res.message || 'Entry created' };
      })
      .catch((err) => {
        const msg = err.response?.data?.message || err.message || 'Failed';
        setError(msg);
        throw new Error(msg);
      });

    toast.promise(promise, {
      loading: 'Creating...',
      success: (d) => d.message,
      error: (e) => e.message,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Price Book Entry</DialogTitle>
          <DialogDescription>Fill in the details to add a new entry.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
            <input type="hidden" {...form.register('priceBookId')} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map((field) => (
                <FormField
                  key={field.name}
                  control={control}
                  name={field.name}
                  render={({ field: f }) => (
                    <FormItem className="space-y-2">
                      <Label htmlFor={field.name}>
                        {field.name === 'productId' ? 'Product' : getLabel(field.name)}
                      </Label>
                      {field.type === 'select' ? (
                        <FormControl>
                          <Select
                            onValueChange={f.onChange}
                            value={f.value?.toString()}
                            disabled={loading}
                          >
                            <SelectTrigger className="w-full cursor-pointer">
                              <SelectValue
                                placeholder={
                                  loading
                                    ? 'Loading...'
                                    : field.name === 'productId'
                                      ? 'Select product'
                                      : field.name === 'currencyCode'
                                        ? 'Select currency'
                                        : undefined
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {field.name === 'productId' ? (
                                products.length === 0 && !loading ? (
                                  <div className="px-2 py-1 text-sm text-muted-foreground">
                                    No products
                                  </div>
                                ) : (
                                  products.map((p) => (
                                    <SelectItem className="cursor-pointer" key={p.id} value={p.id}>
                                      {p.name}
                                    </SelectItem>
                                  ))
                                )
                              ) : field.name === 'currencyCode' ? (
                                currencyOptions.length === 0 ? (
                                  <div className="px-2 py-1 text-sm text-muted-foreground">
                                    No currencies
                                  </div>
                                ) : (
                                  currencyOptions.map((c) => (
                                    <SelectItem
                                      className="cursor-pointer"
                                      key={c.value}
                                      value={c.value}
                                    >
                                      {c.label}
                                    </SelectItem>
                                  ))
                                )
                              ) : null}
                            </SelectContent>
                          </Select>
                        </FormControl>
                      ) : (
                        <FormControl>
                          <Input
                            id={field.name}
                            type={field.type}
                            step={field.type === 'number' ? '0.01' : undefined}
                            placeholder={getPlaceholder(field.name)}
                            {...f}
                            value={f.value?.toString() ?? ''}
                            className="w-full"
                          />
                        </FormControl>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            {error && <div className="text-red-500 text-sm text-center">{error}</div>}

            <DialogFooter className="flex gap-2 sm:justify-between">
              <DialogClose asChild>
                <Button
                  className="cursor-pointer"
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button className="cursor-pointer" type="submit" disabled={isSubmitting}>
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Creating...' : 'Save Entry'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

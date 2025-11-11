'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Save, Loader2 } from 'lucide-react';
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import pricebookService from '@/utils/services/pricebook';
import productService from '@/utils/services/Products';
import type { PriceBookEntry, UpdatePriceBookEntryDto } from '../utils';
import { PriceBookEntrySchema, UpdatePriceBookEntrySchema } from '../utils';
import { toast } from '@/components/ui/sonner';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { formatFieldName } from '@/utils';
import { pricelistEntryConstraints } from '@/utils/constraints';

type FormValues = Partial<UpdatePriceBookEntryDto>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  entryId: string;
}

type FieldConfig = { name: keyof UpdatePriceBookEntryDto; type: 'text' | 'number' | 'select' };
const fields: FieldConfig[] = [
  { name: 'productId', type: 'select' },
  { name: 'unitPrice', type: 'number' },
  { name: 'currencyCode', type: 'select' },
];

export default function PriceBookEntryEditDialog({
  open,
  onOpenChange,
  onSuccess,
  entryId,
}: Props) {
  const [entry, setEntry] = useState<PriceBookEntry | null>(null);
  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(UpdatePriceBookEntrySchema) as Resolver,
  });

  const currencyOptions = useMemo(() => {
    const raw = pricelistEntryConstraints.selectOptions.currency ?? [];
    return raw.map((c: any) => ({
      label: c.name ?? c.key ?? c,
      value: c.key ?? c,
    }));
  }, []);

  const fetchEntry = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await pricebookService.getPriceBookEntryById(entryId);
      const parsed = PriceBookEntrySchema.parse(res.data);
      setEntry(parsed);
      form.reset({
        productId: parsed.productId,
        unitPrice: parsed.unitPrice ?? undefined,
        currencyCode: parsed.currencyCode ?? '',
      });
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || 'Failed to load entry');
    } finally {
      setLoading(false);
    }
  }, [entryId, form]);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await productService.getAll({ limit: 500, page: 1 });
      setProducts((res?.data ?? []).map((p: any) => ({ id: p.id, name: p.name })));
    } catch {
      toast.error('Failed to load products');
    }
  }, []);

  useEffect(() => {
    if (open && entryId) {
      fetchEntry();
      fetchProducts();
    } else {
      setEntry(null);
      form.reset();
      setError(null);
      setLoading(false);
    }
  }, [open, entryId, fetchEntry, fetchProducts, form]);

  const onSubmit = async (values: FormValues) => {
    if (saving || !entry) return;
    setError(null);
    setSaving(true);

    const payload: UpdatePriceBookEntryDto = {};

    for (const key of Object.keys(values) as (keyof UpdatePriceBookEntryDto)[]) {
      const formValue = values[key];
      const originalValue = entry[key as keyof PriceBookEntry];

      if (formValue !== originalValue) {
        payload[key] = formValue as any;
      }
    }

    if (Object.keys(payload).length === 0) {
      toast.info('No changes to save');
      onOpenChange(true);
      setSaving(false);
      return;
    }

    let validated: UpdatePriceBookEntryDto;
    try {
      validated = UpdatePriceBookEntrySchema.partial().parse(payload);
    } catch (e: any) {
      setError(e.errors?.[0]?.message || 'Validation failed');
      setSaving(false);
      return;
    }

    const promise = pricebookService
      .updatePriceBookEntry(entry.id, validated)
      .then((res) => {
        if (!res?.data?.id && res.statusCode !== 200 && res.statusCode !== 204) {
          throw new Error(res.message || 'Update failed');
        }
        onOpenChange(false);
        onSuccess?.();
        return { message: 'Entry updated successfully' };
      })
      .catch((err) => {
        const msg = err.response?.data?.message || err.message || 'Update failed';
        setError(msg);
        throw new Error(msg);
      })
      .finally(() => setSaving(false));

    toast.promise(promise, {
      loading: 'Saving...',
      success: (d) => d.message,
      error: (e) => e.message,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Price Book Entry</DialogTitle>
          <DialogDescription>Update entry details below.</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-8">{error}</div>
        ) : entry ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields.map((field) => (
                  <FormField
                    key={field.name}
                    control={form.control}
                    name={field.name}
                    render={({ field: f }) => (
                      <FormItem className="space-y-2">
                        <FormLabel htmlFor={field.name}>
                          {field.name === 'productId' ? 'Product' : formatFieldName(field.name)}
                        </FormLabel>

                        {field.type === 'select' ? (
                          <FormControl>
                            <Select
                              onValueChange={f.onChange}
                              value={f.value?.toString() ?? ''}
                              disabled={saving || loading}
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
                                      <SelectItem
                                        className="cursor-pointer"
                                        key={p.id}
                                        value={p.id}
                                      >
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
                              placeholder={
                                field.name === 'currencyCode'
                                  ? 'e.g. USD'
                                  : field.name === 'unitPrice'
                                    ? 'e.g. 99.99'
                                    : undefined
                              }
                              {...f}
                              value={f.value ?? ''}
                              className="w-full"
                              onChange={(e) => {
                                const raw = e.target.value;
                                if (field.name === 'unitPrice') {
                                  const num = raw === '' ? undefined : Number(raw);
                                  f.onChange(num);
                                } else if (field.name === 'currencyCode') {
                                  f.onChange(raw.toUpperCase());
                                } else {
                                  f.onChange(raw);
                                }
                              }}
                              disabled={saving}
                            />
                          </FormControl>
                        )}

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center p-4 bg-red-50 rounded">
                  {error}
                </div>
              )}

              <DialogFooter className="flex gap-2 sm:justify-between">
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={saving}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

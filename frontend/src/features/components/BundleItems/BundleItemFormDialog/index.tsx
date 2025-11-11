import React from 'react';
import { useForm, Controller } from 'react-hook-form';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { bundleItemSchema, type BundleItem } from '@/features/components/BundleItems/utils';
import productService from '@/utils/services/Products';
import bundleItemsService from '@/utils/services/BundleItems';
import { toast } from '@/components/ui/sonner';
import '@/index.css';
import { formatFieldName } from '@/utils';

type FormValues = BundleItem;

const getLabel = (fieldName: keyof FormValues, isEditMode: boolean) => {
  const label = formatFieldName(fieldName);
  const requiredFields: (keyof FormValues)[] = ['productId', 'quantity', 'pricingMode'];
  return requiredFields.includes(fieldName) && !isEditMode ? `${label} *` : label;
};
interface BundleItemFormDialogProps {
  onSuccess: () => void;
  bundleId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bundleItem?: BundleItem;
}

const BundleItemFormDialog: React.FC<BundleItemFormDialogProps> = ({
  onSuccess,
  bundleId,
  open,
  onOpenChange,
  bundleItem,
}) => {
  const [products, setProducts] = React.useState<any[]>([]);
  const isEditMode = !!bundleItem;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(bundleItemSchema),
    defaultValues: {},
  });

  React.useEffect(() => {
    if (!open) {
      reset();
      return;
    }

    if (open && bundleItem) {
      reset(bundleItem as any);
    }
  }, [open, bundleItem, reset]);

  React.useEffect(() => {
    if (open) {
      productService.getAll({ limit: 100, page: 1 }).then((res) => {
        setProducts(res.data);
      });
    }
  }, [open]);

  const onSubmit = async (data: BundleItem) => {
    if (!bundleId) return;

    let payload: Partial<BundleItem> = {};

    if (bundleItem) {
      for (const key in data) {
        if (Object.hasOwn(data, key)) {
          const typedKey = key as keyof BundleItem;
          if (String(data[typedKey]) !== String(bundleItem[typedKey])) {
            payload[typedKey] = data[typedKey] as any;
          }
        }
      }
    } else {
      for (const key in data) {
        if (Object.hasOwn(data, key)) {
          const typedKey = key as keyof BundleItem;
          const value = data[typedKey];
          if (
            value !== undefined &&
            value !== null &&
            !(typeof value === 'string' && value.trim() === '')
          ) {
            payload[typedKey] = value as any;
          }
        }
      }
    }

    const promise = bundleItem
      ? bundleItemsService.update(bundleItem.id!, payload)
      : bundleItemsService.create(bundleId, payload);
    toast.promise(
      promise
        .then((res) => {
          onSuccess();
          onOpenChange(false);
          reset();
          return res;
        })
        .catch((error: any) => {
          throw new Error(
            error?.message || `Failed to ${bundleItem ? 'update' : 'create'} bundle item.`,
          );
        }),
      {
        loading: `${bundleItem ? 'Updating' : 'Creating'} bundle item...`,
        // Show backend-provided message only
        success: (data) => data?.message,
        error: (err) => err.message,
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{bundleItem ? 'Edit Bundle Item' : 'Add Bundle Item'}</DialogTitle>
          <DialogDescription>
            {bundleItem ? 'Edit an existing item in the bundle.' : 'Add a new item to the bundle.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="productId">{getLabel('productId', isEditMode)}</Label>
            <Controller
              name="productId"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(products) &&
                      products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.productId && (
              <p className="text-red-500 text-sm mt-1">{errors.productId.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="quantity">{getLabel('quantity', isEditMode)}</Label>
            <Controller
              name="quantity"
              control={control}
              render={({ field }) => <Input id="quantity" type="number" {...field} />}
            />
            {errors.quantity && (
              <p className="text-red-500 text-sm mt-1">{errors.quantity.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="pricingMode">Pricing Mode</Label>
            <Controller
              name="pricingMode"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value ?? ''}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a pricing mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INHERIT">Inherit</SelectItem>
                    <SelectItem value="OVERRIDE">Override</SelectItem>
                    <SelectItem value="INCLUDED">Included</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.pricingMode && (
              <p className="text-red-500 text-sm mt-1">{errors.pricingMode.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="overridePrice">Override Price</Label>
            <Controller
              name="overridePrice"
              control={control}
              render={({ field }) => (
                <Input id="overridePrice" type="number" {...field} value={field.value ?? ''} />
              )}
            />
            {errors.overridePrice && (
              <p className="text-red-500 text-sm mt-1">{errors.overridePrice.message}</p>
            )}
          </div>

          <DialogFooter className="col-span-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BundleItemFormDialog;

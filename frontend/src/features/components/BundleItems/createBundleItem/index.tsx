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

const getLabel = (fieldName: keyof FormValues) => {
  const label = formatFieldName(fieldName);
  const requiredFields: (keyof FormValues)[] = ['productId', 'quantity'];
  return requiredFields.includes(fieldName) ? `${label} *` : label;
};

interface CreateBundleItemProps {
  onSuccess: () => void;
  bundleId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateBundleItem: React.FC<CreateBundleItemProps> = ({
  onSuccess,
  bundleId,
  open,
  onOpenChange,
}) => {
  const [products, setProducts] = React.useState<any[]>([]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(bundleItemSchema),
  });

  React.useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  React.useEffect(() => {
    if (open) {
      productService.getAll({ limit: 100, page: 1 }).then((res) => {
        setProducts(res.data);
      });
    }
  }, [open]);

  const onSubmit = async (data: BundleItem) => {
    if (!bundleId) return;
    toast.promise(
      bundleItemsService
        .create(bundleId, data)
        .then((res) => {
          onSuccess();
          onOpenChange(false);
          reset();
          return res;
        })
        .catch((error: any) => {
          throw new Error(error?.message || 'Failed to create bundle item.');
        }),
      {
        loading: 'Creating bundle item...',
        success: (data) => data?.message,
        error: (err) => err.message,
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Bundle Item</DialogTitle>
          <DialogDescription>Add a new item to the bundle.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 gap-4">
            <Label htmlFor="productId" className="text-right">
              {getLabel('productId')}
            </Label>
            <div className="col-span-3">
              <div className="flex flex-col gap-1">
                <Controller
                  name="productId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
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
            </div>
          </div>

          {/* Quantity */}
          <div className="grid grid-cols-4 gap-4">
            <Label htmlFor="quantity" className="text-right">
              {getLabel('quantity')}
            </Label>
            <div className="col-span-3">
              <div className="flex flex-col gap-1">
                <Controller
                  name="quantity"
                  control={control}
                  render={({ field }) => <Input id="quantity" type="number" {...field} />}
                />
                {errors.quantity && (
                  <p className="text-red-500 text-sm mt-1">{errors.quantity.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <Label htmlFor="pricingMode" className="text-right">
              Pricing Mode
            </Label>
            <div className="col-span-3">
              <div className="flex flex-col gap-1">
                <Controller
                  name="pricingMode"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value ?? ''}>
                      <SelectTrigger>
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
            </div>
          </div>

          {/* Override Price */}
          <div className="grid grid-cols-4 gap-4">
            <Label htmlFor="overridePrice" className="text-right">
              Override Price
            </Label>
            <div className="col-span-3">
              <div className="flex flex-col gap-1">
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
            </div>
          </div>

          {/* Is Required */}
          <div className="grid grid-cols-4 gap-4">
            <Label htmlFor="isRequired" className="text-right">
              Is Required
            </Label>
            <div className="col-span-3">
              <div className="flex flex-col gap-1">
                <Controller
                  name="isRequired"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={(value) => field.onChange(value === 'true')}
                      value={field.value?.toString() ?? ''}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select if required" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">True</SelectItem>
                        <SelectItem value="false">False</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.isRequired && (
                  <p className="text-red-500 text-sm mt-1">{errors.isRequired.message}</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
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

export default CreateBundleItem;

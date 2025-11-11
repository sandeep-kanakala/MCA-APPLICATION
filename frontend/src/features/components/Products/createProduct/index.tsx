import { useNavigate } from 'react-router-dom';

import EntityFormComponent from '../../EntityFormComponent';
import productService from '@/utils/services/Products';

import { z } from 'zod';
import { PRODUCT_FIELDS, productSchema } from '@/features/components/Products/utils';

export const createProductSchema = productSchema.pick({
  name: true,
  type: true,
  sku: true,
  description: true,
  family: true,
  unitPrice: true,
  currencyCode: true,
  defaultBillingPeriod: true,
  defaultTermMonths: true,
  specification: true,
});

type CreateProductDto = z.infer<typeof createProductSchema>;

export default function ProductCreate({ onProductCreated }: { onProductCreated?: () => void }) {
  const navigate = useNavigate();

  const handleSubmit = async (data: CreateProductDto) => {
    const { specification, ...rest } = data;
    const payload = {
      ...rest,
      isBundle: specification === 'Simple' ? false : specification === 'Bundle' ? true : undefined,
    };

    const filteredPayload = Object.fromEntries(
      Object.entries(payload).filter(([_, v]) => v !== undefined && v !== null && v !== ''),
    );

    const response = await productService.create(filteredPayload as any);

    return response;
  };

  const handleSuccess = () => {
    onProductCreated?.();
    navigate('/apps/sales/products');
  };

  return (
    <EntityFormComponent
      mode="create"
      entityName="Product"
      schema={createProductSchema}
      fields={PRODUCT_FIELDS as any}
      backPath="/apps/sales/products"
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      excludeFields={['id', 'isTaxable', 'isBundle', 'bundlesAsParent', 'createdAt', 'updatedAt']}
    />
  );
}

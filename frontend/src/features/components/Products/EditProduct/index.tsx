import { useNavigate, useParams } from 'react-router-dom';
import { useCallback, useState } from 'react';
import { toast } from '@/components/ui/sonner';

import {
  PRODUCT_FIELDS,
  productSchema,
  type Product,
} from '@/features/components/Products/utils';
import productService from '@/utils/services/Products';
import { formatFieldName } from '@/utils';
import EntityFormComponent from '../../EntityFormComponent';

export default function ProductEditForm() {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  const [originalData, setOriginalData] = useState<Product | null>(null);

  const backPath = productId ? `/apps/sales/products/${productId}` : '/apps/sales/products';

  const fetchProductData = useCallback(async () => {
    if (!productId) throw new Error('Product ID is required');
    const data = await productService.getById(productId);

    const parsed = productSchema.safeParse(data);
    if (!parsed.success) {
      const errorDetails = parsed.error.issues
        .map((issue) => `${formatFieldName(issue.path[0] as string)}: ${issue.message}`)
        .join('; ');
      throw new Error('Fetched product data invalid: ' + errorDetails);
    }

    setOriginalData(parsed.data);
    return parsed.data;
  }, [productId]);

  const getModifiedFields = (newData: any, oldData: any) => {
    const modified: Record<string, any> = {};
    Object.keys(newData).forEach((key) => {
      // Normalize numbers
      const newVal =
        typeof newData[key] === 'string' && !isNaN(Number(newData[key]))
          ? Number(newData[key])
          : newData[key];
      const oldVal =
        typeof oldData[key] === 'string' && !isNaN(Number(oldData[key]))
          ? Number(oldData[key])
          : oldData[key];

      if (newVal !== oldVal) {
        modified[key] = newVal;
      }
    });
    return modified;
  };

  const handleSubmit = async (data: any) => {
    if (!productId) throw new Error('Product ID is required');
    if (!originalData) throw new Error('Original product data not loaded yet');

    const modifiedData = getModifiedFields(data, originalData);

    if (Object.keys(modifiedData).length === 0) {
      toast.info('No changes detected to save.');
      return null;
    }

    const response = await productService.update(productId, modifiedData);
    return response;
  };

  const handleSuccess = () => {
    navigate(backPath);
  };

  return (
    <EntityFormComponent
      mode="edit"
      entityName="Product"
      schema={productSchema}
      fields={PRODUCT_FIELDS as any}
      backPath={backPath}
      fetchInitialData={fetchProductData}
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      excludeFields={['id', 'createdAt', 'updatedAt']}
    />
  );
}

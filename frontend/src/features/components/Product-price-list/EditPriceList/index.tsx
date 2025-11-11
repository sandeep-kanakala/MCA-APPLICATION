import { useNavigate, useParams } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import priceListService from '@/utils/services/product-pricelist';
import EntityFormComponent from '../../EntityFormComponent';
import { PRICELIST_FIELDS, priceListSchema } from '../utils';
import { useCallback, useState } from 'react';
import { useAccountOptions } from '@/app/useFormOptions';

export default function PriceListEdit({ onPriceListUpdated }: { onPriceListUpdated?: () => void }) {
  const navigate = useNavigate();
  const { options: accountOptions, loading: accountsLoading } = useAccountOptions();
  const { pricelistId } = useParams<{ pricelistId: string }>();
  const [originalData, setOriginalData] = useState<any>(null);

  const fetchPriceListData = useCallback(async () => {
    if (!pricelistId) throw new Error('Price list ID is required');
    const data = await priceListService.getById(pricelistId);
    setOriginalData(data);
    return data;
  }, [pricelistId]);

  const getModifiedFields = (newData: any, oldData: any) => {
    const modified: Record<string, any> = {};
    Object.keys(newData).forEach((key) => {
      if (newData[key] !== oldData[key]) {
        modified[key] = newData[key];
      }
    });
    return modified;
  };
  const handleSubmit = async (data: any) => {
    if (!pricelistId) throw new Error('Price list ID is required');
    if (!originalData) throw new Error('Original data not loaded yet');

    const modifiedData = getModifiedFields(data, originalData);

    if (Object.keys(modifiedData).length === 0) {
      toast.info('No changes detected.');
      return null;
    }
    const response = await priceListService.update(pricelistId, modifiedData);
    return response;
  };

  const handleSuccess = () => {
    onPriceListUpdated?.();
    navigate('/apps/sales/pricelist');
  };

  return (
    <EntityFormComponent
      mode="edit"
      entityName="Price List"
      schema={priceListSchema}
      fields={PRICELIST_FIELDS}
      fetchInitialData={fetchPriceListData}
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      backPath="/apps/sales/pricelist"
      fieldOptions={{ accountId: accountOptions }}
      loadingFields={accountsLoading ? ['accountId'] : []}
      excludeFields={['id']}
    />
  );
}

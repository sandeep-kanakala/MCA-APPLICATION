import { useNavigate } from 'react-router-dom';

import priceListService from '@/utils/services/product-pricelist';
import EntityFormComponent from '../../EntityFormComponent';
import { PRICELIST_FIELDS, priceListSchema } from '../utils';
import { useAccountOptions } from '@/app/useFormOptions';

export default function PriceListCreate({
  onPriceListCreated,
}: {
  onPriceListCreated?: () => void;
}) {
  const navigate = useNavigate();
  const { options: accountOptions, loading: accountsLoading } = useAccountOptions();
  const handleSubmit = async (data: any) => {
    const response = await priceListService.create(data);
    return response;
  };

  const handleSuccess = () => {
    onPriceListCreated?.();
    navigate('/apps/sales/pricelist');
  };

  return (
    <EntityFormComponent
      mode="create"
      entityName="Price List"
      schema={priceListSchema}
      fields={PRICELIST_FIELDS}
      backPath="/apps/sales/pricelist"
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      excludeFields={['id']}
      fieldOptions={{ accountId: accountOptions }}
      loadingFields={accountsLoading ? ['accountId'] : []}
    />
  );
}

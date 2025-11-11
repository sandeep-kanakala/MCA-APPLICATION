import { useNavigate } from 'react-router-dom';
import { CreatePriceBookSchema, PRICEBOOK_FIELDS } from '../utils';
import pricebookService from '@/utils/services/pricebook';
import EntityFormComponent from '../../EntityFormComponent';

export default function PriceBookCreate({
  onPriceBookCreated,
}: {
  onPriceBookCreated?: () => void;
}) {
  const navigate = useNavigate();

  const handleSubmit = async (data: any) => {
    const payload = {
      name: data.name,
      description: data.description || undefined,
      type: data.type,
      isActive: data.isActive ?? false,
    };
    const response = await pricebookService.createPriceBook(payload);
    return response;
  };

  const handleSuccess = () => {
    onPriceBookCreated?.();
    navigate('/apps/sales/pricebookS');
  };

  return (
    <EntityFormComponent
      mode="create"
      entityName="Price Book"
      schema={CreatePriceBookSchema}
      fields={PRICEBOOK_FIELDS as any}
      backPath="/apps/sales/pricebook"
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      excludeFields={['id']}
    />
  );
}

import { useNavigate, useParams } from 'react-router-dom';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import EntityFormComponent from '../../EntityFormComponent';
import pricebookService from '@/utils/services/pricebook';
import {
  PRICEBOOK_FIELDS,
  PriceBookSchema,
  UpdatePriceBookSchema,
  type PriceBook,
  type UpdatePriceBookDto,
} from '../utils';

export default function PriceBookEdit() {
  const navigate = useNavigate();
  const { pricebookId } = useParams<{ pricebookId: string }>();
  const [originalData, setOriginalData] = useState<PriceBook | null>(null);

  const fetchPriceBookData = useCallback(async () => {
    if (!pricebookId) throw new Error('PriceBook ID is required');

    const response = await pricebookService.getPriceBookById(pricebookId);
    const parsed = PriceBookSchema.safeParse(response.data);

    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
      toast.error('Invalid data received: ' + errors);
      return null;
    }

    setOriginalData(parsed.data);
    return parsed.data;
  }, [pricebookId]);

  const getModifiedFields = (newData: any, oldData: any) => {
    const modified: Record<string, any> = {};
    Object.keys(newData).forEach((key) => {
      if (newData[key] !== oldData[key]) {
        modified[key] = newData[key];
      }
    });
    return modified;
  };

  const handleSubmit = async (data: UpdatePriceBookDto) => {
    if (!pricebookId) throw new Error('PriceBook ID is required');
    if (!originalData) throw new Error('Original data not loaded yet');

    const modifiedData = getModifiedFields(data, originalData);

    if (Object.keys(modifiedData).length === 0) {
      toast.info('No changes detected to save.');
      return null;
    }

    const parsed = UpdatePriceBookSchema.safeParse(modifiedData);
    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
      throw new Error('Validation failed: ' + errors);
    }

    const response = await pricebookService.updatePriceBook(pricebookId, modifiedData);
    return response;
  };

  const handleSuccess = () => {
    navigate(`/apps/sales/pricebooks/${pricebookId}`);
  };

  return (
    <EntityFormComponent
      mode="edit"
      entityName="Price Book"
      schema={UpdatePriceBookSchema}
      fields={PRICEBOOK_FIELDS as any}
      backPath={`/apps/sales/pricebook/${pricebookId}`}
      fetchInitialData={fetchPriceBookData}
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      excludeFields={['id', 'entries', 'createdAt', 'updatedAt', 'tenantId']}
    />
  );
}

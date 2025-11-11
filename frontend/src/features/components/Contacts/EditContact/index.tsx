import { useNavigate, useParams } from 'react-router-dom';
import { useCallback, useState } from 'react';
import { contactSchema, CONTACT_FIELDS } from '@/features/components/Contacts/utils';
import contactService from '@/utils/services/contacts';
import EntityFormComponent from '../../EntityFormComponent';
import { toast } from 'sonner';
import { useAccountOptions } from '@/app/useFormOptions';

export default function ContactEdit() {
  const navigate = useNavigate();
  const { contactId } = useParams<{ contactId: string }>();
  const [originalData, setOriginalData] = useState<any>(null);
  const { options: accountOptions, loading: accountsLoading } = useAccountOptions();
  const fetchContactData = useCallback(async () => {
    if (!contactId) throw new Error('Contact ID is required');
    const data = await contactService.getById(contactId);
    setOriginalData(data);
    return data;
  }, [contactId]);

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
    if (!contactId) throw new Error('Contact ID is required');
    if (!originalData) throw new Error('Original data not loaded yet');

    const modifiedData = getModifiedFields(data, originalData);

    if (Object.keys(modifiedData).length === 0) {
      toast.info('No changes detected to save.');
      return null;
    } else {
      const response = await contactService.update(contactId, modifiedData);
      return response;
    }
  };

  const handleSuccess = () => {
    navigate(`/apps/sales/contacts/${contactId}`);
  };

  return (
    <EntityFormComponent
      mode="edit"
      entityName="Contact"
      schema={contactSchema}
      fields={CONTACT_FIELDS}
      backPath={`/apps/sales/contacts/${contactId}`}
      fetchInitialData={fetchContactData}
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      excludeFields={['id']}
      fieldOptions={{ accountId: accountOptions }}
      loadingFields={accountsLoading ? ['accountId'] : []}
    />
  );
}

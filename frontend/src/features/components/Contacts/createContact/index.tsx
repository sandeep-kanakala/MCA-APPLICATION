import { useNavigate } from 'react-router-dom';
import { CONTACT_FIELDS, contactSchema } from '@/features/components/Contacts/utils';
import contactService from '@/utils/services/contacts';

import EntityFormComponent from '../../EntityFormComponent';
import { useAccountOptions } from '@/app/useFormOptions';

export default function ContactCreate({ onContactCreated }: { onContactCreated?: () => void }) {
  const navigate = useNavigate();
  const { options: accountOptions, loading: accountsLoading } = useAccountOptions();

  const handleSubmit = async (data: any) => {
    const response = await contactService.create(data);
    return response;
  };

  const handleSuccess = () => {
    onContactCreated?.();
    navigate('/apps/sales/contacts');
  };

  return (
    <EntityFormComponent
      mode="create"
      entityName="Contact"
      schema={contactSchema}
      fields={CONTACT_FIELDS}
      backPath="/apps/sales/contacts"
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      excludeFields={['id']}
      fieldOptions={{ accountId: accountOptions }}
      loadingFields={accountsLoading ? ['accountId'] : []}
    />
  );
}

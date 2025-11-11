import RelatedEntityTable from '@/features/components/EntitiesView/RelatedEntityTable';
import contactService from '@/utils/services/contacts';
import { useNavigate } from 'react-router-dom';

export default function RelatedDetails() {
  const navigate = useNavigate();
  return (
    <RelatedEntityTable
      parentIdKey="accountId"
      service={{
        getAllByParentId: (id, params: any) => contactService.getAllContactsByAccountId(id, params),
      }}
      schemaKeys={['firstName', 'email', 'phone']}
      navigateBasePath="/apps/sales/contacts"
      emptyMessage="No related contacts found for this account."
      onAddClick={() => navigate('/apps/sales/contacts/create')}
    />
  );
}

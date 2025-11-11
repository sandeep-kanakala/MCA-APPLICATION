import { useNavigate } from 'react-router-dom';
import { ACCOUNT_FIELDS, accountSchema } from '@/features/components/Accounts/utils/index';
import accountService from '@/utils/services/accounts';
import EntityFormComponent from '../../EntityFormComponent';

export default function AccountCreate({ onAccountCreated }: { onAccountCreated?: () => void }) {
  const navigate = useNavigate();

  const handleSubmit = async (data: any) => {
    const response = await accountService.create(data);

    return response;
  };

  const handleSuccess = () => {
    onAccountCreated?.();
    navigate('/apps/sales/accounts');
  };

  return (
    <EntityFormComponent
      mode="create"
      entityName="Account"
      schema={accountSchema}
      fields={ACCOUNT_FIELDS}
      backPath="/apps/sales/accounts"
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      excludeFields={['id']}
    />
  );
}

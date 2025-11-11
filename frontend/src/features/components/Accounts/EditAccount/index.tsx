import { useNavigate, useParams } from 'react-router-dom';
import { useCallback, useState } from 'react';
import { ACCOUNT_FIELDS, accountSchema } from '@/features/components/Accounts/utils/index';
import accountService from '@/utils/services/accounts';
import EntityFormComponent from '../../EntityFormComponent';
import { toast } from 'sonner';

export default function AccountEdit() {
  const navigate = useNavigate();
  const { accountId } = useParams<{ accountId: string }>();
  const [originalData, setOriginalData] = useState<any>(null);

  const fetchAccountData = useCallback(async () => {
    if (!accountId) throw new Error('Account ID is required');
    const data = await accountService.getById(accountId);
    setOriginalData(data);
    return data;
  }, [accountId]);

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
    if (!accountId) throw new Error('Account ID is required');
    if (!originalData) throw new Error('Original data not loaded yet');

    const modifiedData = getModifiedFields(data, originalData);

    if (Object.keys(modifiedData).length === 0) {
      toast.info('No changes detected to save.');
      return null;
    } else {
      const response = await accountService.update(accountId, modifiedData);
      return response;
    }
  };

  const handleSuccess = () => {
    navigate(`/apps/sales/accounts/${accountId}`);
  };

  return (
    <EntityFormComponent
      mode="edit"
      entityName="Account"
      schema={accountSchema}
      fields={ACCOUNT_FIELDS}
      backPath={`/apps/sales/accounts/${accountId}`}
      fetchInitialData={fetchAccountData}
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      excludeFields={['id']}
    />
  );
}

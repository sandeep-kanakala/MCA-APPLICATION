import accountService from '@/utils/services/accounts';
import EntityDetailView from '../../EntitiesView/DetailView';
import { accountSchema } from '../utils';
import RelatedDetails from '../AccountDetails/RelatedDetails/index';
export default function AccountDetailPage() {
  return (
    <EntityDetailView
      entityType="account"
      schema={accountSchema as any}
      service={accountService}
      labelField="name"
      topFields={['type', 'industry', 'phone']}
      isActivity={true}
      hiddenFields={['id', 'createdAt', 'updatedAt']}
      RelatedDetails={RelatedDetails}
    />
  );
}

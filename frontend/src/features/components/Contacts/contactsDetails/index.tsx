import EntityDetailView from '../../EntitiesView/DetailView';
import { contactSchema } from '../utils';
import contactService from '@/utils/services/contacts';

export default function ContactDetailPage() {
  return (
    <EntityDetailView
      entityType="contact"
      schema={contactSchema as any}
      service={contactService}
      labelField="firstName"
      topFields={['accountId', 'phone', 'email']}
      isActivity={true}
    />
  );
}

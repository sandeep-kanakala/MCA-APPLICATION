import orderService from '@/utils/services/Orders';
import EntityDetailView from '@/features/components/EntitiesView/DetailView';
import { orderSchema } from '../utils';

export default function OrderDetailPage() {
  return (
    <EntityDetailView
      entityType="order"
      schema={orderSchema as any}
      service={{ getById: orderService.getById }}
      topFields={['status', 'totalAmount', 'currencyCode', 'orderedAt']}
      isActivity={true}
      hideName={true}
    />
  );
}

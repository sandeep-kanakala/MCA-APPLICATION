import EntityDetailView from '../../EntitiesView/DetailView';
import pricebookService from '@/utils/services/pricebook';
import { PriceBookSchema } from '../utils';
import PriceBookRelatedDetails from '@/features/components/PriceBooks/pricebook-details/Related Details';

const priceBookServiceWrapper = {
  getById: pricebookService.getPriceBookById,
  update: pricebookService.updatePriceBook,

  delete: pricebookService.deletePriceBook,
};

export default function PriceBookDetailPage() {
  return (
    <EntityDetailView
      entityType="pricebook"
      schema={PriceBookSchema.omit({ tenantId: true, isActive: true })}
      service={priceBookServiceWrapper}
      labelField="name"
      topFields={['type', 'description']}
      isActivity={true}
      noneditableFields={['createdBy', 'updateBy', 'createdAt', 'updatedAt']}
      hiddenFields={['entries']}
      RelatedDetails={PriceBookRelatedDetails}
    />
  );
}

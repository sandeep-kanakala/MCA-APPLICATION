import productService from '@/utils/services/Products';
import EntityDetailView from '@/features/components/EntitiesView/DetailView';
import { productSchema } from '@/features/components/Products/utils';
import ProductDetailsRelated from '@/features/components/Products/Product-Details/RelatedDetails/index';

export default function ProductDetailPage() {
  return (
    <EntityDetailView
      entityType="product"
      schema={productSchema as any}
      service={productService}
      labelField="name"
      topFields={['type', 'unitPrice', 'specification']}
      hiddenFields={[
        'createdAt',
        'updatedAt',
        'id',
        'bundlesAsParent',
        'isTaxable',
        'isBundle',
        'isArchived',
      ]}
      isActivity={true}
      RelatedDetails={ProductDetailsRelated}
    />
  );
}

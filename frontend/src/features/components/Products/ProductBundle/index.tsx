import EntityDetailView from '@/features/components/EntitiesView/DetailView';
import productService from '@/utils/services/Products';
import { productBundleSchema } from '@/features/components/Products/utils';
import ProductBundleRelatedItems from '@/features/components/Products/ProductBundle/RelatedProductBundle';
import React from 'react';

export default function ProductBundleDetailPage() {
  return (
    <EntityDetailView
      entityType="productBundle"
      schema={productBundleSchema as any}
      service={{
        getById: productService.getBundleById,
        update: productService.update,
        delete: productService.delete,
      }}
      labelField="name"
      topFields={['name', 'description']}
      isActivity={true}
      hiddenFields={[
        'createdAt',
        'updatedAt',
        'createdBy',
        'updatedBy',
        'bundleItems',
        'id',
        'tenantId',
        'parentProductId',
        'isArchived',
        'archivedAt',
      ]}
      RelatedDetails={(props) => {
        const { product: entity } = props;
        const [bundleItems, setBundleItems] = React.useState<any[]>(entity?.bundleItems || []);

        React.useEffect(() => {
          setBundleItems(entity?.bundleItems || []);
        }, [entity]);

        const refetch = async () => {
          if (!entity?.id) return;
          try {
            const fresh = await productService.getBundleById(entity.id);
            setBundleItems(fresh.bundleItems || []);
          } catch (err) {
            console.error('Refetch failed', err);
          }
        };

        if (!entity) return null;

        return (
          <ProductBundleRelatedItems
            bundleId={entity.id}
            bundleItems={bundleItems}
            refetch={refetch}
          />
        );
      }}
    />
  );
}

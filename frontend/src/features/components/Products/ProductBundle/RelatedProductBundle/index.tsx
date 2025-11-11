import React from 'react';
import BundleItemFormDialog from '@/features/components/BundleItems/BundleItemFormDialog';
import RelatedEntityTable from '@/features/components/EntitiesView/RelatedEntityTable';
import productService from '@/utils/services/Products';

interface ProductBundleRelatedItemsProps {
  bundleId: string;
  bundleItems: any[];
  refetch: () => void;
}

const ProductBundleRelatedItems: React.FC<ProductBundleRelatedItemsProps> = ({
  bundleId,
  refetch,
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

  const bundleItemService = {
    getAllByParentId: async (parentId: string) => {
      const response = await productService.getBundleById(parentId);
      const bundleItems = response.bundleItems || [];

      const itemsWithProducts = await Promise.all(
        bundleItems.map(async (item: any) => {
          const productData = await productService.getById(item.productId);
          return {
            ...item,
            product: productData,
          };
        }),
      );

      return { data: itemsWithProducts, total: itemsWithProducts.length };
    },
  };

  const schemaKeys = React.useMemo(() => ['product.name', 'quantity', 'pricingMode'], []);

  return (
    <>
      <RelatedEntityTable
        parentIdKey="bundleId"
        parentIdProp={bundleId}
        service={bundleItemService}
        schemaKeys={schemaKeys}
        navigateBasePath={`/apps/sales/product-bundles/${bundleId}/items`}
        emptyMessage="No bundle items found for this product bundle."
        onAddClick={() => setIsCreateModalOpen(true)}
      />

      <BundleItemFormDialog
        bundleId={bundleId}
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={() => {
          refetch();
          setIsCreateModalOpen(false);
        }}
      />
    </>
  );
};

export default ProductBundleRelatedItems;

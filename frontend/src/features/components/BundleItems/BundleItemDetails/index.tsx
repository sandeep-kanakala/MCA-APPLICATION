import { useState, useEffect } from 'react';
import EntityDetailView from '@/features/components/EntitiesView/DetailView';
import bundleItemsService from '@/utils/services/BundleItems';
import { bundleItemSchema } from '@/features/components/BundleItems/utils';
import BundleItemRelated from './BundleItemRelated';
import ProductField from '../CustomFields/ProductField';
import productService from '@/utils/services/Products';
import BundleItemFormDialog from '../BundleItemFormDialog';
import { useParams } from 'react-router-dom';

export default function BundleItemDetails() {
  const { itemId } = useParams();
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedBundleItem, setSelectedBundleItem] = useState<any>(null);

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const response = await productService.getAll({ limit: 100, page: 1 });
        setProducts(response.data || []);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadProducts();
    const loadBundleItem = async () => {
      if (!itemId) return;
      try {
        const res = await bundleItemsService.getById(itemId);
        setSelectedBundleItem(res || null);
      } catch (err) {
        console.error('Failed to load bundle item for edit:', err);
      }
    };
    loadBundleItem();
  }, [itemId]);

  const productOptions = products.map((product) => ({
    label: product.name,
    value: product.id,
  }));

  return (
    <>
      <EntityDetailView
        entityType="bundleItem"
        schema={bundleItemSchema as any}
        service={bundleItemsService}
        labelField="productId"
        topFields={['quantity', 'pricingMode', 'overridePrice']}
        isActivity={true}
        hiddenFields={['id', 'createdAt', 'updatedAt', 'isRequired']}
        RelatedDetails={BundleItemRelated}
        extraProps={{
          customFields: {
            productId: (value: string) => <ProductField value={value} />,
          },
          productOptions,
          productLoading: isLoading,
        }}
        onEditClick={async () => {
          if (!selectedBundleItem && itemId) {
            try {
              const res = await bundleItemsService.getById(itemId);
              setSelectedBundleItem(res || null);
            } catch (err) {
              console.error('Failed to load bundle item before edit:', err);
            }
          }
          setIsEditDialogOpen(true);
        }}
      />
      <BundleItemFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        bundleItem={selectedBundleItem}
        onSuccess={() => window.location.reload()}
        bundleId={selectedBundleItem?.bundleId || ''}
      />
    </>
  );
}

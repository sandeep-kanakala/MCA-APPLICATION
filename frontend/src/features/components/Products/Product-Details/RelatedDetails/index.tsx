import React, { useEffect, useState } from 'react';
import { type Product } from '@/features/components/Products/utils';
import productService from '@/utils/services/Products';
import ProductBundleRelatedItems from '@/features/components/Products/ProductBundle/RelatedProductBundle';

interface ProductDetailsRelatedProps {
  product: Product | null;
}

const ProductDetailsRelated: React.FC<ProductDetailsRelatedProps> = ({ product }) => {
  const [bundleItems, setBundleItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBundleItems = async () => {
      const bundleId = product?.bundlesAsParent?.[0]?.id;
      if (product?.isBundle && bundleId) {
        setIsLoading(true);
        try {
          const response = await productService.getBundleById(bundleId);
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

          setBundleItems(itemsWithProducts);
        } catch (error) {
          console.error('Error loading bundle items:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadBundleItems();
  }, [product?.isBundle, product?.bundlesAsParent]);

  const refetch = async () => {
    if (product?.bundlesAsParent?.[0]?.id) {
      try {
        const response = await productService.getBundleById(product.bundlesAsParent[0].id);
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

        setBundleItems(itemsWithProducts);
      } catch (err) {
        console.error('Refetch failed', err);
      }
    }
  };

  if (!product?.isBundle) {
    return <p>No related bundles available for this product.</p>;
  }

  if (isLoading) {
    return <div>Loading bundle items...</div>;
  }

  const bundleId = product.bundlesAsParent?.[0]?.id;
  if (!bundleId) {
    return <p>Bundle information not found.</p>;
  }

  return (
    <ProductBundleRelatedItems bundleId={bundleId} bundleItems={bundleItems} refetch={refetch} />
  );
};

export default ProductDetailsRelated;

import React, { useEffect, useState } from 'react';
import productService from '@/utils/services/Products';

interface ProductFieldProps {
  value: string;
}

const ProductField: React.FC<ProductFieldProps> = ({ value }) => {
  const [productName, setProductName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProductName = async () => {
      try {
        const productData = await productService.getById(value);
        setProductName(productData.name);
      } catch (error) {
        console.error('Error loading product:', error);
        setProductName('Unable to load product name');
      } finally {
        setIsLoading(false);
      }
    };

    if (value) {
      loadProductName();
    }
  }, [value]);

  if (isLoading) {
    return <span>Loading...</span>;
  }

  return <span>{productName}</span>;
};

export default ProductField;

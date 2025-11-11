import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { type Product } from '@/features/components/Products/utils';

interface ProductDetailsHeaderProps {
  product: Product | null;
  backPath: string;
}

const ProductDetailsHeader: React.FC<ProductDetailsHeaderProps> = ({ product, backPath }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
      <div className="max-w-7xl mx-auto p-4 sm:px-6">
        <div className="flex justify-between items-center mb-3">
          <div>
            <div className="text-xs text-gray-500 flex items-center mb-1">Product</div>
            <h1 className="text-2xl font-normal flex items-center">{product?.name}</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(backPath)}
              className="cursor-pointer"
            >
              Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsHeader;

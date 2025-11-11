import RelatedEntityTable from '@/features/components/EntitiesView/RelatedEntityTable';
import { useDetailViewContext } from '@/features/components/EntitiesView/DetailView';
import type { PriceBook, PriceBookEntry } from '../../utils';
import PriceBookEntryCreateDialog from '../../create-pricebook-entry';
import { useState } from 'react';
import productService from '@/utils/services/Products';
import type { Product } from '@/types';

const getProductById = async (id: string): Promise<Product> => {
  const product = await productService.getById(id);
  return product;
};

const PRICEBOOK_ENTRY_SCHEMA_KEYS: string[] = ['productName', 'unitPrice', 'currencyCode'];

export default function PriceBookRelatedDetails() {
  const { entityData, refetchEntityData } = useDetailViewContext<PriceBook>();
  const [entryDialogOpen, setEntryDialogOpen] = useState(false);
  const pricebookId = entityData?.id;

  const getAllEntriesByPriceBookId = async (): Promise<{ data: any[]; totalRows: number }> => {
    const entries = entityData?.entries || [];

    const validEntries = entries.filter((entry: any) => entry.productId) as (PriceBookEntry & {
      productId: string;
    })[];

    const productPromises = validEntries.map((entry) => getProductById(entry.productId));

    const productDetails = await Promise.all(productPromises);

    const productMap = productDetails.reduce(
      (acc, product) => {
        acc[product.id!] = product.name;
        return acc;
      },
      {} as Record<string, string>,
    );

    const entriesWithProductName = entries.map((entry: any) => ({
      ...entry,
      productName: entry.productId
        ? productMap[entry.productId] || 'Product Name Not Found'
        : 'Missing Product ID',
    }));

    return {
      data: entriesWithProductName,
      totalRows: entries.length,
    };
  };

  if (!pricebookId) {
    return (
      <div className="text-gray-500 p-4">Cannot load related entries without a Price Book ID.</div>
    );
  }

  const handleAddEntryClick = () => {
    setEntryDialogOpen(true);
  };
  return (
    <>
      <RelatedEntityTable
        parentIdKey="pricebookId"
        service={{
          getAllByParentId: getAllEntriesByPriceBookId,
        }}
        schemaKeys={PRICEBOOK_ENTRY_SCHEMA_KEYS as any}
        navigateBasePath="/apps/sales/pricebookentries"
        emptyMessage="No price book entries found for this price book."
        onAddClick={handleAddEntryClick}
        addLabel="Add Entry"
      />
      <PriceBookEntryCreateDialog
        open={entryDialogOpen}
        onOpenChange={setEntryDialogOpen}
        onSuccess={refetchEntityData}
      />
    </>
  );
}

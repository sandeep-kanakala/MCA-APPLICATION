import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import EntityDetailView from '../../EntitiesView/DetailView';
import productService from '@/utils/services/Products';
import pricebookService from '@/utils/services/pricebook';
import { PriceBookEntrySchema } from '../utils';
import PriceBookEntryEditDialog from '@/features/components/PriceBooks/edit-pricebook-entry';
import { toast } from '@/components/ui/sonner';

type ProductOption = { label: string; value: string };

const priceBookEntryServiceWrapper = {
  getById: (id: string) => pricebookService.getPriceBookEntryById(id),
  update: (id: string, data: any) => pricebookService.updatePriceBookEntry(id, data),
  delete: (id: string) => pricebookService.deletePriceBookEntry(id),
};

export default function PriceBookEntryDetailPage() {
  const { pricebookentryId } = useParams<{ pricebookentryId: string }>();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [productLoading, setProductLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await productService.getAll({ limit: 200, page: 1 });
        const list = (res?.data ?? []).map((p: any) => ({
          label: p.name,
          value: p.id,
        }));
        setProductOptions(list);
      } catch (e) {
        console.error(e);
        toast.error('Failed to load products');
      } finally {
        setProductLoading(false);
      }
    })();
  }, []);

  return (
    <>
      <EntityDetailView
        entityType="pricebookentry"
        schema={PriceBookEntrySchema.omit({
          isActive: true,
          updatedAt: true,
          createdAt: true,
          tenantId: true,
          id: true,
        })}
        service={priceBookEntryServiceWrapper}
        topFields={['unitPrice', 'currencyCode']}
        isActivity={true}
        onEditClick={() => setEditDialogOpen(true)}
        hiddenFields={['priceBookId']}
        noneditableFields={['createdBy', 'updateBy']}
        extraProps={{
          productOptions,
          productLoading,
        }}
      />

      <PriceBookEntryEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        entryId={pricebookentryId || ''}
      />
    </>
  );
}

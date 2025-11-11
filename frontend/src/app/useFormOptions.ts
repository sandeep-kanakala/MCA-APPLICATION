import accountService from '@/utils/services/accounts';
import priceListService from '@/utils/services/product-pricelist';
import { useEntityOptions } from './entityOptions';

export const useAccountOptions = () => {
  return useEntityOptions({
    fetchFn: accountService.getAll,
    mapFn: (account: any) => ({
      value: account.id,
      label: account.name,
    }),
    errorMessage: 'Failed to fetch account list',
  });
};

export const usePriceBookOptions = () => {
  return useEntityOptions({
    fetchFn: priceListService.getBooks,
    mapFn: (book: any) => ({
      value: book.id,
      label: book.name,
      entries: book.entries,
    }),
    errorMessage: 'Failed to fetch price book list',
  });
};

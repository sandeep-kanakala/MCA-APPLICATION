import { format } from 'date-fns';
export const formatDialogTimestamp = (isoString: string | undefined): string => {
  if (!isoString) return '';
  try {
    return format(new Date(isoString), 'yyyy-MM-dd HH:mm:ss');
  } catch (e) {
    return isoString;
  }
};

export const entities: Record<string, string> = {
  contact: 'Contact',
  account: 'Account',
  pricebook: 'Price Book',
  pricebookentry: 'PriceBook Entry',
  product: 'Product',
  productBundle: 'ProductBundle',
  bundleItem: 'BundleItem',
  priceList: 'Price List',
  pricelistEntry: 'Price List Entry',
  order: 'Order',
  user: 'user',
};

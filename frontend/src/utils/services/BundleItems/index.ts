import fetchApiClient from '@/utils/fetchApiClient';
import { type BundleItem } from '@/features/components/BundleItems/utils';
import { extractErrorMessage } from '@/utils';

const bundleItemsService = {
  async create(bundleId: string, itemData: Partial<BundleItem>): Promise<any> {
    try {
      const response = await fetchApiClient.post(`/bundle-items/${bundleId}`, itemData);
      return response.data || response;
    } catch (error: any) {
      const backendMessage = extractErrorMessage(error);
      throw new Error(backendMessage);
    }
  },

  async getById(itemId: string): Promise<BundleItem> {
    try {
      const response = await fetchApiClient.get(`/bundle-items/${itemId}`);
      return response.data;
    } catch (error: any) {
      const backendMessage = extractErrorMessage(error);
      throw new Error(backendMessage);
    }
  },

  async update(itemId: string, itemData: Partial<BundleItem>): Promise<any> {
    try {
      const response = await fetchApiClient.patch(`/bundle-items/${itemId}`, itemData);
      return response.data || response;
    } catch (error: any) {
      const backendMessage = extractErrorMessage(error);
      throw new Error(backendMessage);
    }
  },

  async delete(itemId: string): Promise<any> {
    try {
      const response = await fetchApiClient.delete(`/bundle-items/${itemId}`);
      return response.data || response;
    } catch (error: any) {
      const backendMessage = extractErrorMessage(error);
      throw new Error(backendMessage);
    }
  },
};

export default bundleItemsService;

import fetchApiClient from '@/utils/fetchApiClient';
import type { Product, CreateProductPayload, UpdateProductPayload, GetAllParams } from '@/types';
import { type ProductBundle } from '@/features/components/Products/utils';
import { extractErrorMessage } from '@/utils';
import { filterValueMap } from '@/utils';

const productService = {
  async getAll(params: GetAllParams & { filters?: Record<string, string[]> }) {
    const { limit, page, filters, sortByField, sortOrder, search } = params;
    const queryParams: Record<string, any> = { limit, page };

    if (filters) {
      Object.entries(filters).forEach(([key, values]) => {
        if (values && values.length > 0) {
          if (key === 'isArchived') {
            const translatedValues = values.map((v) => filterValueMap[v] ?? v);
            queryParams[key] = translatedValues.join(',');
          } else {
            queryParams[key] = values.join(',');
          }
        }
      });

      if (search) {
        queryParams.search = search;
      }

      if (sortByField) {
        queryParams.sortByField = sortByField;
      }

      if (sortOrder) {
        queryParams.sortOrder = sortOrder;
      }
    }

    const response = await fetchApiClient.get('/products', queryParams);
    return response.data;
  },

  async create(productData: CreateProductPayload): Promise<Product> {
    try {
      const response = await fetchApiClient.post('/products', productData);
      return response.data?.data || response;
    } catch (error: any) {
      throw new Error(extractErrorMessage(error));
    }
  },

  async getById(id: string): Promise<Product> {
    try {
      const response = await fetchApiClient.get(`/products/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error(`Error fetching product with id ${id}:`, error);
      throw error;
    }
  },

  async update(id: string, updatedData: UpdateProductPayload): Promise<any> {
    try {
      const response = await fetchApiClient.patch(`/products/${id}`, updatedData);
      return response.data?.data || response;
    } catch (error: any) {
      throw new Error(extractErrorMessage(error));
    }
  },

  async delete(id: string): Promise<any> {
    try {
      const response = await fetchApiClient.delete(`/products/${id}`);
      return response.data?.data || response;
    } catch (error: any) {
      throw new Error(extractErrorMessage(error));
    }
  },

  async getBundleById(id: string): Promise<ProductBundle> {
    try {
      const response = await fetchApiClient.get(`/products/bundle/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error(`Error fetching bundle with id ${id}:`, error);
      throw error;
    }
  },
};

export default productService;

import fetchApiClient from '@/utils/fetchApiClient';
import type { GetAllParams } from '@/types';

const orderService = {
  async getAll(params: GetAllParams & { filters?: Record<string, string[]> }) {
    const { limit, page, filters, sortByField, sortOrder, search } = params;

    const queryParams: Record<string, any> = { limit, page };

    if (filters) {
      Object.entries(filters).forEach(([key, values]) => {
        if (values && values.length > 0) {
          queryParams[key] = values.join(',');
        }
      });
    }

    if (search) {
      queryParams.search = search;
    }

    if (sortByField) {
      queryParams.sortByField = sortByField;
    }

    if (sortOrder) {
      queryParams.sortOrder = sortOrder;
    }

    const response = await fetchApiClient.get('/orders', queryParams);
    return response.data;
  },
  async getById(id: string): Promise<any> {
    try {
      const response = await fetchApiClient.get(`/orders/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error(`Error fetching order with id ${id}:`, error);
      throw error;
    }
  },
};

export default orderService;

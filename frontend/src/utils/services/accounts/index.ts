import fetchApiClient from '@/utils/fetchApiClient';
import type { CreateAccountRequest, GetAllParams } from '@/types';
import { filterValueMap } from '@/utils';

const accountService = {
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

    const response = await fetchApiClient.get('/accounts', queryParams);
    return response.data;
  },
  async post(url: string, body: any) {
    return fetchApiClient.post(url, body);
  },

  create: async (userData: CreateAccountRequest): Promise<CreateAccountRequest> => {
    try {
      const response = await fetchApiClient.post('/accounts', userData);
      return response;
    } catch (error) {
      console.error('Error creating account:', error);
      throw error;
    }
  },
  async update(
    id: string,
    updatedData: Partial<CreateAccountRequest>,
  ): Promise<CreateAccountRequest> {
    try {
      const response = await fetchApiClient.patch(`/accounts/${id}`, updatedData);
      return response;
    } catch (error) {
      console.error(`Error updating account with id ${id}:`, error);
      throw error;
    }
  },
  async delete(id: string): Promise<void> {
    try {
      await fetchApiClient.delete(`/accounts/${id}`);
    } catch (error) {
      console.error(`Error deleting account with id ${id}:`, error);
      throw error;
    }
  },
  async getById(id: string): Promise<CreateAccountRequest> {
    try {
      const response = await fetchApiClient.get(`/accounts/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error(`Error fetching user with id ${id}:`, error);
      throw error;
    }
  },
};

export default accountService;

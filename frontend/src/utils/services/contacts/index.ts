import fetchApiClient from '@/utils/fetchApiClient';
import type { CreateContactRequest, GetAllParams } from '@/types';
import { filterValueMap } from '@/utils';

const contactService = {
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

    const response = await fetchApiClient.get('/contacts', queryParams);
    return response.data;
  },
  async post(url: string, body: any) {
    return fetchApiClient.post(url, body);
  },
  async getAllContactsByAccountId(id: string, params: { limit: number; page: number }) {
    const response = await fetchApiClient.get('/contacts', { ...params, accountId: id });
    return response.data;
  },

  create: async (contactData: CreateContactRequest): Promise<CreateContactRequest> => {
    try {
      const response = await fetchApiClient.post('/contacts', contactData);
      return response;
    } catch (error) {
      console.error('Error creating contact:', error);
      throw error;
    }
  },
  async update(
    id: string,
    updatedData: Partial<CreateContactRequest>,
  ): Promise<CreateContactRequest> {
    try {
      const response = await fetchApiClient.patch(`/contacts/${id}`, updatedData);

      return response.data;
    } catch (error) {
      console.error(`Error updating contact with id ${id}:`, error);
      throw error;
    }
  },
  async delete(id: string): Promise<void> {
    try {
      await fetchApiClient.delete(`/contacts/${id}`);
    } catch (error) {
      console.error(`Error deleting contact with id ${id}:`, error);
      throw error;
    }
  },
  async getById(id: string): Promise<CreateContactRequest> {
    try {
      const response = await fetchApiClient.get(`/contacts/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error(`Error fetching contact with id ${id}:`, error);
      throw error;
    }
  },
};

export default contactService;

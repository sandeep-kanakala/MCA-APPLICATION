import type { CreatePricelistRequest, CreatePricelistEntryRequest, GetAllParams } from '@/types';
import { filterValueMap } from '@/utils';
import fetchApiClient from '@/utils/fetchApiClient';

const priceListService = {
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

    const response = await fetchApiClient.get('/pricelist', queryParams);
    return response.data;
  },
  async getProducts(params: { limit: number; page: number }) {
    const response = await fetchApiClient.get('/products', params);
    return response.data;
  },
  async getBooks(params: { limit: number; page: number }) {
    const response = await fetchApiClient.get('/pricebook', params);
    return response.data;
  },
  //create
  create: async (priceListData: CreatePricelistRequest): Promise<CreatePricelistRequest> => {
    try {
      const response = await fetchApiClient.post('/pricelist', priceListData);
      return response;
    } catch (error) {
      console.error('Error creating pricelist:', error);
      throw error;
    }
  },
  //update
  async update(
    id: string,
    updatedData: Partial<CreatePricelistRequest>,
  ): Promise<CreatePricelistRequest> {
    try {
      const response = await fetchApiClient.patch(`/pricelist/${id}`, updatedData);

      return response.data;
    } catch (error) {
      console.error(`Error updating pricelist with id ${id}:`, error);
      throw error;
    }
  },
  //delete
  async delete(id: string): Promise<void> {
    try {
      await fetchApiClient.delete(`/pricelist/${id}`);
    } catch (error) {
      console.error(`Error deleting pricelist with id ${id}:`, error);
      throw error;
    }
  },
  //get
  async getById(id: string): Promise<CreatePricelistRequest> {
    try {
      const response = await fetchApiClient.get(`/pricelist/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error(`Error fetching pricelist with id ${id}:`, error);
      throw error;
    }
  },

  //entry create
  createEntry: async (
    id: string,
    priceListData: CreatePricelistEntryRequest,
  ): Promise<CreatePricelistEntryRequest> => {
    try {
      const response = await fetchApiClient.post(`/pricelist/${id}`, priceListData);
      return response;
    } catch (error) {
      console.error('Error creating pricelist:', error);
      throw error;
    }
  },

  //entry update
  async updateEntry(
    id: string,
    updatedData: Partial<CreatePricelistRequest>,
  ): Promise<CreatePricelistRequest> {
    try {
      const response = await fetchApiClient.patch(`/pricelist/entry/${id}`, updatedData);

      return response.data;
    } catch (error) {
      console.error(`Error updating pricelist with id ${id}:`, error);
      throw error;
    }
  },
  //entry delete
  async deleteEntry(id: string): Promise<void> {
    try {
      await fetchApiClient.delete(`/pricelist/entry/${id}`);
    } catch (error) {
      console.error(`Error deleting pricelist with id ${id}:`, error);
      throw error;
    }
  },

  async getEntryId(id: string): Promise<CreatePricelistEntryRequest> {
    try {
      const response = await fetchApiClient.get(`/pricelist/entry/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error(`Error fetching pricelist with id ${id}:`, error);
      throw error;
    }
  },
};

export default priceListService;

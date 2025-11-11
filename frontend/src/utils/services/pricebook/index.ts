import fetchApiClient from '@/utils/fetchApiClient';
import type { Response } from '@/types';
import type {
  CreatePriceBookDto,
  CreatePriceBookEntryDto,
  UpdatePriceBookDto,
  UpdatePriceBookEntryDto,
} from '@/features/components/PriceBooks/utils';
import type { GetAllParams } from '@/types';
import { filterValueMap } from '@/utils';

const pricebookService = {
  async createPriceBook(dto: CreatePriceBookDto): Promise<Response> {
    try {
      const response = await fetchApiClient.post('/pricebook', dto);
      return {
        data: response.data,
        message: response.message || 'Price book created successfully',
        status: response.status || 'success',
        statusCode: response.statusCode,
      };
    } catch (error) {
      console.error('Error creating price book:', error);
      throw error;
    }
  },

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

    const response = await fetchApiClient.get('/pricebook', queryParams);
    return response.data;
  },
  async getPriceBookById(id: string): Promise<Response> {
    try {
      const response = await fetchApiClient.get(`/pricebook/${id}`);
      return {
        data: response.data?.data || response.data,
        message: response.message || 'Price book fetched successfully',
        status: response.status || 'success',
        statusCode: response.statusCode,
      };
    } catch (error) {
      console.error(`Error fetching price book with id ${id}:`, error);
      throw error;
    }
  },

  async updatePriceBook(id: string, dto: UpdatePriceBookDto): Promise<Response> {
    try {
      const response = await fetchApiClient.patch(`/pricebook/${id}`, dto);
      return {
        data: response.data,
        message: response.message || 'Price book updated successfully',
        status: response.status || 'success',
        statusCode: response.statusCode,
      };
    } catch (error) {
      console.error(`Error updating price book with id ${id}:`, error);
      throw error;
    }
  },

  async deletePriceBook(id: string): Promise<Response> {
    try {
      const response = await fetchApiClient.delete(`/pricebook/${id}`);
      return {
        data: null,
        message: response.message || 'Price book deleted successfully',
        status: response.status || 'success',
        statusCode: response.statusCode,
      };
    } catch (error) {
      console.error(`Error deleting price book with id ${id}:`, error);
      throw error;
    }
  },

  async createPriceBookEntry(priceBookId: string, dto: CreatePriceBookEntryDto): Promise<Response> {
    try {
      const response = await fetchApiClient.post(`/pricebook/${priceBookId}`, dto);
      return {
        data: response.data,
        message: response.message || 'Price book entry created successfully',
        status: response.status || 'success',
        statusCode: response.statusCode,
      };
    } catch (error) {
      console.error('Error creating price book entry:', error);
      throw error;
    }
  },

  async getPriceBookEntryById(id: string): Promise<Response> {
    try {
      const response = await fetchApiClient.get(`/pricebook/entry/${id}`);
      return {
        data: response.data?.data || response.data,
        message: response.message || 'Price book entry fetched successfully',
        status: response.status || 'success',
        statusCode: response.statusCode,
      };
    } catch (error) {
      console.error(`Error fetching price book entry with id ${id}:`, error);
      throw error;
    }
  },

  async updatePriceBookEntry(id: string, dto: UpdatePriceBookEntryDto): Promise<Response> {
    try {
      const response = await fetchApiClient.patch(`/pricebook/entry/${id}`, dto);
      return {
        data: response.data,
        message: response.message || 'Price book entry updated successfully',
        status: response.status || 'success',
        statusCode: response.statusCode,
      };
    } catch (error) {
      console.error(`Error updating price book entry with id ${id}:`, error);
      throw error;
    }
  },

  async deletePriceBookEntry(id: string): Promise<Response> {
    try {
      const response = await fetchApiClient.delete(`/pricebook/entry/${id}`);
      return {
        data: null,
        message: response.message || 'Price book entry deleted successfully',
        status: response.status || 'success',
        statusCode: response.statusCode,
      };
    } catch (error) {
      console.error(`Error deleting price book entry with id ${id}:`, error);
      throw error;
    }
  },
};

export default pricebookService;

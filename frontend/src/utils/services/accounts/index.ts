import fetchApiClient from '@/utils/fetchApiClient';
export interface ICreateAccountRequest {
  name?: string;
  type?: string;
  industry?: string;
  website?: string;
  phone?: string;
  billingStreet?: string;
  billingCity?: string;
  billingState?: string;
  billingPostal?: string;
  billingCountry?: string;
  shippingStreet?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingPostal?: string;
  shippingCountry?: string;
}

const accountService = {
  async getAll(params: { limit: number; page: number }) {
    const response = await fetchApiClient.get('/accounts/list', params);
    return response.data;
  },
  async post(url: string, body: any) {
    return fetchApiClient.post(url, body);
  },

  // POST: Create a new user
  create: async (userData: ICreateAccountRequest): Promise<ICreateAccountRequest> => {
    try {
      const response = await fetchApiClient.post('/accounts/create', userData);
      return response;
    } catch (error) {
      console.error('Error creating account:', error);
      throw error;
    }
  },
  async update(
    id: string,
    updatedData: Partial<ICreateAccountRequest>,
  ): Promise<ICreateAccountRequest> {
    try {
      const response = await fetchApiClient.patch(`/accounts/update/${id}`, updatedData);
      return response;
    } catch (error) {
      console.error(`Error updating account with id ${id}:`, error);
      throw error;
    }
  },
  async delete(id: string): Promise<void> {
    try {
      await fetchApiClient.delete(`/accounts/delete/${id}`);
    } catch (error) {
      console.error(`Error deleting account with id ${id}:`, error);
      throw error;
    }
  },
  async getById(id: string): Promise<ICreateAccountRequest> {
    try {
      const response = await fetchApiClient.get(`/accounts/${id}`);
      return response.data?.data || response.data; // Adjust based on your API structure
    } catch (error) {
      console.error(`Error fetching user with id ${id}:`, error);
      throw error;
    }
  },
};

export default accountService;

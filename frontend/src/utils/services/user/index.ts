import fetchApiClient from '@/utils/fetchApiClient';

interface User {
  id: string;
  middleName: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phoneNo: string | null;
  role?: string;
}

interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

const userService = {
  async getAll(params: { limit: number; page: number }): Promise<UserListResponse> {
    const response = await fetchApiClient.get('/user/list', params);
    return {
      users: response.data?.data || [], // Map data.data to users
      total: response.data?.total || 0,
      page: response.data?.page || params.page,
      limit: response.data?.limit || params.limit,
    };
  },
  async post(url: string, body: any) {
    return fetchApiClient.post(url, body);
  },

  // POST: Create a new user
  create: async (userData: User): Promise<User> => {
    try {
      const response = await fetchApiClient.post('/user/create', userData);
      return response;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },
  async update(id: string, updatedData: Partial<User>): Promise<User> {
    try {
      const response = await fetchApiClient.patch(`/user/update/${id}`, updatedData);
      return response;
    } catch (error) {
      console.error(`Error updating user with id ${id}:`, error);
      throw error;
    }
  },
  async delete(id: string): Promise<void> {
    try {
      await fetchApiClient.delete(`/user/delete/${id}`);
    } catch (error) {
      console.error(`Error deleting user with id ${id}:`, error);
      throw error;
    }
  },
  async getById(id: string): Promise<User> {
    try {
      const response = await fetchApiClient.get(`/user/${id}`);
      return response.data?.data || response.data; // Adjust based on your API structure
    } catch (error) {
      console.error(`Error fetching user with id ${id}:`, error);
      throw error;
    }
  },
};

export default userService;

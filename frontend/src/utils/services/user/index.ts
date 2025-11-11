import fetchApiClient from '@/utils/fetchApiClient';
import type { GetAllParams, User } from '@/types';
import { filterValueMap } from '@/utils';

const FILTER_KEY_MAP: Record<string, string> = {
  roles: 'role',
};

const userService = {
  async getAll(params: GetAllParams & { filters?: Record<string, string[]> }) {
    const { limit, page, filters, sortByField, sortOrder, search } = params;

    const queryParams: Record<string, any> = { limit, page };

    if (filters) {
      Object.entries(filters).forEach(([key, values]) => {
        if (values && values.length > 0) {
          if (key === 'isArchived') {
            const translatedValues = values.map((v) => filterValueMap[v] ?? v);
            const backendKey = FILTER_KEY_MAP[key] || key;
            queryParams[backendKey] = translatedValues.join(',');
          } else {
            const backendKey = FILTER_KEY_MAP[key] || key;
            queryParams[backendKey] = values.join(',');
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

    const response = await fetchApiClient.get('/users', queryParams);
    const normalizedData = {
      ...response.data,
      data: response.data.data.map((user: any) => ({
        ...user,
        roles: user.roles?.map((role: { name: string }) => role.name) || ['USER'],
      })),
    };

    return normalizedData;
  },

  async post(url: string, body: any) {
    return fetchApiClient.post(url, body);
  },

  create: async (userData: Partial<User>): Promise<User> => {
    const response = await fetchApiClient.post('/users', userData);
    return {
      ...response.data,
      roles: response.data?.roles?.map((role: { name: string }) => role.name) || [
        response.data?.role || 'USER',
      ],
    };
  },

  async update(id: string, updatedData: Partial<User>): Promise<User> {
    try {
      const payload = {
        ...updatedData,
        ...(updatedData.roles && { roles: updatedData.roles.map((role) => ({ name: role })) }),
      };
      const response = await fetchApiClient.patch(`/users/${id}`, payload);
      return {
        ...response.data,
        roles: response.data?.roles?.map((role: { name: string }) => role.name) || ['USER'],
      };
    } catch (error) {
      console.error(`Error updating user with id ${id}:`, error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await fetchApiClient.delete(`/users/${id}`);
    } catch (error) {
      console.error(`Error deleting user with id ${id}:`, error);
      throw error;
    }
  },

  async getById(id: string): Promise<User> {
    try {
      const response = await fetchApiClient.get(`/users/${id}`);
      const userData = response.data?.data || response.data;
      return {
        ...userData,
        roles: userData.roles?.map((role: { name: string }) => role.name) || ['USER'],
      };
    } catch (error) {
      console.error(`Error fetching user with id ${id}:`, error);
      throw error;
    }
  },
};

export default userService;

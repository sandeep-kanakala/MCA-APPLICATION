import { setAuthToken } from '@/utils';
import fetchApiClient from '@/utils/fetchApiClient';

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await fetchApiClient.post('/auth/signin', { email, password });
    console.log('Login response:', response);
    if (response?.data.access_token) {
      setAuthToken(response.data.access_token);
    }

    return response;
  } catch (error: any) {
    console.error('Login failed:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Something went wrong' };
  }
};

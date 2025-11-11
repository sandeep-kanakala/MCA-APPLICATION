import { API_URL } from '@/config/runtimeConfig';
import { extractErrorMessage, setAuthToken, setResetToken } from '@/utils';
import fetchApiClient from '@/utils/fetchApiClient';

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await fetchApiClient.post('/signin', { email, password });
    if (response?.data.access_token) {
      setAuthToken(response.data.access_token);
    }

    return response;
  } catch (error: any) {
    const message = extractErrorMessage(error);
    throw new Error(message);
  }
};

export const forgotPassword = async (email: string) => {
  try {
    const response = await fetchApiClient.post('/forgot-password', { email });
    return response;
  } catch (error: any) {
    const message = extractErrorMessage(error);
    throw new Error(message);
  }
};

export const validateOtp = async (email: string, otp: string) => {
  try {
    const response = await fetchApiClient.post('/validate-otp', { email, otp });
    if (response?.resetToken) {
      setResetToken(response.resetToken);
    }
    return response;
  } catch (error: any) {
    const message = extractErrorMessage(error);
    throw new Error(message);
  }
};

export const changePassword = async (email: string, password: string, resetToken: string) => {
  try {
    const response = await fetchApiClient.post(
      '/change-password',
      {
        email,
        password,
      },
      {
        Authorization: `Bearer ${resetToken}`,
      },
    );
    return response;
  } catch (error: any) {
    const message = extractErrorMessage(error);
    throw new Error(message);
  }
};
export const loginWithMicrosoft = () => {
  try {
    window.location.href = `${API_URL}/auth/microsoft-login`;
  } catch (error: any) {
    const message = extractErrorMessage(error);
    throw new Error(message);
  }
};
export const changeAuthenticatedPassword = async (email: string, newPassword: string) => {
  try {
    const response = await fetchApiClient.post('/change-password', {
      email: email,
      password: newPassword,
    });
    return response;
  } catch (error: any) {
    const message = extractErrorMessage(error);
    throw new Error(message);
  }
};

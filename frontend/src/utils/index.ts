const AUTH_TOKEN_KEY = 'access_token';
const RESET_TOKEN_KEY = 'resetToken';

/**
 * Retrieves the authentication token from localStorage.
 * @returns The token string, or null if it doesn't exist.
 */
export const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch (e) {
    console.error('Failed to get auth token', e);
    return null;
  }
};

/**
 * Saves the authentication token to localStorage.
 * @param token The token string to save.
 */
export const setAuthToken = (token: string): void => {
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch (e) {
    console.error('Failed to set auth token', e);
  }
};

/**
 * Removes the authentication token from localStorage.
 */
export const clearAuthToken = (): void => {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch (e) {
    console.error('Failed to clear auth token', e);
  }
};

/**
 * Retrieves the reset token from localStorage.
 * @returns The token string, or null if it doesn't exist.
 */
export const getResetToken = (): string | null => {
  try {
    return localStorage.getItem(RESET_TOKEN_KEY);
  } catch (e) {
    console.error('Failed to get reset token', e);
    return null;
  }
};

/**
 * Saves the reset token to localStorage.
 * @param token The token string to save.
 */
export const setResetToken = (token: string): void => {
  try {
    localStorage.setItem(RESET_TOKEN_KEY, token);
  } catch (e) {
    console.error('Failed to set reset token', e);
  }
};

/**
 * Removes the reset token from localStorage.
 */
export const clearResetToken = (): void => {
  try {
    localStorage.removeItem(RESET_TOKEN_KEY);
  } catch (e) {
    console.error('Failed to clear reset token', e);
  }
};
export const extractErrorMessage = (error: any): string => {
  try {
    let data = error?.data;
    if (typeof data === 'string') {
      data = JSON.parse(data);
    }
    if (data?.message) {
      if (Array.isArray(data.message)) return data.message.join(', ');
      if (typeof data.message === 'string' && data.message.trim() !== '') return data.message;
    }
    if (data?.error && typeof data.error === 'string') return data.error;
    if (typeof error.data === 'string') {
      const parsed = JSON.parse(error.data);
      return parsed.message;
    }
  } catch (e) {
    console.error('Failed to parse error response:', e);
  }
  if (error?.message && typeof error.message === 'string') return error.message;
  return 'An unknown error occurred. Please check the console.';
};

export const formatFieldName = (fieldName: string) => {
  return fieldName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};
export const convertSingular = (word: string) => {
  switch (word.toLowerCase()) {
    case 'price list':
      return word;
    default:
      return word.slice(0, -1);
  }
};
export const filterValueMap: Record<string, string | boolean> = {
  Active: 'false',
  InActive: 'true',
};

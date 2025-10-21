const AUTH_TOKEN_KEY = 'access_token';

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

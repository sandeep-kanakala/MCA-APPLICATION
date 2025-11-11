// utils/fetchApiClient.ts
import { API_URL, APP_ENV } from '@/config/runtimeConfig';
import { getAuthToken } from '@/utils';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface FetchOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  params?: Record<string, string | number>;
  body?: any;
}

/**
 * Build query string from params
 */
function buildQueryString(params?: Record<string, string | number>) {
  if (!params) return '';
  return (
    '?' +
    Object.entries(params)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join('&')
  );
}

/**
 * Logger to measure request time
 */
function createLogger(taskName: string) {
  const start = Date.now();
  return () => {
    const end = Date.now();
    const durationMs = end - start;
    if (APP_ENV === 'development') {
      console.log(`[FetchApiClient] ${taskName} | Time: ${durationMs}ms`);
    }
  };
}

/**
 * Core fetch request
 */
async function fetchRequest(
  url: string,
  options: FetchOptions = {},
  baseURL = '',
  getAuthToken?: () => string | null,
  defaultHeaders: Record<string, string> = { 'Content-Type': 'application/json' },
): Promise<any> {
  const { method = 'GET', headers = {}, params, body } = options;
  const logEnd = createLogger(`${method} ${url}`);

  try {
    const queryString = method === 'GET' && params ? buildQueryString(params) : '';

    const fullURL =
      url.startsWith('http://') || url.startsWith('https://')
        ? url + queryString
        : `${baseURL}${url}${queryString}`;

    const authToken = getAuthToken ? getAuthToken() : null;

    const response = await fetch(fullURL, {
      method,
      headers: {
        ...defaultHeaders,
        ...headers,
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: body && method !== 'GET' ? JSON.stringify(body) : undefined,
    });

    logEnd();

    if (!response.ok) {
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      }
      const errorText = await response.text();
      throw { status: response.status, data: errorText || 'Error' };
    }

    const contentType = response.headers.get('Content-Type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    return response.text();
  } catch (err: any) {
    if (
      typeof err === 'object' &&
      err &&
      ('status' in err ? err.status === 401 : err.statusCode === 401)
    ) {
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
    logEnd();
    throw err;
  }
}

/**
 * Singleton fetch API client
 */
const fetchApiClient = (() => {
  const baseURL = API_URL || '';

  return {
    get: (
      url: string,
      params?: Record<string, string | number>,
      headers?: Record<string, string>,
    ) => fetchRequest(url, { method: 'GET', params, headers }, baseURL, getAuthToken),
    post: (url: string, body?: any, headers?: Record<string, string>) =>
      fetchRequest(url, { method: 'POST', body, headers }, baseURL, getAuthToken),
    put: (url: string, body?: any, headers?: Record<string, string>) =>
      fetchRequest(url, { method: 'PUT', body, headers }, baseURL, getAuthToken),
    patch: (url: string, body?: any, headers?: Record<string, string>) =>
      fetchRequest(url, { method: 'PATCH', body, headers }, baseURL, getAuthToken),
    delete: (url: string, headers?: Record<string, string>) =>
      fetchRequest(url, { method: 'DELETE', headers }, baseURL, getAuthToken),
  };
})();

export default fetchApiClient;

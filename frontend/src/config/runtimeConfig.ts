// src/config/runtimeConfig.ts
// src/config/runtimeConfig.ts
export const getRuntimeEnv = (key: string, fallback = ''): string => {
  if (typeof window !== 'undefined') {
    const value = window.__RUNTIME_CONFIG__?.[key]; // ✅ no TS error
    if (value) return value;
  }

  return import.meta.env[key] || fallback;
};

export const API_URL = getRuntimeEnv('VITE_API_URL', 'https://default.api.com');
export const APP_ENV = getRuntimeEnv('VITE_ENV', 'development');

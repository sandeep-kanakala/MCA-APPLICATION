// src/global.d.ts
export {};

declare global {
  interface Window {
    __RUNTIME_CONFIG__?: Record<string, string>;
  }
}

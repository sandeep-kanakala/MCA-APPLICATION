// 1️⃣ Add Jest DOM matchers globally
import '@testing-library/jest-dom';

// 2️⃣ Configure React Testing Library defaults
import { configure } from '@testing-library/react';

configure({
  throwSuggestions: true,
  asyncUtilTimeout: 1000,
});

// 3️⃣ Mock global fetch (TypeScript-safe)
if (!window.fetch) {
  window.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({}),
    })
  ) as unknown as typeof fetch;
}

// 4️⃣ Clear mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

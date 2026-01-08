import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/integration/**/*.test.ts'],
    globals: true,
    testTimeout: 10000, // 10 seconds for API calls
  },
});

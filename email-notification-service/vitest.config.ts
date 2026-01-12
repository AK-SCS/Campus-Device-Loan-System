import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src*.test.ts'],
    exclude: ['node_modules*.config.ts',
        'src/functions/**',
      ],
      thresholds: {
        lines: 75,
        functions: 80,
        branches: 0,
        statements: 75,
      }
    },
  },
});

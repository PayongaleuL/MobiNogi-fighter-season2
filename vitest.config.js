import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,jsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/utils/**/*.js'],
      exclude: ['src/**/*.test.{js,jsx}', 'src/**/*.spec.{js,jsx}'],
      reporter: ['text', 'html', 'lcov'],
      thresholds: {
        statements: 95,
        branches: 95,
        functions: 95,
        lines: 95,
      },
    },
  },
});

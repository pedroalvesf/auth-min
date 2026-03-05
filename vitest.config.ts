import swc from 'unplugin-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths(), swc.vite()],
  test: {
    globals: true,
    root: '.',
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['src/**/*.spec.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'e2e',
          include: ['test/**/*.e2e-spec.ts'],
          setupFiles: ['./test/setup-e2e.ts'],
          testTimeout: 30000,
          hookTimeout: 30000,
          sequence: { concurrent: false },
        },
      },
    ],
  },
});

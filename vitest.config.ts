import { defineConfig } from 'vitest/config';
import angular from '@vitejs/plugin-angular';

export default defineConfig({
  plugins: [angular()],
  test: {
    globals: true,
    setupFiles: ['vitest.setup.ts'],
    environment: 'jsdom',
    include: ['src/**/*.spec.ts'],
  },
});

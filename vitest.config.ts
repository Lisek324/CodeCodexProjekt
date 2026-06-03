import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    setupFiles: ['vitest.setup.ts'],
    environment: 'jsdom',
    include: ['src/**/*.spec.ts'],
    server: {
      deps: {
        inline: [
          '@angular/core',
          '@angular/common',
          '@angular/forms',
          '@angular/router',
          '@angular/platform-browser',
          '@angular/platform-browser-dynamic',
          '@angular/cdk',
          '@angular/material',
        ],
      },
    },
  },
});

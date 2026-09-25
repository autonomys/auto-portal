/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@auto-portal/shared-lib': resolve(__dirname, '../../packages/shared-lib/src/index.ts'),
      '@auto-portal/shared-state': resolve(__dirname, '../../packages/shared-state/src/index.ts'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', '**/*.d.ts', '**/*.config.*', 'dist/'],
    },
  },
});

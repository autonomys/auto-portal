import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@auto-portal/shared-lib': path.resolve(__dirname, '../../packages/shared-lib/src/index.ts'),
      '@auto-portal/shared-state': path.resolve(
        __dirname,
        '../../packages/shared-state/src/index.ts',
      ),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split large vendor libraries into separate chunks
          polkadot: ['@polkadot/api', '@polkadot/types', '@polkadot/util'],
          vendor: ['react', 'react-dom'],
        },
      },
    },
    // Increase chunk size warning limit to reduce noise
    chunkSizeWarningLimit: 1000,
  },
});

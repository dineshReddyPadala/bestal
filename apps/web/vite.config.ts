import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(__dirname, '../..');

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api/v1': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@bestal/ui/globals.css': path.resolve(workspaceRoot, 'packages/ui/src/styles/globals.css'),
      '@bestal/ui/tailwind': path.resolve(workspaceRoot, 'packages/ui/tailwind.config.js'),
      '@bestal/ui': path.resolve(workspaceRoot, 'packages/ui/src/index.ts'),
      '@bestal/mock-data': path.resolve(workspaceRoot, 'packages/mock-data/src/index.ts'),
      '@bestal/shared-utils': path.resolve(workspaceRoot, 'packages/shared-utils/src/index.ts'),
    },
  },
});

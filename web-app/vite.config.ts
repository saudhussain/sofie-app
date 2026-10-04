/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Sofie's OpenAPI lives on port 3000. Proxying /api keeps those calls on this
// app's origin so the browser does not hit a cross-origin block.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
      // The Node build of Pino starts a worker. The touch app and Vitest
      // both use the browser build, which writes to the console.
      pino: new URL('../node_modules/pino/browser.js', import.meta.url)
        .pathname,
    },
  },
  server: {
    proxy: {
      '/api': {
        changeOrigin: true,
        target: 'http://localhost:3000',
      },
    },
  },
  test: {
    include: ['src/**/__tests__/**/*.test.ts'],
  },
});

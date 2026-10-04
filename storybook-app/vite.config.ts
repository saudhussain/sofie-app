import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

const webAppSrc = new URL('../web-app/src', import.meta.url).pathname;
const executeAdLibMock = new URL(
  './src/mocks/execute-adlib.ts',
  import.meta.url
).pathname;

/**
 * The touch app posts to Sofie. Stories import that module by a relative
 * path, so the alias on `@/` would not catch it. This swap keeps a tap
 * inside the catalog.
 */
const mockExecuteAdLib = (): Plugin => ({
  enforce: 'pre',
  name: 'mock-execute-adlib',
  resolveId(source) {
    if (
      source.endsWith('/api/execute-adlib') ||
      source.endsWith('/api/execute-adlib.ts')
    ) {
      return executeAdLibMock;
    }
    return null;
  },
});

export default defineConfig({
  plugins: [react(), tailwindcss(), mockExecuteAdLib()],
  resolve: {
    alias: {
      '@': webAppSrc,
      // Same browser build the touch app uses. The Node build starts a worker.
      pino: new URL('../node_modules/pino/browser.js', import.meta.url)
        .pathname,
    },
  },
  server: {
    fs: {
      allow: [new URL('..', import.meta.url).pathname],
    },
  },
});

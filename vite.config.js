import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The frontend never holds the API key. In dev, /api is proxied to the
// Express backend (server/index.js) which reads the key from .env only.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});

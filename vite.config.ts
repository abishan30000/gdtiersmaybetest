import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev: proxy API + assets to the backend (default http://localhost:5174)
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5174',
      '/assets': 'http://localhost:5174'
    }
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    globals: true
  }
});

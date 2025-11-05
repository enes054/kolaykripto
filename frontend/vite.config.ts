import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 5173,
    proxy: {
      '/sse': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true,
        ws: true,
      },
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});


import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0', // Listen on all network interfaces
    hmr: {
      host: '192.168.4.187', // Replace with your computer's actual local IP address
    },
  },
});
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import removeConsole from 'vite-plugin-remove-console';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), removeConsole()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/lib/index.js'),
      name: 'httpClient',
      fileName: (format) => `httpClient.${format}.js`,
    },
    rollupOptions: {
      external: ['react'],
    },
  },
});

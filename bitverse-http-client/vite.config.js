import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import Banner from 'vite-plugin-banner';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';
import removeConsole from 'vite-plugin-remove-console';
import { version } from './package.json'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    removeConsole(),
    Banner(`/* bitverse-http-client v${version} */`),
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/lib/index.ts'),
      name: 'httpClient',
      fileName: (format) => `httpClient.${format}.js`,
    },
    rollupOptions: {
      external: ['react'],
    },
  },
});

import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5174,
  },
  build: {
    rollupOptions: {
      input: {
        main: './src/index.html',
      },
    },
  },
});

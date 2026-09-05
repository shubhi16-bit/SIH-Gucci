import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  css: {
    postcss: {}
  },
  server: {
    port: 3000,
    open: false,
    host: true
  },
  build: {
    rollupOptions: {
      input: {
        main: './dev.html' // Source entry point
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  }
});

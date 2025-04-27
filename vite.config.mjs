// vite.config.mjs
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  base: './', // URLs relativas → roda via file://
  plugins: [
    react(),
    viteSingleFile()
  ],
  build: {
    assetsInlineLimit: 100000000, // Garante que todos os assets sejam inlined
    cssCodeSplit: false,
    brotliSize: false,
    rollupOptions: {
      output: {
        // Removido manualChunks e inlineDynamicImports
      },
    },
  },
});
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import path from 'path';

export default defineConfig({
  root: 'webview-src',
  build: {
    outDir: '../assets/web',
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'webview-src/index.html')
    }
  },
  plugins: [react(), viteSingleFile()],
  esbuild: {
    jsx: 'automatic'
  }
});

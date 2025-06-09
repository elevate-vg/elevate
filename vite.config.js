import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import path from 'path';

export default defineConfig({
  root: 'webview-src',
  build: {
    outDir: '../dist/ui',
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'webview-src/index.html')
    }
  },
  plugins: [viteSingleFile()]
});
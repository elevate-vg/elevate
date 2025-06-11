import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/test-setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'expo-file-system': path.resolve(__dirname, './src/__mocks__/expo-file-system.ts'),
      'react-native': path.resolve(__dirname, './src/__mocks__/react-native.ts'),
    },
  },
});
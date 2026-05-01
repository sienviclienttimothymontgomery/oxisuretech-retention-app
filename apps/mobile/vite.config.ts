import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ['react-native-reanimated/plugin'],
      },
    }),
  ],
  resolve: {
    alias: {
      'react-native/Libraries/Utilities/codegenNativeComponent': path.resolve(__dirname, './src/stubs/codegenNativeComponent.tsx'),
      'react-native': 'react-native-web',
      '@': path.resolve(__dirname, './'),
      // Stub for expo-linear-gradient
      'expo-linear-gradient': path.resolve(__dirname, './src/stubs/expo-linear-gradient.tsx'),
    },
    extensions: ['.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.tsx', '.ts', '.jsx', '.js', '.json'],
  },
  define: {
    global: 'window',
    'process.env': {}
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});

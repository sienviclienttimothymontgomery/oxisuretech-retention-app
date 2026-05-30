import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Stub out react-native-svg fabric modules that reference TurboModuleRegistry
    {
      name: 'stub-react-native-svg-fabric',
      resolveId(source) {
        if (source.includes('react-native-svg') && source.includes('fabric')) {
          return source;
        }
        return null;
      },
      load(id) {
        if (id.includes('react-native-svg') && id.includes('fabric')) {
          return 'export default {}';
        }
        return null;
      },
    },
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
  optimizeDeps: {
    include: ['react-native-web', '@capacitor/core', 'buffer'],
    exclude: ['react-native-svg'],
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});

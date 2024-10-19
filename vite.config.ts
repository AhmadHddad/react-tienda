import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname, 'examples'), // Set the root directory to examples
  build: {
    rollupOptions: {
      input: path.resolve(__dirname, 'examples/index.html'), // Set the entry point for index.html
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'examples'),
    },
  },
});

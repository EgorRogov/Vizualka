import { defineConfig } from 'vite';
import reactPlugin from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  root: resolve(__dirname, 'src'), 
  plugins: [reactPlugin({})],
});
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages friendly: relative base so it works under /solo-blaster/
export default defineConfig({
  base: './',
  plugins: [react()],
});

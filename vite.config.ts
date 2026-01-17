import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // This ensures legacy process.env calls don't break the app, 
    // though we migrated to import.meta.env
    'process.env': {}
  }
});
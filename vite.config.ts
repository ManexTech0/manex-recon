import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // If process.env.API_KEY is undefined, default to an empty string to prevent build issues.
    // The app will check for the key at runtime.
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || ""),
    'process.env': {} 
  }
});
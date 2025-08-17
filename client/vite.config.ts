import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' // Import the path module

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // This section solves the "@/components" error
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },

  // This section correctly sets the output directory
  build: {
    outDir: '../dist/public'
  }
})
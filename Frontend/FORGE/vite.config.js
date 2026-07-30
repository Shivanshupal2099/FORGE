import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  
  build: {
    // Chunk file naming for better caching
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    // Optimize chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Source maps for production debugging
    sourcemap: false,
    // Minify CSS
    cssMinify: true,
  },
  
  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      'axios',
      'socket.io-client',
    ],
    exclude: ['mapbox-gl'], // Mapbox has its own bundling
  },
  
  // Development server configuration
  server: {
    port: 5173,
    host: '0.0.0.0',
    strictPort: false,
    // Enable HMR
    hmr: {
      overlay: true,
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
      clientPort: 5173,
    },
    watch: {
      usePolling: false,
    },
  },
  
  // Preview server configuration
  preview: {
    port: 4173,
    host: '0.0.0.0',
  },
})

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  
  // Optimize dependencies
  optimizeDeps: {
    exclude: ['lucide-react'], // Keeps lucide-react from being optimized (good for dynamic icons)
    include: ['react', 'react-dom', 'react-router-dom'] // Explicitly include core dependencies
  },

  // Development server configuration
  server: {
    port: 5173,
    strictPort: true, // Fail if port is unavailable
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // Your Spring Boot backend
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '') // Remove /api prefix when proxying
      }
    },
    open: true // Automatically open browser on dev server start
  },

  // Build configuration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: true, // Helpful for debugging
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          router: ['react-router-dom'],
          vendor: ['axios', 'bootstrap']
        }
      }
    }
  },

  // Preview configuration
  preview: {
    port: 5173,
    strictPort: true
  }
});
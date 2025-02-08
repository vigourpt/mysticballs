import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { PRODUCTION_CONFIG } from './src/config/production';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['react', 'react-dom']
  },
  resolve: {
    alias: {
      'react': 'react',
      'react-dom': 'react-dom'
    }
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-stripe': ['@stripe/stripe-js'],
          'vendor-ui': ['lucide-react']
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: PRODUCTION_CONFIG.ENABLE_PERFORMANCE_MONITORING ? false : true,
        drop_debugger: true
      }
    }
  },
  server: {
    hmr: {
      overlay: true
    },
    headers: PRODUCTION_CONFIG.ENABLE_CSP ? {
      'Content-Security-Policy': [
        'default-src self',
        'script-src self unsafe-inline',
        `connect-src self ${PRODUCTION_CONFIG.API_URL} https://api.openai.com`
      ].join('; ')
    } : undefined
  },
  // Enable service worker in production
  worker: {
    format: 'es',
    plugins: []
  }
});
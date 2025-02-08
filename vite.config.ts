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
    headers: {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://supabase.com",
        "connect-src 'self' https://api.openai.com https://api.stripe.com https://js.stripe.com wss://realtime.supabase.co https://*.supabase.co https://supabase.com https://*.openai.com",
        "frame-src 'self' https://js.stripe.com",
        "img-src 'self' data: https:",
        "style-src 'self' 'unsafe-inline'",
        "font-src 'self' data:",
        "worker-src 'self' blob:",
        "manifest-src 'self'"
      ].join('; ')
    }
  },
  // Enable service worker in production
  worker: {
    format: 'es'
  }
});
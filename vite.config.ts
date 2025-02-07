import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { PRODUCTION_CONFIG } from './src/config/production';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react()
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          stripe: ['@stripe/stripe-js'],
          supabase: ['@supabase/supabase-js'],
          openai: ['openai']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  server: {
    headers: {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' https: data:",
        "connect-src 'self' https://api.openai.com https://*.supabase.co https://api.stripe.com",
        "frame-src 'self' https://js.stripe.com",
        "font-src 'self' data:",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "upgrade-insecure-requests"
      ].join('; ')
    }
  }
});
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
    proxy: {
      '/.netlify/functions': {
        target: 'http://localhost:8888',
        changeOrigin: true,
        rewrite: (path) => path
      }
    },
    headers: {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co https://*.supabase.in https://accounts.google.com https://js.stripe.com https://cdn.jsdelivr.net https://unpkg.com https://*.hcaptcha.com https://hcaptcha.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://js.stripe.com",
        "img-src 'self' data: https://*.stripe.com https://*.supabase.co https://q.stripe.com https://qr.stripe.com https://b.stripecdn.com https://files.stripe.com https://stripe-camo.global.ssl.fastly.net https://d1wqzb5bdbcre6.cloudfront.net https://m.stripe.network https://m.stripe.com",
        "font-src 'self' https://fonts.gstatic.com",
        "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.supabase.in https://api.stripe.com https://js.stripe.com https://api.openai.com https://*.hcaptcha.com https://api.hcaptcha.com",
        "frame-src 'self' https://*.stripe.com https://js.stripe.com https://*.hcaptcha.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'"
      ].join('; ')
    }
  },
  // Enable service worker in production
  worker: {
    format: 'es'
  }
});
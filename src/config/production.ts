export const PRODUCTION_CONFIG = {
  // Base URLs
  APP_URL: 'https://mysticballs.com',
  API_URL: 'https://mysticballs.com/api',
  
  // Feature flags
  ENABLE_ANALYTICS: true,
  ENABLE_ERROR_TRACKING: true,
  ENABLE_PERFORMANCE_MONITORING: true,
  
  // Rate limiting
  MAX_REQUESTS_PER_MINUTE: 60,
  MAX_READINGS_PER_DAY: 100,
  
  // Cache settings
  CACHE_DURATION: 3600, // 1 hour in seconds
  ENABLE_SERVICE_WORKER: true,
  
  // Security
  ENABLE_CSP: true,
  CSP_DIRECTIVES: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://js.stripe.com'],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'https:', 'data:'],
    'connect-src': [
      "'self'",
      'https://api.openai.com',
      'https://*.supabase.co',
      'https://api.stripe.com'
    ],
    'frame-src': ["'self'", 'https://js.stripe.com'],
    'font-src': ["'self'", 'data:'],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"]
  },
  
  // Error tracking
  ERROR_SAMPLE_RATE: 0.1, // Sample 10% of errors
  
  // Performance
  PERFORMANCE_BUDGET: {
    FCP: 1500, // First Contentful Paint (ms)
    LCP: 2500, // Largest Contentful Paint (ms)
    FID: 100,  // First Input Delay (ms)
    CLS: 0.1   // Cumulative Layout Shift
  }
};

// Validation function for production settings
export const validateProductionConfig = () => {
  const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_STRIPE_PUBLISHABLE_KEY',
    'VITE_OPENAI_API_KEY'
  ];

  const missingVars = requiredEnvVars.filter(
    varName => !import.meta.env[varName]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }
};
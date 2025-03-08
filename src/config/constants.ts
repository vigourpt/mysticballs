export const FREE_READINGS_LIMIT = 5; // Total free readings (2 anonymous + 3 after login)
export const ANONYMOUS_FREE_READINGS_LIMIT = 2; // Free readings for non-authenticated users
export const ADMIN_EMAIL = 'vigourpt@googlemail.com'; // Admin user email
export const PRODUCTION_URL = 'https://mysticballs.com';

// Add test mode flag (reads from localStorage if available)
export const STRIPE_TEST_MODE = 
  typeof window !== 'undefined' && 
  localStorage.getItem('STRIPE_TEST_MODE') === 'true';

// Test price IDs from your Stripe test dashboard
export const TEST_PRICE_IDS = {
  basic: 'price_1R0CJxG3HGXKeksqy7NYmuh8',
  premium: 'price_1R0CKrG3HGXKeksqjeKEA1ox'
};

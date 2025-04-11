/**
 * Utility functions for API calls
 */

// Determine if we're in development mode
const isDevelopment = import.meta.env.DEV;

/**
 * Get the base URL for API calls
 * In development, we use the local functions server
 * In production, we use the Netlify functions
 */
export const getApiUrl = (path: string): string => {
  // In development, use the local functions server
  if (isDevelopment) {
    // Use localhost:9000 for the functions server
    return `http://localhost:9000${path}`;
  }
  
  // In production, use the Netlify functions
  return path;
};

import { supabaseClient } from './supabaseClient';

// Enhanced Supabase client with better error handling
const enhancedSupabaseClient = {
  // Original client for direct access when needed
  _client: supabaseClient,
  
  // Auth methods with enhanced error handling
  auth: {
    ...supabaseClient.auth,
    
    // Enhanced get session method with retry
    getSession: async (retryCount = 3) => {
      let lastError = null;
      
      for (let attempt = 0; attempt <= retryCount; attempt++) {
        try {
          const result = await supabaseClient.auth.getSession();
          
          if (result.error) {
            lastError = result.error;
            console.warn(`Get session attempt ${attempt + 1}/${retryCount + 1} failed:`, result.error);
            
            if (attempt < retryCount) {
              // Wait a bit before trying again
              const delay = Math.min(100 * Math.pow(2, attempt), 2000) + Math.random() * 100;
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }
          } else {
            return result;
          }
        } catch (error) {
          lastError = error;
          console.error(`Unexpected error during session retrieval attempt ${attempt + 1}/${retryCount + 1}:`, error);
          
          if (attempt < retryCount) {
            const delay = Math.min(100 * Math.pow(2, attempt), 2000) + Math.random() * 100;
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }
      }
      
      // If we get here, all attempts failed
      return { data: { session: null }, error: lastError };
    },
  },
  
  // Pass-through for database operations
  from: (table: string) => supabaseClient.from(table),
  
  // Pass-through for storage operations
  storage: supabaseClient.storage,

  // Pass-through for functions
  functions: supabaseClient.functions,
};

export default enhancedSupabaseClient;

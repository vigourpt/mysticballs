import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';
import { PRODUCTION_URL } from '../config/constants';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Get the site URL based on environment
const siteUrl = import.meta.env.DEV ? 'http://localhost:5173' : PRODUCTION_URL;

// Create Supabase client with PKCE flow
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storage: localStorage,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    debug: true // Enable debug mode to log auth operations
  },
  global: {
    headers: {
      'x-site-url': siteUrl
    }
  }
});

// Log the Supabase client configuration
console.log('Supabase client initialized with flowType:', 'pkce');

type Tables = Database['public']['Tables'];
export type UserProfile = Tables['user_profiles']['Row'];
export type Subscription = Tables['subscriptions']['Row'];

export const signInWithGoogle = async () => {
  try {
    return await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: siteUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    });
  } catch (error: unknown) {
    console.error('Google sign in error:', error);
    throw error;
  }
};

// Generate a random code verifier for PKCE flow
const generateCodeVerifier = () => {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  return Array.from(array, (byte) => ('0' + (byte & 0xFF).toString(16)).slice(-2)).join('');
};

// Store the code verifier in localStorage and on the server
const storeCodeVerifier = async (email: string, codeVerifier: string) => {
  // Store locally
  localStorage.setItem('pkce_code_verifier', codeVerifier);
  sessionStorage.setItem('pkce_code_verifier', codeVerifier);
  document.cookie = `pkce_code_verifier=${codeVerifier};path=/;max-age=3600;SameSite=Lax`;
  
  // Store on the server
  try {
    const response = await fetch('/.netlify/functions/store-code-verifier', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, codeVerifier })
    });
    
    if (!response.ok) {
      console.error('Failed to store code verifier on server:', await response.text());
    }
  } catch (error) {
    console.error('Error storing code verifier on server:', error);
  }
};

// Retrieve the code verifier from the server with retry logic
export const getCodeVerifierFromServer = async (email: string): Promise<string | null> => {
  try {
    // Import the retryFetch utility
    const { retryFetch } = await import('../utils/retryFetch');
    
    // Use retryFetch with 3 retries (4 total attempts)
    const response = await retryFetch(
      `/.netlify/functions/get-code-verifier?email=${encodeURIComponent(email)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      },
      3 // Max retries
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to retrieve code verifier from server (Status: ${response.status}):`, errorText);
      return null;
    }
    
    const data = await response.json();
    if (!data.codeVerifier) {
      console.warn('Code verifier was retrieved but is empty or null');
    }
    return data.codeVerifier || null;
  } catch (error) {
    console.error('Error retrieving code verifier from server after retries:', error);
    return null;
  }
};

export const signUpWithEmail = async (email: string, password: string) => {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  try {
    // Supabase handles PKCE flow automatically when using signUp
    // We just need to ensure we're using the correct flowType in the client config
    console.log('Signing up with email:', email);
    
    // Generate and store the code verifier
    const codeVerifier = generateCodeVerifier();
    await storeCodeVerifier(email.trim(), codeVerifier);
    console.log('Generated and stored code verifier for PKCE flow');
    
    // Use the standard redirect URL (without code_verifier in the URL)
    const redirectTo = `${siteUrl}/auth/callback`;
    
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password,
      options: {
        emailRedirectTo: redirectTo,
        data: {
          email: email.trim(),
          email_confirmed: false
        }
      }
    });
    
    console.log('Sign up response:', data, error);

    if (error) throw error;

    // Check if user already exists
    if (data?.user?.identities?.length === 0) {
      throw new Error('This email is already registered. Please sign in instead.');
    }

    // Check if email confirmation is required
    if (!data.session) {
      // Return special flag to indicate email confirmation needed
      return { ...data, requiresEmailConfirmation: true };
    }

    return data;
  } catch (error: unknown) {
    console.error('Email sign up error:', error);
    throw error;
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password
    });

    if (error) throw error;
    return data;
  } catch (error: unknown) {
    console.error('Email sign in error:', error);
    let errorMessage = 'Failed to sign in with email';
    if (error instanceof Error) {
      errorMessage = error.message || errorMessage;
    }
    throw new Error(errorMessage);
  }
};

// User Profile Management
export const createUserProfile = async (userId: string, email: string, displayName?: string): Promise<UserProfile | null> => {
  const profile: Tables['user_profiles']['Insert'] = {
    id: userId,
    email,
    display_name: displayName || null,
    readings_count: 0,
    is_premium: false,
    is_admin: false,
    last_reading_date: null,
    plan_type: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('user_profiles')
    .insert([profile])
    .select()
    .single();

  if (error) {
    console.error('Error creating user profile:', error);
    return null;
  }

  return data;
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select()
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error getting user profile:', error);
    return null;
  }

  return data;
};

export const incrementReadingCount = async (userId: string): Promise<void> => {
  const { error } = await supabase.rpc('increment_reading_count', {
    p_id: userId
  });

  if (error) {
    console.error('Error incrementing reading count:', error);
    throw error;
  }
};

export const updatePremiumStatus = async (userId: string, isPremium: boolean): Promise<void> => {
  const { error } = await supabase
    .from('user_profiles')
    .update({
      is_premium: isPremium,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  if (error) {
    console.error('Error updating premium status:', error);
    throw error;
  }
};

// Subscription Management Functions
export const getSubscription = async (userId: string): Promise<Subscription | null> => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No subscription found
        return null;
      }
      console.error('Error getting subscription:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getSubscription:', error);
    throw error;
  }
};

export const cancelSubscription = async (subscriptionId: string): Promise<void> => {
  try {
    // Get the auth token
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    
    if (!token) {
      throw new Error('Authentication token not found. Please sign in again.');
    }
    
    // Call the Netlify function to cancel the subscription
    const response = await fetch('/.netlify/functions/cancel-subscription', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ subscriptionId })
    });
    
    if (!response.ok) {
      let errorText;
      try {
        const errorJson = await response.json();
        errorText = errorJson.error || `HTTP error ${response.status}`;
      } catch (e) {
        errorText = await response.text();
      }
      
      throw new Error(`Failed to cancel subscription: ${errorText}`);
    }
    
    // The webhook will handle updating the database
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
};

export const updateSubscriptionPaymentMethod = async (subscriptionId: string, paymentMethodId: string): Promise<void> => {
  try {
    // Get the auth token
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    
    if (!token) {
      throw new Error('Authentication token not found. Please sign in again.');
    }
    
    // Call the Netlify function to update the payment method
    const response = await fetch('/.netlify/functions/update-payment-method', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ subscriptionId, paymentMethodId })
    });
    
    if (!response.ok) {
      let errorText;
      try {
        const errorJson = await response.json();
        errorText = errorJson.error || `HTTP error ${response.status}`;
      } catch (e) {
        errorText = await response.text();
      }
      
      throw new Error(`Failed to update payment method: ${errorText}`);
    }
  } catch (error) {
    console.error('Error updating payment method:', error);
    throw error;
  }
};

export const updateUserReadingsCount = async (userId: string, additionalReadings: number): Promise<void> => {
  if (additionalReadings <= 0) return;

  try {
    // First get the current profile
    const profile = await getUserProfile(userId);
    
    if (!profile) {
      console.error('Profile not found for user:', userId);
      return;
    }
    
    // Update the readings count
    const { error } = await supabase
      .from('user_profiles')
      .update({
        readings_count: profile.readings_count + additionalReadings,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating readings count:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in updateUserReadingsCount:', error);
    throw error;
  }
};

export const clearAllAuthState = async () => {
  try {
    // Clear Supabase session
    await supabase.auth.signOut();
    
    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear any cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    // Force reload the page
    window.location.href = '/';
  } catch (error) {
    console.error('Error clearing auth state:', error);
    throw error;
  }
};

// Free readings management for non-signed-in users
export const getFreeReadingsRemaining = (): number => {
  try {
    // Check if we have a stored count in localStorage
    const usedReadings = localStorage.getItem('mysticballs_free_readings_used');
    const freeReadingsLimit = 2; // Non-signed-in users get 2 free readings
    
    if (usedReadings === null) {
      // First time user, initialize with 0 used readings
      localStorage.setItem('mysticballs_free_readings_used', '0');
      return freeReadingsLimit;
    }
    
    const usedCount = parseInt(usedReadings, 10);
    return Math.max(0, freeReadingsLimit - usedCount);
  } catch (error) {
    console.error('Error getting free readings count:', error);
    return 0; // Default to 0 if there's an error
  }
};

export const incrementFreeReadingUsed = (): number => {
  try {
    const usedReadings = localStorage.getItem('mysticballs_free_readings_used');
    const usedCount = usedReadings ? parseInt(usedReadings, 10) : 0;
    const newCount = usedCount + 1;
    
    localStorage.setItem('mysticballs_free_readings_used', newCount.toString());
    
    // Return remaining readings
    const freeReadingsLimit = 2;
    return Math.max(0, freeReadingsLimit - newCount);
  } catch (error) {
    console.error('Error incrementing free readings count:', error);
    return 0;
  }
};

// Get total readings remaining based on user status
export const getTotalReadingsRemaining = (user: any, profile: any): number => {
  if (!user) {
    // Non-signed-in user
    return getFreeReadingsRemaining();
  }
  
  // Signed-in user
  if (profile?.is_premium) {
    // Premium users have unlimited readings
    return Infinity;
  } else if (profile) {
    // Basic plan users get 50 readings per month
    const basicPlanLimit = 50;
    return Math.max(0, basicPlanLimit - (profile.readings_count || 0));
  } else {
    // Signed-in but no profile yet - they get 3 additional readings
    return 3;
  }
};

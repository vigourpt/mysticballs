import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';
import { PRODUCTION_URL } from '../config/constants';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Get the site URL based on environment
const siteUrl = import.meta.env.DEV ? 'http://localhost:5173' : PRODUCTION_URL;

// Create Supabase client with minimal config
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: window.localStorage,
    storageKey: 'mysticballs-auth-token',
    cookieOptions: {
      sameSite: 'Lax',
      secure: true
    }
  },
  global: {
    headers: {
      'X-Client-Info': 'mysticballs-web'
    }
  }
});

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
  } catch (error: any) {
    console.error('Google sign in error:', error);
    throw error;
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
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password,
      options: {
        emailRedirectTo: siteUrl,
        data: {
          email: email.trim(),
          email_confirmed: false
        }
      }
    });

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
  } catch (error: any) {
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
  } catch (error: any) {
    console.error('Email sign in error:', error);
    throw new Error(error.message || 'Failed to sign in with email');
  }
};

export const createUserProfile = async (userId: string, email: string, displayName: string | null) => {
  const now = new Date().toISOString();
  
  const profile = {
    user_id: userId,
    email,
    display_name: displayName ?? email.split('@')[0],
    readings_count: 0,
    is_premium: false,
    last_reading_date: null,
    created_at: now,
    updated_at: now
  };

  const { error } = await supabase
    .from('user_profiles')
    .insert([profile]);

  if (error) throw error;
};

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
};

export const incrementReadingCount = async (userId: string) => {
  try {
    const { error } = await supabase.rpc('increment_reading_count', {
      user_id: userId
    });

    if (error) throw error;
  } catch (error) {
    console.error('Reading count increment error:', error);
    throw error;
  }
};

export const updatePremiumStatus = async (userId: string, isPremium: boolean) => {
  const now = new Date().toISOString();
  
  const { error } = await supabase
    .from('user_profiles')
    .update({
      is_premium: isPremium,
      updated_at: now
    })
    .eq('user_id', userId);

  if (error) throw error;
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
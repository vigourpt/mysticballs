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
    site_url: siteUrl,
    // Add CSP-friendly configuration
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
  try {
    const now = new Date().toISOString();

    // First check if profile exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select()
      .eq('id', userId)
      .single();

    if (existingProfile) {
      return; // Profile already exists, no need to create
    }

    // Create new profile
    const { error } = await supabase
      .from('user_profiles')
      .insert({
        id: userId,
        email,
        display_name: displayName || email.split('@')[0],
        readings_count: 0,
        is_premium: false,
        last_reading_date: null,
        created_at: now,
        updated_at: now
      });

    if (error) {
      console.error('Database error creating profile:', error);
      throw error;
    }
  } catch (error: any) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select()
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Profile fetch error:', error);
    throw error;
  }
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
  try {
    const { error } = await supabase
      .from('users')
      .update({
        is_premium: isPremium,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Premium status update error:', error);
    throw error;
  }
};
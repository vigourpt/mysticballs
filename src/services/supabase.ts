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

// Create Supabase client with minimal config
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storage: localStorage,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'x-site-url': siteUrl
    }
  }
});

type Tables = Database['public']['Tables'];
export type UserProfile = Tables['user_profiles']['Row'];

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

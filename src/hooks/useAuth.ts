import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, createUserProfile } from '../services/supabase';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmEmail, setConfirmEmail] = useState(false);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (event === 'SIGNED_IN') {
        setUser(session?.user ?? null);
        setConfirmEmail(false);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setConfirmEmail(false);
      } else if (event === 'USER_UPDATED') {
        setUser(session?.user ?? null);
      }
      
      setLoading(false);
    });

    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session?.user) {
          setUser(session.user);
          setConfirmEmail(false);
        }
      } catch (err) {
        console.error('Error getting initial session:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      // Check if user exists first
      const { data: existingUser } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (existingUser?.user) {
        throw new Error('This email is already registered. Please sign in instead.');
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            email_confirmed: false
          }
        }
      });

      if (error) throw error;

      if (data?.user) {
        setConfirmEmail(true);
      }
    } catch (err) {
      console.error('Sign up error:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred during sign up');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) throw error;

      if (data?.user) {
        setUser(data.user);
        setConfirmEmail(false);
      }
    } catch (err) {
      console.error('Sign in error:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred during sign in');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Reset state
      setUser(null);
      setError(null);
      setConfirmEmail(false);
      
      return { success: true };
    } catch (err) {
      console.error('Sign out error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign out');
      throw err;
    }
  };

  const clearAllAuthState = () => {
    setUser(null);
    setLoading(false);
    setError(null);
    setConfirmEmail(false);
  };

  return {
    user,
    loading,
    error,
    confirmEmail,
    signUp,
    signIn,
    signOut,
    clearAllAuthState
  };
};

export default useAuth;
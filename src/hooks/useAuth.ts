import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmEmail, setConfirmEmail] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      if (event === 'SIGNED_IN') {
        setUser(session?.user ?? null);
        setConfirmEmail(false);
        setError(null);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setConfirmEmail(false);
        setError(null);
      } else if (event === 'USER_UPDATED') {
        setUser(session?.user ?? null);
        setError(null);
      }
    });

    // Get initial session
    const initializeAuth = async () => {
      if (!mounted) return;
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session?.user) {
          setUser(session.user);
          setConfirmEmail(false);
          setError(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize auth');
        setUser(null);
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      setConfirmEmail(false);

      // Create a redirect URL with the email parameter
      const redirectUrl = new URL(`${window.location.origin}/auth/callback`);
      redirectUrl.searchParams.append('email', email.trim());
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          emailRedirectTo: redirectUrl.toString(),
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
      setConfirmEmail(false);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) throw error;

      if (data?.user) {
        setUser(data.user);
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
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    confirmEmail,
    signUp,
    signIn,
    signOut
  };
};

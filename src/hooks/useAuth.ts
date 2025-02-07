import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, signInWithGoogle, signInWithEmail, signUpWithEmail, createUserProfile } from '../services/supabase';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    
    // Check for existing session
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (mounted) {
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (err) {
        console.error('Session check error:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to check session');
          setLoading(false);
        }
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (!mounted) return;
      
      setLoading(true);
      const user = session?.user;
      
      try {
        if (event === 'SIGNED_IN' && user) {
          await createUserProfile(
            user.id,
            user.email ?? '',
            user.user_metadata?.full_name ?? user.user_metadata?.name ?? null
          );
          setUser(user);
        } else if (event === 'SIGNED_OUT') {
          localStorage.removeItem('supabase.auth.token');
          setUser(null);
        } else {
          setUser(user);
        }
      } catch (err) {
        console.error('Auth state change error:', err);
        setError(err instanceof Error ? err.message : 'Authentication error');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email?: string, password?: string) => {
    try {
      setError(null);
      setLoading(true);

      if (email && password) {
        await signInWithEmail(email, password);
      } else {
        await signInWithGoogle();
      }
    } catch (err) {
      console.error('Sign in error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign in');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      await signUpWithEmail(email, password);
    } catch (err) {
      console.error('Sign up error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign up');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear any cached data
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.clear();
      
      // Clear user state
      setUser(null);
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
    signIn,
    signUp,
    signOut
  };
};

export default useAuth;
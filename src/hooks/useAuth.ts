import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, createUserProfile } from '../services/supabase';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmEmail, setConfirmEmail] = useState(false);

  // Check initial session
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        setUser(session?.user ?? null);
      } catch (err) {
        console.error('Session check error:', err);
        setError(err instanceof Error ? err.message : 'Session check failed');
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (event === 'SIGNED_IN') {
          setUser(session?.user ?? null);
          setLoading(false);
          
          // Create profile if needed for OAuth users
          if (session?.user && session.user.app_metadata.provider !== 'email') {
            try {
              await createUserProfile(
                session.user.id,
                session.user.email ?? '',
                session.user.user_metadata?.full_name ?? session.user.user_metadata?.name ?? null
              );
            } catch (err) {
              console.error('Error creating profile for OAuth user:', err);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setLoading(false);
        } else if (event === 'USER_UPDATED') {
          setUser(session?.user ?? null);
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    setConfirmEmail(false);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            email_confirmed: false
          }
        }
      });

      if (error) throw error;

      // Check if user already exists
      if (data?.user?.identities?.length === 0) {
        throw new Error('Email already registered');
      }

      // If email confirmation is required
      if (!data.session) {
        setConfirmEmail(true);
        setLoading(false);
        return;
      }

      // If email confirmation is not required, create profile
      if (data.user) {
        try {
          await createUserProfile(
            data.user.id,
            data.user.email ?? '',
            data.user.user_metadata?.full_name ?? data.user.user_metadata?.name ?? null
          );
        } catch (profileError) {
          console.error('Error creating user profile:', profileError);
          // Don't throw here, we still want to set the user
        }
      }

      setUser(data.user);
      setLoading(false);
    } catch (err) {
      console.error('Sign up error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign up');
      setLoading(false);
      throw err;
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      setUser(data.user);
    } catch (err) {
      console.error('Sign in error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign in');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear any auth-related storage
      localStorage.removeItem('mysticballs-auth-token');
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.clear();
      
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

export default useAuth;
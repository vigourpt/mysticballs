import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, signInWithGoogle, signInWithEmail, signUpWithEmail, createUserProfile } from '../services/supabase';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const user = session?.user;
      setUser(user);

      if (event === 'SIGNED_IN' && user) {
        try {
          await createUserProfile(
            user.id,
            user.email ?? '',
            user.user_metadata.full_name ?? null
          );
        } catch (err) {
          console.error('Failed to create user profile:', err);
        }
      }
    });

    return () => {
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
      const message = err instanceof Error ? err.message : 'Failed to sign in';
      setError(message);
      throw new Error(message);
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
      const message = err instanceof Error ? err.message : 'Failed to sign up';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sign out';
      setError(message);
      throw new Error(message);
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
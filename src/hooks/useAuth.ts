import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { ADMIN_EMAIL } from '../config/constants';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmEmail, setConfirmEmail] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Function to check if user is admin from database
  const checkAdminStatus = async (currentUser: User | null) => {
    if (!currentUser) {
      setIsAdmin(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('is_admin')
        .eq('id', currentUser.id)
        .single();
        
      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        return;
      }
      
      setIsAdmin(!!data?.is_admin);
    } catch (err) {
      console.error('Error in checkAdminStatus:', err);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      if (event === 'SIGNED_IN') {
        const sessionUser = session?.user ?? null;
        setUser(sessionUser);
        setConfirmEmail(false);
        setError(null);
        
        // Check if user is admin
        if (sessionUser?.email === ADMIN_EMAIL) {
          setIsAdmin(true);
        } else {
          // Check database for admin status
          checkAdminStatus(sessionUser);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setConfirmEmail(false);
        setError(null);
        setIsAdmin(false);
      } else if (event === 'USER_UPDATED') {
        const updatedUser = session?.user ?? null;
        setUser(updatedUser);
        setError(null);
        
        // Check if user is admin
        if (updatedUser?.email === ADMIN_EMAIL) {
          setIsAdmin(true);
        } else {
          // Check database for admin status
          checkAdminStatus(updatedUser);
        }
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
          
          // Check if user is admin
          if (session.user.email === ADMIN_EMAIL) {
            setIsAdmin(true);
          } else {
            // Check database for admin status
            checkAdminStatus(session.user);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize auth');
        setUser(null);
        setIsAdmin(false);
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
    isAdmin,
    signUp,
    signIn,
    signOut
  };
};

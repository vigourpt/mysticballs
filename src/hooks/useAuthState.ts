import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: Error | null;
}

export const useAuthState = (): AuthState => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    // Check for email verification
    const params = new URLSearchParams(window.location.search);
    const isVerified = params.get('verified') === 'true';
    
    if (isVerified) {
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        if (session?.user) {
          setState({
            user: session.user,
            loading: false,
            error: null
          });
        }
      } else if (event === 'SIGNED_OUT') {
        setState({ user: null, loading: false, error: null });
      }
    });

    // Initial session check
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setState({
          user: session.user,
          loading: false,
          error: null
        });
      } else {
        setState({ user: null, loading: false, error: null });
      }
    };

    initSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return state;
};

export default useAuthState;
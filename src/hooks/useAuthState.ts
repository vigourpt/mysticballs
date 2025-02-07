import { useEffect } from 'react';
import { supabase, createUserProfile } from '../services/supabase';

export const useAuthState = () => {
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
        const user = session?.user;
        if (user) {
          try {
            // Create or update user profile
            await createUserProfile(
              user.id,
              user.email ?? '',
              user.user_metadata.full_name ?? null
            );

            // If user just verified their email, show payment modal
            if (isVerified) {
              window.location.href = `${window.location.origin}/?showPayment=true`;
            }
          } catch (error) {
            console.error('Failed to create/update user profile:', error);
          }
        }
      }
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);
};

export default useAuthState;
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { UserProfile } from '../types';

interface SubscriptionData {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  plan_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

interface UserContextType {
  user: User | null;
  profile: UserProfile | null;
  subscription: SubscriptionData | null;
  loading: boolean;
  refreshUserData: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  profile: null,
  subscription: null,
  loading: true,
  refreshUserData: async () => {},
  refreshProfile: async () => {},
  refreshSubscription: async () => {},
  signOut: async () => {},
});

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from Supabase
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data as UserProfile;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  };

  // Fetch user subscription from Supabase
  const fetchUserSubscription = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (error) {
        if (error.code !== 'PGRST116') { // PGRST116 is "no rows returned" which is expected if no subscription
          console.error('Error fetching user subscription:', error);
        }
        return null;
      }

      return data as SubscriptionData;
    } catch (error) {
      console.error('Error in fetchUserSubscription:', error);
      return null;
    }
  };

  // Refresh user data (profile and subscription)
  const refreshUserData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Refresh profile
      await refreshProfile();
      
      // Refresh subscription
      await refreshSubscription();
    } catch (error) {
      console.error('Error refreshing user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh user profile
  const refreshProfile = async () => {
    if (!user) return;

    try {
      const profileData = await fetchUserProfile(user.id);
      if (profileData) {
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  // Refresh user subscription
  const refreshSubscription = async () => {
    if (!user) return;

    try {
      const subscriptionData = await fetchUserSubscription(user.id);
      setSubscription(subscriptionData);
    } catch (error) {
      console.error('Error refreshing subscription:', error);
    }
  };

  // Sign out user
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setProfile(null);
      setSubscription(null);
      
      // Clear any local storage items that might be persisting user state
      localStorage.removeItem('supabase.auth.token');
      
      // Force reload to clear any cached state
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Initialize user session
  useEffect(() => {
    const initSession = async () => {
      try {
        setLoading(true);
        
        // Check for existing session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          return;
        }
        
        if (session) {
          setUser(session.user);
          
          // Fetch user profile
          const profileData = await fetchUserProfile(session.user.id);
          if (profileData) {
            setProfile(profileData);
          }
          
          // Fetch user subscription
          const subscriptionData = await fetchUserSubscription(session.user.id);
          if (subscriptionData) {
            setSubscription(subscriptionData);
          }
        }
      } catch (error) {
        console.error('Error initializing session:', error);
      } finally {
        setLoading(false);
      }
    };
    
    initSession();
    
    // Check URL parameters for session reset
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('reset_session') === 'true') {
      signOut();
    }
  }, []);

  // Set up auth state change listener
  useEffect(() => {
    // Set up auth state change listener
    const authListener = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setUser(session.user);
          
          // Fetch user profile
          const profileData = await fetchUserProfile(session.user.id);
          if (profileData) {
            setProfile(profileData);
          }
          
          // Fetch user subscription
          const subscriptionData = await fetchUserSubscription(session.user.id);
          if (subscriptionData) {
            setSubscription(subscriptionData);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setSubscription(null);
        }
      }
    );

    // Set up real-time subscription for user_profiles table
    const profileSubscription = supabase
      .channel('user_profiles_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_profiles',
          filter: user ? `id=eq.${user.id}` : undefined
        },
        async (payload: { new: Record<string, any>; old: Record<string, any> }) => {
          console.log('Profile change detected:', payload);
          if (user && payload.new && typeof payload.new === 'object' && 'id' in payload.new && payload.new.id === user.id) {
            setProfile(payload.new as UserProfile);
          }
        }
      )
      .subscribe();

    // Set up real-time subscription for subscriptions table
    const subscriptionsSubscription = supabase
      .channel('subscriptions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: user ? `user_id=eq.${user.id}` : undefined
        },
        async (payload: { new: Record<string, any>; old: Record<string, any> }) => {
          console.log('Subscription change detected:', payload);
          if (user && payload.new && typeof payload.new === 'object' && 
              'user_id' in payload.new && payload.new.user_id === user.id) {
            setSubscription(payload.new as SubscriptionData);
            
            // Update profile's is_premium status based on subscription
            if ('status' in payload.new && 'plan_id' in payload.new) {
              const isPremium = payload.new.status === 'active' && 
                              typeof payload.new.plan_id === 'string' && 
                              payload.new.plan_id.includes('premium');
              
              if (profile && profile.is_premium !== isPremium) {
                // Refresh the profile to get the updated premium status
                await refreshProfile();
              }
            }
          }
        }
      )
      .subscribe();

    // Clean up subscriptions
    return () => {
      // Remove auth listener
      authListener.data.subscription.unsubscribe();
      profileSubscription.unsubscribe();
      subscriptionsSubscription.unsubscribe();
    };
  }, [user?.id]);

  return (
    <UserContext.Provider
      value={{
        user,
        profile,
        subscription,
        loading,
        refreshUserData,
        refreshProfile,
        refreshSubscription,
        signOut
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
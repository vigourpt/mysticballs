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
}

export const UserContext = createContext<UserContextType>({
  user: null,
  profile: null,
  subscription: null,
  loading: true,
  refreshUserData: async () => {},
  refreshProfile: async () => {},
  refreshSubscription: async () => {},
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
        .single();

      if (error) {
        console.error('Error fetching user subscription:', error);
        return null;
      }

      return data as SubscriptionData;
    } catch (error) {
      console.error('Error in fetchUserSubscription:', error);
      return null;
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
      console.error('Error refreshing user profile:', error);
    }
  };

  // Refresh user subscription
  const refreshSubscription = async () => {
    if (!user) return;
    
    try {
      const subscriptionData = await fetchUserSubscription(user.id);
      if (subscriptionData) {
        setSubscription(subscriptionData);
        
        // Update profile's is_premium status based on subscription
        if (profile) {
          const isPremium = subscriptionData.status === 'active' && 
                           subscriptionData.plan_id.includes('premium');
          
          if (profile.is_premium !== isPremium) {
            // Update the profile if premium status has changed
            const { error } = await supabase
              .from('user_profiles')
              .update({ 
                is_premium: isPremium,
                plan_type: isPremium ? 'premium' : 'basic'
              })
              .eq('id', user.id);
            
            if (error) {
              console.error('Error updating user profile premium status:', error);
            } else {
              // Refresh the profile after updating
              await refreshProfile();
            }
          }
        }
      }
    } catch (error) {
      console.error('Error refreshing user subscription:', error);
    }
  };

  // Refresh all user data
  const refreshUserData = async () => {
    if (!user) return;
    
    try {
      await refreshProfile();
      await refreshSubscription();
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  // Initialize user, profile, and subscription
  useEffect(() => {
    const initializeUser = async () => {
      try {
        setLoading(true);
        
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
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
        console.error('Error initializing user:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeUser();

    // Set up auth state change listener
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
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
      authSubscription.unsubscribe();
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
        refreshSubscription
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '../services/supabase';
import { useAuthState } from '../hooks/useAuthState';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  is_premium: boolean;
  plan_type: string;
  subscription_id?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  plan_id?: string;
  status: string;
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface UserContextType {
  user: any;
  loading: boolean;
  profile: UserProfile | null;
  subscription: Subscription | null;
  isPremium: boolean;
  planType: string | null;
  remainingReadings: number;
  refreshProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  profile: null,
  subscription: null,
  isPremium: false,
  planType: null,
  remainingReadings: 0,
  refreshProfile: async () => {}
});

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const { user, loading } = useAuthState();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [realtimeSubscription, setRealtimeSubscription] = useState<RealtimeChannel | null>(null);
  const [remainingReadings, setRemainingReadings] = useState<number>(0);
  
  // Derived state
  const isPremium = profile?.is_premium || false;
  const planType = profile?.plan_type || null;

  // Function to fetch user profile and subscription data
  const refreshProfile = async () => {
    if (!user) {
      setProfile(null);
      setSubscription(null);
      return;
    }
    
    try {
      console.log('Fetching user profile data...');
      
      // Get user profile with subscription data
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          subscriptions:subscription_id (*)
        `)
        .eq('id', user.id)
        .single();
        
      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }
      
      console.log('User profile data:', data);
      
      // Update state with profile and subscription data
      setProfile(data);
      
      if (data.subscriptions) {
        setSubscription(data.subscriptions);
      }
      
      // Get remaining readings from readings table
      const { data: readingsData, error: readingsError } = await supabase
        .from('readings')
        .select('id')
        .eq('user_id', user.id)
        .eq('month', new Date().getMonth() + 1) // Current month (1-12)
        .eq('year', new Date().getFullYear());
        
      if (!readingsError && readingsData) {
        // If premium, set to unlimited, otherwise calculate based on plan
        if (data.is_premium) {
          setRemainingReadings(Infinity);
        } else {
          // Determine monthly limit based on plan type
          const monthlyLimit = data.plan_type === 'basic' ? 50 : 5; // 5 is free tier
          setRemainingReadings(Math.max(0, monthlyLimit - readingsData.length));
        }
      }
    } catch (err) {
      console.error('Error refreshing profile:', err);
    }
  };

  // Subscribe to profile changes
  const subscribeToProfileChanges = (userId: string) => {
    console.log('Setting up real-time subscription for profile changes...');
    
    // Unsubscribe from any existing subscription
    if (realtimeSubscription) {
      realtimeSubscription.unsubscribe();
    }
    
    // Create a new subscription for profile updates
    const subscription = supabase
      .channel(`profile-${userId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'user_profiles',
        filter: `id=eq.${userId}`
      }, (payload) => {
        console.log('Profile update received:', payload);
        // When profile is updated, refresh all profile data
        refreshProfile();
      })
      .subscribe();
      
    setRealtimeSubscription(subscription);
    return subscription;
  };

  // Initial profile fetch and subscription setup when user changes
  useEffect(() => {
    if (user) {
      refreshProfile();
      const subscription = subscribeToProfileChanges(user.id);
      
      return () => {
        // Clean up subscription on unmount or when user changes
        subscription.unsubscribe();
      };
    } else {
      // Reset state when logged out
      setProfile(null);
      setSubscription(null);
      
      if (realtimeSubscription) {
        realtimeSubscription.unsubscribe();
        setRealtimeSubscription(null);
      }
    }
  }, [user]);

  return (
    <UserContext.Provider 
      value={{ 
        user, 
        loading, 
        profile, 
        subscription,
        isPremium,
        planType,
        remainingReadings,
        refreshProfile
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the user context
export const useUser = () => useContext(UserContext);

export default UserContext;
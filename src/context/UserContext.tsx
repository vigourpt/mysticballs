import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js'; // Import Session
import { 
  supabase, 
  getFreeReadingsRemaining,
  getTotalReadingsRemaining, 
  syncAnonymousReadings,
  trackConversionEvent
} from '../services/supabase';
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
  session: Session | null; // Add session here
  subscription: SubscriptionData | null;
  loading: boolean;
  readingsRemaining: number;
  refreshUserData: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
  signOut: () => Promise<boolean>;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  profile: null,
  session: null, // Add session: null here
  subscription: null,
  loading: true,
  readingsRemaining: 0,
  refreshUserData: async () => {},
  refreshProfile: async () => {},
  refreshSubscription: async () => {},
  signOut: async () => true,
});

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null); // Add session state
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [readingsRemaining, setReadingsRemaining] = useState<number>(0);

  // Initialize free readings count for non-signed-in users
  useEffect(() => {
    const initFreeReadings = async () => {
      if (!user) {
        try {
          const freeReadings = await getFreeReadingsRemaining();
          setReadingsRemaining(freeReadings);
        } catch (error) {
          console.error('Error initializing free readings:', error);
          setReadingsRemaining(2); // Default fallback
        }
      }
    };
    
    initFreeReadings();
  }, [user]);

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

  // Sign out function
  const signOut = async () => {
    try {
      // Clear Supabase session
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out from Supabase:', error);
        throw error; 
      }
      
      // If Supabase signout is successful, the onAuthStateChange listener will handle clearing state.
      console.log('User signed out successfully');
      return true;
    } catch (error) {
      console.error('Error signing out:', error);
      // The error is re-thrown so the calling component can handle it.
      throw error;
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
          setSession(session); // Set session state here
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
          setSession(session); // Set session state here
          setUser(session.user);
          
          // Sync anonymous readings when user signs in
          try {
            await syncAnonymousReadings(session.user.id);
            console.log('Anonymous readings synced successfully');
          } catch (error) {
            console.error('Error syncing anonymous readings:', error);
          }
          
          // Fetch user profile
          const profileData = await fetchUserProfile(session.user.id);
          if (profileData) {
            setProfile(profileData);
            
            // Update readings remaining based on profile
            const totalReadings = getTotalReadingsRemaining(session.user, profileData);
            setReadingsRemaining(totalReadings);
          }
          
          // Fetch user subscription
          const subscriptionData = await fetchUserSubscription(session.user.id);
          if (subscriptionData) {
            setSubscription(subscriptionData);
          }
        } else if (event === 'SIGNED_OUT') {
          setSession(null); // Clear session state here
          setUser(null);
          setProfile(null);
          setSubscription(null);
        } else if (event === 'TOKEN_REFRESHED' && session) {
          setSession(session); // Update session state here
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

  // Update readings remaining whenever user or profile changes
  useEffect(() => {
    const updateReadingsRemaining = async () => {
      if (user && profile) {
        // For signed-in users with a profile
        const total = getTotalReadingsRemaining(user, profile);
        setReadingsRemaining(total);
      } else if (user) {
        // For signed-in users without a profile yet
        setReadingsRemaining(3); // New users get 3 free readings
      }
      // For non-signed-in users, handled by the initFreeReadings effect
    };
    
    updateReadingsRemaining();
  }, [user]);

  // Update readings remaining when profile changes
  useEffect(() => {
    if (user && profile) {
      const totalReadings = getTotalReadingsRemaining(user, profile);
      setReadingsRemaining(totalReadings);
    }
  }, [user, profile]);

  // Sync anonymous readings when a user signs in
  useEffect(() => {
    if (user?.id) {
      syncAnonymousReadings(user.id)
        .then(() => {
          // Track conversion event for sign in
          trackConversionEvent('sign_in', user.id);
        })
        .catch(error => {
          console.error('Error syncing anonymous readings:', error);
        });
    }
  }, [user?.id]);

  return (
    <UserContext.Provider
      value={{
        user,
        profile,
        session, // Expose session here
        subscription,
        loading,
        readingsRemaining,
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
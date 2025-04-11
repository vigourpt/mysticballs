// src/hooks/useSubscription.ts

import { useState, useEffect } from 'react';
import { supabaseClient } from '../lib/supabaseClient';
import { User } from '@supabase/supabase-js';

export type SubscriptionStatus = 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid';

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  status: SubscriptionStatus;
  plan_id: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Initialize - get current user and their subscription
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        // Get current session
        const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        if (!session?.user) {
          setLoading(false);
          return; // No authenticated user
        }
        
        setUser(session.user);
        
        // Fetch subscription for the user
        await fetchSubscription(session.user.id);
      } catch (err) {
        console.error('Error fetching user session:', err);
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchCurrentUser();
    
    // Listen for auth changes
    const { data: { subscription: authSubscription } } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          await fetchSubscription(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setSubscription(null);
        }
      }
    );
    
    return () => {
      authSubscription.unsubscribe();
    };
  }, []);

  // Setup realtime subscription to subscription changes
  useEffect(() => {
    if (!user) return;

    // Subscribe to changes in the subscription table for this user
    const subscriptionChannel = supabaseClient
      .channel('subscription-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${user.id}`
        },
        async (payload) => {
          console.log('Subscription changed:', payload);
          // Refresh subscription data
          await fetchSubscription(user.id);
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(subscriptionChannel);
    };
  }, [user]);

  // Fetch subscription data
  const fetchSubscription = async (userId: string) => {
    try {
      setLoading(true);
      
      const { data, error: subError } = await supabaseClient
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .maybeSingle();
      
      if (subError) {
        throw subError;
      }
      
      setSubscription(data);
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
    } finally {
      setLoading(false);
    }
  };

  // Check if user has an active subscription
  const hasActiveSubscription = (): boolean => {
    return !!subscription && subscription.status === 'active';
  };

  // Check if subscription is about to expire (within 7 days)
  const isSubscriptionEnding = (): boolean => {
    if (!subscription || !subscription.cancel_at_period_end) return false;
    
    const endDate = new Date(subscription.current_period_end);
    const now = new Date();
    const daysUntilEnd = Math.floor((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysUntilEnd <= 7;
  };

  // Calculate days remaining in subscription
  const daysRemaining = (): number | null => {
    if (!subscription) return null;
    
    const endDate = new Date(subscription.current_period_end);
    const now = new Date();
    return Math.max(0, Math.floor((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  };

  // Create a checkout session
  const createCheckoutSession = async (priceId: string, successUrl: string, cancelUrl: string) => {
    try {
      const { data: sessionData, error: sessionError } = await supabaseClient.functions.invoke(
        'create-checkout-session',
        {
          body: {
            priceId,
            successUrl,
            cancelUrl
          }
        }
      );
      
      if (sessionError) {
        throw sessionError;
      }
      
      return sessionData;
    } catch (err) {
      console.error('Error creating checkout session:', err);
      throw err;
    }
  };

  return {
    subscription,
    loading,
    error,
    hasActiveSubscription,
    isSubscriptionEnding,
    daysRemaining,
    createCheckoutSession,
    refreshSubscription: user ? () => fetchSubscription(user.id) : () => Promise.resolve()
  };
}

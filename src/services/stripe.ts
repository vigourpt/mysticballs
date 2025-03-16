import { loadStripe } from '@stripe/stripe-js';
import { STRIPE_CONFIG } from '../config/stripe';
import { supabase } from './supabase';

export const createCheckoutSession = async (priceId: string, userId: string, userEmail: string) => {
  try {
    console.log('Creating checkout session with:', { priceId, userId, userEmail });
    
    // Get the current session to retrieve the access token
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session || !session.access_token) {
      throw new Error('No active session found. Please log in again.');
    }
    
    // First, create a checkout session on the server
    const response = await fetch('/.netlify/functions/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        priceId,
        userId,
        userEmail,
        successUrl: `${window.location.origin}/payment/success?plan=basic`,
        cancelUrl: `${window.location.origin}/payment/cancel`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error creating checkout session:', errorData);
      throw new Error(errorData.error || 'Failed to create checkout session');
    }

    const { sessionId } = await response.json();
    
    // Initialize Stripe
    const stripe = await loadStripe(STRIPE_CONFIG.publishableKey);
    if (!stripe) {
      console.error('Stripe failed to load - publishable key may be invalid');
      throw new Error('Stripe failed to load');
    }

    console.log('Stripe loaded successfully, redirecting to checkout with session ID:', sessionId);
    
    // Redirect to the Stripe Checkout page
    const { error } = await stripe.redirectToCheckout({
      sessionId
    });

    if (error) {
      console.error('Stripe checkout error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};
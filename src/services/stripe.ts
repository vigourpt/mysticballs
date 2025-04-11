import { loadStripe } from '@stripe/stripe-js';
import { STRIPE_CONFIG } from '../config/stripe';
import { getApiUrl } from '../utils/api';

export const createCheckoutSession = async (priceId: string, userId: string, userEmail: string) => {
  try {
    console.log('Creating checkout session with:', { priceId, userId, userEmail });
    
    const token = localStorage.getItem('sb-access-token');
    if (!token) {
      throw new Error('User not authenticated');
    }
    
    // First, create a checkout session on the server
    const response = await fetch(getApiUrl('/.netlify/functions/create-checkout-session'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
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
import { loadStripe } from '@stripe/stripe-js';
import { STRIPE_CONFIG } from '../config/stripe';
import { getApiUrl } from '../utils/api';

export const createCheckoutSession = async (
  priceId: string,
  userId: string,
  userEmail: string,
  accessToken: string | null // Added parameter
) => {
  try {
    console.log('Creating checkout session with:', { priceId, userId, userEmail });

    if (!accessToken) {
      console.error('Access token is missing in createCheckoutSession');
      throw new Error('User not authenticated. Missing access token.');
    }
    
    // First, create a checkout session on the server
    const response = await fetch(getApiUrl('/.netlify/functions/create-checkout-session'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`, // Use the passed accessToken
      },
      body: JSON.stringify({
        priceId,
        userId,
        userEmail,
        successUrl: `${window.location.origin}/payment/success?plan=basic`, // Consider making plan dynamic if needed
        cancelUrl: `${window.location.origin}/payment/cancel`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error creating checkout session on server:', errorData); // Clarified log
      throw new Error(errorData.error || 'Failed to create checkout session on server'); // Clarified error
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
      throw error; // Re-throw Stripe's error object
    }
  } catch (error) { // Catch block for the entire function
    // Log the error if it's not already a detailed one from above
    if (!(error instanceof Error && error.message.includes('Failed to create checkout session on server')) && 
        !(error instanceof Error && error.message.includes('User not authenticated. Missing access token.')) &&
        !(error instanceof Error && error.message.includes('Stripe failed to load')) &&
        !(error.name === 'StripeCheckoutError') // Assuming Stripe error object has a name
    ) {
      // Added a check to see if error is an instance of Error before accessing error.name
      if (error instanceof Error && error.name === 'StripeCheckoutError') {
        // Already logged by Stripe checkout error
      } else {
        console.error('Unhandled error in createCheckoutSession:', error);
      }
    }
    // Re-throw the original error to be handled by the caller
    throw error;
  }
};
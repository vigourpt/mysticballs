import { loadStripe } from '@stripe/stripe-js';
import { STRIPE_CONFIG } from '../config/stripe';

export const createCheckoutSession = async (priceId: string, userId: string, userEmail: string) => {
  try {
    console.log('Creating checkout session with:', { priceId, userId, userEmail });
    
    // Initialize Stripe
    const stripe = await loadStripe(STRIPE_CONFIG.publishableKey);
    if (!stripe) {
      console.error('Stripe failed to load - publishable key may be invalid');
      throw new Error('Stripe failed to load');
    }

    console.log('Stripe loaded successfully, redirecting to checkout');
    
    // Create checkout session directly
    const { error } = await stripe.redirectToCheckout({
      lineItems: [{
        price: priceId,
        quantity: 1
      }],
      mode: 'subscription',
      successUrl: `${window.location.origin}/payment/success?plan=basic`,
      cancelUrl: `${window.location.origin}/payment/cancel`,
      customerEmail: userEmail,
      clientReferenceId: userId // Pass user ID as metadata
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
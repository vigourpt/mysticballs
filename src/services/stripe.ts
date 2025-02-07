import { loadStripe } from '@stripe/stripe-js';
import { STRIPE_CONFIG } from '../config/stripe';

export const createCheckoutSession = async (priceId: string, userId: string) => {
  try {
    // Initialize Stripe
    const stripe = await loadStripe(STRIPE_CONFIG.publishableKey);
    if (!stripe) throw new Error('Stripe failed to load');

    // Create checkout session directly
    const { error } = await stripe.redirectToCheckout({
      lineItems: [{
        price: priceId,
        quantity: 1
      }],
      mode: 'subscription',
      successUrl: `${window.location.origin}/payment/success`,
      cancelUrl: `${window.location.origin}/payment/cancel`,
      customerEmail: userId // Pass user ID as metadata
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};
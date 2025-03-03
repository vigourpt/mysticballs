# Payment Integration

## Overview

MYSTICBALLS uses Stripe for payment processing and subscription management. This document outlines the payment integration, subscription plans, and the implementation details for handling payments in the application.

## Subscription Model

MYSTICBALLS follows a freemium business model:

1. **Free Tier**: Users get a limited number of free readings (typically 3-5)
2. **Premium Tier**: Paid subscription with unlimited readings and additional features

### Subscription Plans

The subscription plans are defined in `src/config/plans.ts`:

```typescript
// src/config/plans.ts
export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  stripePriceId: string;
  popular?: boolean;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'monthly',
    name: 'Monthly Plan',
    description: 'Perfect for regular spiritual guidance',
    price: 9.99,
    interval: 'month',
    stripePriceId: process.env.NODE_ENV === 'production' 
      ? 'price_prod_monthly_id' 
      : 'price_test_monthly_id',
    features: [
      'Unlimited readings',
      'All reading types',
      'Priority support',
      'Reading history'
    ]
  },
  {
    id: 'yearly',
    name: 'Yearly Plan',
    description: 'Best value for dedicated seekers',
    price: 99.99,
    interval: 'year',
    stripePriceId: process.env.NODE_ENV === 'production' 
      ? 'price_prod_yearly_id' 
      : 'price_test_yearly_id',
    features: [
      'Unlimited readings',
      'All reading types',
      'Priority support',
      'Reading history',
      'Exclusive yearly insights',
      '2 months free'
    ],
    popular: true
  }
];
```

## Stripe Integration

### Setup and Configuration

The Stripe integration is configured in `src/config/stripe.ts`:

```typescript
// src/config/stripe.ts
import { loadStripe } from '@stripe/stripe-js';

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!STRIPE_PUBLISHABLE_KEY) {
  console.error('Missing Stripe publishable key');
}

export const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

export const STRIPE_CONFIG = {
  allowedCountries: ['US', 'CA', 'GB', 'AU', 'NZ', 'DE', 'FR'],
  allowedPaymentMethods: ['card'],
  billingAddressCollection: 'auto',
  defaultCurrency: 'usd'
};
```

### Stripe Service

The Stripe service handles client-side Stripe operations:

```typescript
// src/services/stripe.ts
import { stripePromise } from '../config/stripe';

export const redirectToCheckout = async (sessionId: string) => {
  try {
    const stripe = await stripePromise;
    if (!stripe) {
      throw new Error('Stripe failed to load');
    }
    
    const { error } = await stripe.redirectToCheckout({
      sessionId
    });
    
    if (error) {
      throw error;
    }
  } catch (err) {
    console.error('Stripe redirect error:', err);
    throw err;
  }
};

export const handleSubscriptionSuccess = async (sessionId: string) => {
  try {
    // Verify the session and update user status
    const response = await fetch('/.netlify/functions/verify-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sessionId })
    });
    
    if (!response.ok) {
      throw new Error('Failed to verify subscription');
    }
    
    return await response.json();
  } catch (err) {
    console.error('Subscription verification error:', err);
    throw err;
  }
};
```

## Payment Flow

### Client-Side Implementation

#### Payment Modal Component

The PaymentModal component displays subscription options and initiates the checkout process:

```typescript
// src/components/PaymentModal.tsx (simplified)
import React from 'react';
import { User } from '@supabase/supabase-js';
import { PRICING_PLANS, PricingPlan } from '../config/plans';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  user: User | null;
  onSubscribe: (plan: PricingPlan) => Promise<void>;
  remainingReadings: number;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  user,
  onSubscribe,
  remainingReadings
}) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubscribe = async (plan: PricingPlan) => {
    if (!user) {
      setError('You must be logged in to subscribe');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onSubscribe(plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process subscription');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Upgrade Your Spiritual Journey</h2>
        
        {remainingReadings === 0 ? (
          <p>You've used all your free readings. Upgrade to continue your spiritual journey.</p>
        ) : (
          <p>You have {remainingReadings} free readings remaining. Upgrade for unlimited access.</p>
        )}
        
        <div className="plans-container">
          {PRICING_PLANS.map((plan) => (
            <div 
              key={plan.id} 
              className={`plan-card ${plan.popular ? 'popular' : ''}`}
            >
              {plan.popular && <div className="popular-badge">Most Popular</div>}
              <h3>{plan.name}</h3>
              <p className="price">
                ${plan.price}
                <span>/{plan.interval}</span>
              </p>
              <p>{plan.description}</p>
              <ul>
                {plan.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe(plan)}
                disabled={isLoading}
                className="subscribe-button"
              >
                {isLoading ? 'Processing...' : `Subscribe ${plan.interval === 'month' ? 'Monthly' : 'Yearly'}`}
              </button>
            </div>
          ))}
        </div>
        
        {error && <p className="error">{error}</p>}
        
        <button onClick={onClose} className="close-button">
          Maybe Later
        </button>
      </div>
    </div>
  );
};

export default PaymentModal;
```

#### Subscription Handling in App Component

The App component handles the subscription process:

```typescript
// src/App.tsx (relevant part)
const handleSubscribe = async (plan: PricingPlan) => {
  try {
    const response = await fetch('/.netlify/functions/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId: plan.stripePriceId, customerId: user?.id })
    });
    const result = await response.json();
    
    if (result.error) {
      throw new Error(result.error);
    }
    
    if (result.url) {
      window.location.href = result.url;
    } else {
      throw new Error('No checkout URL returned');
    }
  } catch (err) {
    console.error('Error creating checkout session:', err);
    throw err;
  }
};
```

### Server-Side Implementation

#### Create Checkout Session Function

The Netlify function that creates a Stripe checkout session:

```typescript
// netlify/functions/create-checkout-session.ts
import { Handler } from '@netlify/functions';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { priceId, customerId } = JSON.parse(event.body || '{}');
    
    if (!priceId || !customerId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required parameters' })
      };
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', customerId)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'User profile not found' })
      };
    }

    // Check if user already has a Stripe customer ID
    let stripeCustomerId = profile.stripe_customer_id;

    if (!stripeCustomerId) {
      // Create a new Stripe customer
      const { data: userData } = await supabase.auth.admin.getUserById(customerId);
      
      if (!userData || !userData.user) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'User not found' })
        };
      }

      const customer = await stripe.customers.create({
        email: userData.user.email,
        metadata: {
          supabaseUserId: customerId
        }
      });

      stripeCustomerId = customer.id;

      // Update user profile with Stripe customer ID
      await supabase
        .from('user_profiles')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', customerId);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: `${process.env.URL || 'http://localhost:8888'}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.URL || 'http://localhost:8888'}/subscription-canceled`,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      customer_update: {
        address: 'auto'
      },
      metadata: {
        userId: customerId
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url })
    };
  } catch (error) {
    console.error('Stripe error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error' 
      })
    };
  }
};

export { handler };
```

#### Stripe Webhook Handler

A Netlify function to handle Stripe webhook events:

```typescript
// netlify/functions/stripe-webhook.ts
import { Handler } from '@netlify/functions';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

const handler: Handler = async (event) => {
  const stripeSignature = event.headers['stripe-signature'];
  
  if (!stripeSignature) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing Stripe signature' })
    };
  }

  try {
    // Verify the event
    const stripeEvent = stripe.webhooks.constructEvent(
      event.body || '',
      stripeSignature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );

    // Handle specific events
    switch (stripeEvent.type) {
      case 'checkout.session.completed': {
        const session = stripeEvent.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = stripeEvent.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = stripeEvent.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true })
    };
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return {
      statusCode: 400,
      body: JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Webhook error' 
      })
    };
  }
};

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  // Get the subscription
  if (!session.subscription || typeof session.subscription !== 'string') {
    console.error('No subscription in session');
    return;
  }

  const subscription = await stripe.subscriptions.retrieve(session.subscription);
  
  // Get the customer
  if (!session.customer || typeof session.customer !== 'string') {
    console.error('No customer in session');
    return;
  }

  // Get user ID from metadata
  const userId = session.metadata?.userId;
  if (!userId) {
    console.error('No userId in session metadata');
    return;
  }

  // Update user profile
  const { error } = await supabase
    .from('user_profiles')
    .update({
      is_premium: true,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  if (error) {
    console.error('Error updating user profile:', error);
    return;
  }

  // Create subscription record
  const { error: subscriptionError } = await supabase
    .from('subscriptions')
    .insert([
      {
        user_id: userId,
        stripe_customer_id: session.customer,
        stripe_subscription_id: subscription.id,
        plan_id: subscription.items.data[0].price.id,
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]);

  if (subscriptionError) {
    console.error('Error creating subscription record:', subscriptionError);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  // Get the customer
  if (!subscription.customer || typeof subscription.customer !== 'string') {
    console.error('No customer in subscription');
    return;
  }

  // Find user by Stripe customer ID
  const { data: profiles, error: profileError } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('stripe_customer_id', subscription.customer);

  if (profileError || !profiles || profiles.length === 0) {
    console.error('Error finding user profile:', profileError);
    return;
  }

  const userId = profiles[0].id;

  // Update subscription record
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Error updating subscription record:', error);
  }

  // Update user premium status based on subscription status
  const isPremium = subscription.status === 'active' || subscription.status === 'trialing';
  
  const { error: userError } = await supabase
    .from('user_profiles')
    .update({
      is_premium: isPremium,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  if (userError) {
    console.error('Error updating user premium status:', userError);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  // Get the customer
  if (!subscription.customer || typeof subscription.customer !== 'string') {
    console.error('No customer in subscription');
    return;
  }

  // Find user by Stripe customer ID
  const { data: profiles, error: profileError } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('stripe_customer_id', subscription.customer);

  if (profileError || !profiles || profiles.length === 0) {
    console.error('Error finding user profile:', profileError);
    return;
  }

  const userId = profiles[0].id;

  // Update subscription record
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      cancel_at_period_end: true,
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Error updating subscription record:', error);
  }

  // Update user premium status
  const { error: userError } = await supabase
    .from('user_profiles')
    .update({
      is_premium: false,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  if (userError) {
    console.error('Error updating user premium status:', userError);
  }
}

export { handler };
```

## Subscription Management

### Customer Portal

Users can manage their subscriptions through the Stripe Customer Portal:

```typescript
// netlify/functions/create-portal-session.ts
import { Handler } from '@netlify/functions';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { userId } = JSON.parse(event.body || '{}');
    
    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing userId parameter' })
      };
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (profileError || !profile || !profile.stripe_customer_id) {
      console.error('Error fetching user profile:', profileError);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'User profile or Stripe customer ID not found' })
      };
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${process.env.URL || 'http://localhost:8888'}/account`,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url })
    };
  } catch (error) {
    console.error('Stripe error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error' 
      })
    };
  }
};

export { handler };
```

### Subscription Status Check

The application checks the user's subscription status before allowing premium features:

```typescript
// src/hooks/useSubscription.ts
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabaseClient } from '../lib/supabaseClient';

export const useSubscription = (user: User | null) => {
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) {
        setIsPremium(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabaseClient
          .from('user_profiles')
          .select('is_premium')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        
        setIsPremium(data.is_premium);
      } catch (err) {
        console.error('Error checking subscription:', err);
        setError(err instanceof Error ? err.message : 'Failed to check subscription status');
        setIsPremium(false);
      } finally {
        setLoading(false);
      }
    };

    checkSubscription();
  }, [user]);

  return { isPremium, loading, error };
};
```

## Testing Stripe Integration

### Test Mode

During development, Stripe is used in test mode:

1. Use Stripe test API keys
2. Use test card numbers for payments:
   - 4242 4242 4242 4242 (Visa, successful payment)
   - 4000 0000 0000 0002 (Visa, declined payment)

### Webhook Testing

For local webhook testing, use the Stripe CLI:

```bash
stripe listen --forward-to http://localhost:8888/.netlify/functions/stripe-webhook
```

## Security Considerations

### API Key Security

- Stripe secret key is stored as an environment variable
- Never expose the secret key in client-side code
- Use Netlify Functions to handle sensitive operations

### Payment Data Security

- Never store credit card information
- Use Stripe Elements for secure payment form handling
- Implement proper HTTPS and Content Security Policy

### Fraud Prevention

- Implement rate limiting on checkout endpoints
- Monitor for suspicious activity
- Use Stripe's built-in fraud detection

## Conclusion

The payment integration in MYSTICBALLS provides a secure and seamless way for users to subscribe to premium features. By leveraging Stripe's robust payment infrastructure, the application can focus on providing value to users while ensuring secure and compliant payment processing.
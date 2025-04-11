// supabase/functions/create-checkout-session/index.ts

import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
// Use the full URL import and ignore potential TS resolution issues in editor
// @ts-ignore
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

interface RequestData {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get request body
    const { priceId, successUrl, cancelUrl } = await req.json() as RequestData;

    // Validate input
    if (!priceId || !successUrl || !cancelUrl) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters: priceId, successUrl, or cancelUrl' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error: Missing Supabase environment variables' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user ID from the token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Stripe
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') ?? '';
    if (!stripeSecretKey) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error: Missing Stripe secret key' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-01-27.acacia', // Use the compatible API version
    });

    // Get or create Stripe customer
    let stripeCustomerId: string;
    
    // Check if user already has a Stripe customer ID
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (subscription?.stripe_customer_id) {
      stripeCustomerId = subscription.stripe_customer_id;
    } else {
      // Get user profile to use name in Stripe
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle();

      // Create a new customer in Stripe
      const customer = await stripe.customers.create({
        email: user.email,
        name: profile?.full_name || undefined,
        metadata: {
          user_id: user.id
        }
      });
      
      stripeCustomerId = customer.id;
    }

    // Create checkout session with the customer
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      metadata: {
        user_id: user.id
      },
      subscription_data: {
        metadata: {
          user_id: user.id
        }
      }
    });

    // If we created a new customer, store their ID in our database
    if (!subscription?.stripe_customer_id) {
      await supabase.from('subscriptions').upsert({
        user_id: user.id,
        stripe_customer_id: stripeCustomerId,
        status: 'incomplete', // Will be updated by webhook when payment completes
        current_period_start: new Date().toISOString(),
        current_period_end: new Date().toISOString(),
        plan_id: priceId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    return new Response(
      JSON.stringify({ 
        url: session.url,
        sessionId: session.id
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

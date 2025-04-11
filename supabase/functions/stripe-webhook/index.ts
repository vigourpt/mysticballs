// supabase/functions/stripe-webhook/index.ts

import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
// @ts-ignore
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req: Request) => {
  try {
    // Get the Stripe webhook secret
    const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!stripeWebhookSecret) {
      console.error('Missing Stripe webhook secret');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500 }
      );
    }

    // Get Supabase credentials
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500 }
      );
    }

    // Initialize Stripe
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      console.error('Missing Stripe secret key');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-01-27.acacia', // Update to the compatible API version
    });

    // Get the signature from the headers
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return new Response(
        JSON.stringify({ error: 'Missing Stripe signature' }),
        { status: 400 }
      );
    }

    // Get the raw body content
    const body = await req.text();
    
    // Verify the webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        stripeWebhookSecret
      );
    } catch (err: any) {
      const errorMessage = err && typeof err === 'object' && 'message' in err 
        ? err.message 
        : 'Unknown error during webhook signature verification';
      console.error(`Webhook signature verification failed: ${errorMessage}`);
      return new Response(
        JSON.stringify({ error: `Webhook signature verification failed: ${errorMessage}` }),
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        
        // Extract customer and subscription IDs
        const stripeCustomerId = session.customer;
        const stripeSubscriptionId = session.subscription;
        const userId = session.metadata?.user_id || null;

        if (!stripeCustomerId || !stripeSubscriptionId) {
          console.error('Missing customer or subscription ID in checkout.session.completed event');
          break;
        }

        if (!userId) {
          // If user_id is not in metadata, try to find it in our database
          const { data: subData } = await supabase
            .from('subscriptions')
            .select('user_id')
            .eq('stripe_customer_id', stripeCustomerId)
            .maybeSingle();
          
          if (subData) {
            // Update the subscription with the new subscription ID
            await supabase
              .from('subscriptions')
              .update({
                stripe_subscription_id: stripeSubscriptionId,
                status: 'active',
                updated_at: new Date().toISOString()
              })
              .eq('stripe_customer_id', stripeCustomerId);

            // Also update the user's plan type
            await supabase
              .from('user_profiles')
              .update({
                plan_type: 'premium',  // Adjust based on your plan type naming
                updated_at: new Date().toISOString()
              })
              .eq('id', subData.user_id);
          } else {
            console.error('Could not find user associated with Stripe customer ID');
          }
        } else {
          // If we have the user_id in metadata, update directly
          await supabase
            .from('subscriptions')
            .upsert({
              user_id: userId,
              stripe_customer_id: stripeCustomerId,
              stripe_subscription_id: stripeSubscriptionId,
              status: 'active',
              current_period_start: new Date().toISOString(),
              current_period_end: new Date().toISOString(),  // This will be updated below
              updated_at: new Date().toISOString()
            });

          // Update user's plan type
          await supabase
            .from('user_profiles')
            .update({
              plan_type: 'premium',  // Adjust based on your plan type naming
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);
        }

        // Fetch subscription details from Stripe to get period dates
        if (stripeSubscriptionId && typeof stripeSubscriptionId === 'string') {
          const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
          if (subscription) {
            // Update with current period information
            await supabase
              .from('subscriptions')
              .update({
                current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                plan_id: subscription.items.data[0]?.price?.id || '',
                cancel_at_period_end: subscription.cancel_at_period_end,
                updated_at: new Date().toISOString()
              })
              .eq('stripe_subscription_id', stripeSubscriptionId);
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const stripeSubscriptionId = invoice.subscription;
        
        if (stripeSubscriptionId) {
          // Update subscription status
          await supabase
            .from('subscriptions')
            .update({
              status: 'past_due',
              updated_at: new Date().toISOString()
            })
            .eq('stripe_subscription_id', stripeSubscriptionId);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const stripeSubscriptionId = subscription.id;
        
        // Update subscription details
        await supabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', stripeSubscriptionId);
        
        // If status changed to active, ensure user_profile is updated too
        if (subscription.status === 'active') {
          const { data: subData } = await supabase
            .from('subscriptions')
            .select('user_id')
            .eq('stripe_subscription_id', stripeSubscriptionId)
            .maybeSingle();
          
          if (subData?.user_id) {
            await supabase
              .from('user_profiles')
              .update({
                plan_type: 'premium',  // Adjust based on your plan type naming
                updated_at: new Date().toISOString()
              })
              .eq('id', subData.user_id);
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const stripeSubscriptionId = subscription.id;
        
        // Get user associated with this subscription
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', stripeSubscriptionId)
          .maybeSingle();
        
        // Update subscription status
        await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', stripeSubscriptionId);
        
        // Downgrade user plan
        if (subData?.user_id) {
          await supabase
            .from('user_profiles')
            .update({
              plan_type: 'free',
              updated_at: new Date().toISOString()
            })
            .eq('id', subData.user_id);
        }
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500 }
    );
  }
});

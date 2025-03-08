// Initialize Stripe with the appropriate key based on the mode
let stripe;

// Function to initialize Stripe with the appropriate key
const initializeStripe = (isTestMode) => {
  // Try to get the requested key
  let secretKey = isTestMode 
    ? process.env.STRIPE_TEST_SECRET_KEY 
    : process.env.STRIPE_SECRET_KEY;
  
  // If no keys are available at all
  if (!secretKey) {
    throw new Error(`Stripe ${isTestMode ? 'test' : 'live'} secret key is missing. Please check your environment variables.`);
  }
  
  // Log which key we're using
  console.log(`Using Stripe ${isTestMode ? 'test' : 'live'} mode with key: ${secretKey.substring(0, 8)}...`);
  
  return require('stripe')(secretKey, {
    apiVersion: '2023-10-16', // Specify a stable API version
    timeout: 30000, // Increase timeout to 30 seconds
    maxNetworkRetries: 3 // Automatically retry failed requests
  });
};

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// CORS headers
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

exports.handler = async (event) => {
  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers
    };
  }

  try {
    // Check if we're in test mode
    const isTestMode = event.headers['x-stripe-test-mode'] === 'true';
    console.log('Stripe webhook mode:', isTestMode ? 'TEST' : 'LIVE');
    
    // Initialize Stripe with the appropriate key
    stripe = initializeStripe(isTestMode);
    
    // Verify the webhook signature
    const stripeSignature = event.headers['stripe-signature'];
    
    if (!stripeSignature) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing Stripe signature' })
      };
    }

    // Get the appropriate webhook secret based on mode
    const webhookSecret = isTestMode
      ? process.env.STRIPE_TEST_WEBHOOK_SECRET
      : process.env.STRIPE_WEBHOOK_SECRET;
      
    if (!webhookSecret) {
      console.error(`Stripe ${isTestMode ? 'test' : 'live'} webhook secret is missing`);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: `Stripe ${isTestMode ? 'test' : 'live'} webhook secret is missing. Please check your environment variables.` 
        })
      };
    }

    // Construct the Stripe event
    let stripeEvent;
    try {
      stripeEvent = stripe.webhooks.constructEvent(
        event.body,
        stripeSignature,
        webhookSecret
      );
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: `Webhook Error: ${err.message}` })
      };
    }

    console.log(`Received Stripe event: ${stripeEvent.type}`);

    // Handle different event types
    switch (stripeEvent.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(stripeEvent.data.object);
        break;
        
      case 'customer.subscription.created':
        await handleSubscriptionCreated(stripeEvent.data.object);
        break;
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(stripeEvent.data.object);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(stripeEvent.data.object);
        break;
        
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(stripeEvent.data.object);
        break;
        
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(stripeEvent.data.object);
        break;
        
      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ received: true })
    };
  } catch (err) {
    console.error(`Webhook error: ${err.message}`);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: `Webhook Error: ${err.message}` })
    };
  }
};

// Handler for checkout.session.completed event
async function handleCheckoutSessionCompleted(session) {
  try {
    console.log('Processing checkout.session.completed event');
    
    // Get customer and subscription IDs from the session
    const { customer, subscription, client_reference_id } = session;
    
    if (!client_reference_id) {
      console.error('No client_reference_id found in session');
      return;
    }
    
    // client_reference_id should be the user ID
    const userId = client_reference_id;
    
    // Get subscription details from Stripe
    const subscriptionData = await stripe.subscriptions.retrieve(subscription);
    const planId = subscriptionData.items.data[0].plan.id;
    
    // Check if a subscription record already exists for this user
    const { data: existingSubscriptions, error: queryError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId);
      
    if (queryError) {
      console.error('Error querying existing subscriptions:', queryError);
      return;
    }
    
    let subscriptionId;
    
    if (existingSubscriptions && existingSubscriptions.length > 0) {
      // Update existing subscription
      const { data, error } = await supabase
        .from('subscriptions')
        .update({
          stripe_customer_id: customer,
          stripe_subscription_id: subscription,
          plan_id: planId,
          status: subscriptionData.status,
          current_period_start: new Date(subscriptionData.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscriptionData.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscriptionData.cancel_at_period_end,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();
        
      if (error) {
        console.error('Error updating subscription:', error);
        return;
      }
      
      subscriptionId = data.id;
    } else {
      // Create new subscription
      const { data, error } = await supabase
        .from('subscriptions')
        .insert([{
          user_id: userId,
          stripe_customer_id: customer,
          stripe_subscription_id: subscription,
          plan_id: planId,
          status: subscriptionData.status,
          current_period_start: new Date(subscriptionData.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscriptionData.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscriptionData.cancel_at_period_end
        }])
        .select()
        .single();
        
      if (error) {
        console.error('Error creating subscription:', error);
        return;
      }
      
      subscriptionId = data.id;
    }
    
    // Update user profile to set premium status and link subscription
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        is_premium: true,
        subscription_id: subscriptionId,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
      
    if (updateError) {
      console.error('Error updating user profile:', updateError);
    }
    
    console.log(`Successfully processed checkout session for user ${userId}`);
  } catch (err) {
    console.error(`Error handling checkout.session.completed: ${err.message}`);
    throw err;
  }
}

// Handler for customer.subscription.created event
async function handleSubscriptionCreated(subscription) {
  try {
    console.log('Processing customer.subscription.created event');
    
    // Get customer ID from the subscription
    const { customer, id: subscriptionId } = subscription;
    
    // Find the user associated with this customer
    const { data: customers, error: customerError } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_customer_id', customer);
      
    if (customerError || !customers || customers.length === 0) {
      console.error('No user found for customer:', customer);
      return;
    }
    
    const userId = customers[0].user_id;
    
    // Update subscription details
    const { error } = await supabase
      .from('subscriptions')
      .update({
        stripe_subscription_id: subscriptionId,
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
      
    if (error) {
      console.error('Error updating subscription:', error);
    }
    
    console.log(`Successfully processed subscription created for user ${userId}`);
  } catch (err) {
    console.error(`Error handling customer.subscription.created: ${err.message}`);
    throw err;
  }
}

// Handler for customer.subscription.updated event
async function handleSubscriptionUpdated(subscription) {
  try {
    console.log('Processing customer.subscription.updated event');
    
    // Get subscription ID
    const { id: subscriptionId } = subscription;
    
    // Find the subscription record
    const { data: subscriptions, error: queryError } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_subscription_id', subscriptionId);
      
    if (queryError || !subscriptions || subscriptions.length === 0) {
      console.error('No subscription found with ID:', subscriptionId);
      return;
    }
    
    const userId = subscriptions[0].user_id;
    
    // Update subscription details
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscriptionId);
      
    if (error) {
      console.error('Error updating subscription:', error);
    }
    
    // Update user premium status based on subscription status
    const isPremium = subscription.status === 'active' || subscription.status === 'trialing';
    
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        is_premium: isPremium,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
      
    if (updateError) {
      console.error('Error updating user profile:', updateError);
    }
    
    console.log(`Successfully processed subscription update for user ${userId}`);
  } catch (err) {
    console.error(`Error handling customer.subscription.updated: ${err.message}`);
    throw err;
  }
}

// Handler for customer.subscription.deleted event
async function handleSubscriptionDeleted(subscription) {
  try {
    console.log('Processing customer.subscription.deleted event');
    
    // Get subscription ID
    const { id: subscriptionId } = subscription;
    
    // Find the subscription record
    const { data: subscriptions, error: queryError } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_subscription_id', subscriptionId);
      
    if (queryError || !subscriptions || subscriptions.length === 0) {
      console.error('No subscription found with ID:', subscriptionId);
      return;
    }
    
    const userId = subscriptions[0].user_id;
    
    // Update subscription status
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscriptionId);
      
    if (error) {
      console.error('Error updating subscription:', error);
    }
    
    // Update user premium status
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        is_premium: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
      
    if (updateError) {
      console.error('Error updating user profile:', updateError);
    }
    
    console.log(`Successfully processed subscription deletion for user ${userId}`);
  } catch (err) {
    console.error(`Error handling customer.subscription.deleted: ${err.message}`);
    throw err;
  }
}

// Handler for invoice.payment_succeeded event
async function handleInvoicePaymentSucceeded(invoice) {
  try {
    console.log('Processing invoice.payment_succeeded event');
    
    // Only process subscription invoices
    if (!invoice.subscription) {
      console.log('Not a subscription invoice, skipping');
      return;
    }
    
    // Get subscription ID
    const subscriptionId = invoice.subscription;
    
    // Find the subscription record
    const { data: subscriptions, error: queryError } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_subscription_id', subscriptionId);
      
    if (queryError || !subscriptions || subscriptions.length === 0) {
      console.error('No subscription found with ID:', subscriptionId);
      return;
    }
    
    const userId = subscriptions[0].user_id;
    
    // Get updated subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // Update subscription details
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscriptionId);
      
    if (error) {
      console.error('Error updating subscription:', error);
    }
    
    // Ensure user has premium status
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        is_premium: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
      
    if (updateError) {
      console.error('Error updating user profile:', updateError);
    }
    
    console.log(`Successfully processed invoice payment for user ${userId}`);
  } catch (err) {
    console.error(`Error handling invoice.payment_succeeded: ${err.message}`);
    throw err;
  }
}

// Handler for invoice.payment_failed event
async function handleInvoicePaymentFailed(invoice) {
  try {
    console.log('Processing invoice.payment_failed event');
    
    // Only process subscription invoices
    if (!invoice.subscription) {
      console.log('Not a subscription invoice, skipping');
      return;
    }
    
    // Get subscription ID
    const subscriptionId = invoice.subscription;
    
    // Find the subscription record
    const { data: subscriptions, error: queryError } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_subscription_id', subscriptionId);
      
    if (queryError || !subscriptions || subscriptions.length === 0) {
      console.error('No subscription found with ID:', subscriptionId);
      return;
    }
    
    const userId = subscriptions[0].user_id;
    
    // Get updated subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // Update subscription details
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: subscription.status,
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscriptionId);
      
    if (error) {
      console.error('Error updating subscription:', error);
    }
    
    // If subscription is past_due or unpaid, update user premium status
    if (subscription.status === 'past_due' || subscription.status === 'unpaid') {
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          is_premium: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
        
      if (updateError) {
        console.error('Error updating user profile:', updateError);
      }
    }
    
    console.log(`Successfully processed invoice payment failure for user ${userId}`);
  } catch (err) {
    console.error(`Error handling invoice.payment_failed: ${err.message}`);
    throw err;
  }
}

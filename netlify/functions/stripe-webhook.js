const stripePackage = require('stripe');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// CORS headers
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

// Function to initialize Stripe
const initializeStripe = (isTestMode) => {
  const secretKey = isTestMode ? process.env.STRIPE_TEST_SECRET_KEY : process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error(`Stripe ${isTestMode ? 'test' : 'live'} secret key is missing. Check env variables.`);
  }
  console.log(`✅ Using Stripe ${isTestMode ? 'TEST' : 'LIVE'} mode.`);
  return stripePackage(secretKey, {
    apiVersion: '2023-10-16',
    timeout: 30000,
    maxNetworkRetries: 3
  });
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  try {
    console.log('📩 Incoming Stripe Webhook Request');

    const rawBody = event.body;
    let rawEvent;
    try {
      rawEvent = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('❌ Error parsing webhook body:', parseError);
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
    }

    const isTestMode = rawEvent.livemode === false;
    const stripe = initializeStripe(isTestMode);
    const stripeSignature = event.headers['stripe-signature'];

    if (!stripeSignature) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing Stripe signature' }) };
    }

    const webhookSecret = isTestMode ? process.env.STRIPE_TEST_WEBHOOK_SECRET : process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error(`❌ Stripe ${isTestMode ? 'test' : 'live'} webhook secret is missing`);
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Webhook secret missing' }) };
    }

    let stripeEvent;
    try {
      stripeEvent = stripe.webhooks.constructEvent(rawBody, stripeSignature, webhookSecret);
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err.message);
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Webhook signature verification failed' }) };
    }

    console.log(`✅ Received Stripe event: ${stripeEvent.type}`);

    switch (stripeEvent.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(stripe, stripeEvent.data.object);
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionEvent(stripe, stripeEvent.type, stripeEvent.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handleInvoicePayment(stripeEvent.data.object);
        break;
      default:
        console.log(`⚠️ Unhandled event type: ${stripeEvent.type}`);
    }

    return { statusCode: 200, headers, body: JSON.stringify({ received: true }) };
  } catch (err) {
    console.error(`❌ Webhook error: ${err.message}`);
    return { statusCode: 500, headers, body: JSON.stringify({ error: `Webhook error: ${err.message}` }) };
  }
};

// ✅ **Handle Subscription Creation**
async function handleCheckoutSessionCompleted(stripe, session) {
  try {
    console.log('🔄 Processing checkout.session.completed');

    const { customer, subscription, client_reference_id } = session;
    if (!client_reference_id) {
      console.error('❌ Missing client_reference_id in session.');
      return;
    }

    console.log(`🔎 Fetching subscription details for ${subscription}`);
    const subscriptionData = await stripe.subscriptions.retrieve(subscription);

    console.log('✅ Retrieved Subscription Data:', subscriptionData);

    const { data: existingSubscription, error: queryError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', client_reference_id)
      .single();

    if (queryError && queryError.code !== 'PGRST116') {
      console.error('❌ Supabase Query Error:', queryError);
      return;
    }

    const subscriptionPayload = {
      user_id: client_reference_id,
      stripe_customer_id: customer,
      stripe_subscription_id: subscription,
      plan_id: subscriptionData.items.data[0].plan.id,
      status: subscriptionData.status,
      current_period_start: new Date(subscriptionData.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscriptionData.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscriptionData.cancel_at_period_end,
      updated_at: new Date().toISOString()
    };

    let response;
    if (existingSubscription) {
      console.log('Updating existing subscription for user:', client_reference_id);
      response = await supabase
        .from('subscriptions')
        .update(subscriptionPayload)
        .eq('user_id', client_reference_id);
    } else {
      console.log('Creating new subscription for user:', client_reference_id);
      response = await supabase
        .from('subscriptions')
        .insert([subscriptionPayload]);
    }

    if (response.error) {
      console.error('❌ Supabase Insert/Update Error:', response.error);
      return;
    }

    // Also update the user's premium status in their profile
    const isPremium = subscriptionData.items.data[0].plan.id.includes('premium');
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({
        is_premium: isPremium || subscriptionData.status === 'active',
        plan_type: isPremium ? 'premium' : 'basic',
        updated_at: new Date().toISOString()
      })
      .eq('id', client_reference_id);

    if (profileError) {
      console.error('❌ Error updating user profile premium status:', profileError);
    } else {
      console.log(`✅ Updated premium status for user ${client_reference_id}`);
    }

    console.log(`✅ Subscription processed successfully for user ${client_reference_id}`);
  } catch (err) {
    console.error(`❌ Error in handleCheckoutSessionCompleted: ${err.message}`);
  }
}

// ✅ **Handle Subscription Updates & Cancellations**
async function handleSubscriptionEvent(stripe, eventType, subscription) {
  try {
    console.log(`🔄 Processing ${eventType} event for subscription ${subscription.id}`);

    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_subscription_id', subscription.id)
      .single();

    if (!existingSubscription) {
      console.error('❌ Subscription not found in database:', subscription.id);
      return;
    }

    const subscriptionUpdatePayload = {
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString()
    };

    // Update the subscription in the database
    // This will trigger the real-time subscription event
    const { error } = await supabase
      .from('subscriptions')
      .update(subscriptionUpdatePayload)
      .eq('stripe_subscription_id', subscription.id);
      
    if (error) {
      console.error('❌ Supabase Update Error:', error);
      return;
    }

    console.log(`✅ Processed ${eventType} for subscription ${subscription.id}`);
    
    // If it's a status update to 'active', also update the user's premium status
    if (subscription.status === 'active' && existingSubscription.user_id) {
      const isPremium = subscription.plan && subscription.plan.id && subscription.plan.id.includes('premium');
      
      // Update the user profile with premium status
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          is_premium: isPremium || subscription.status === 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSubscription.user_id);
        
      if (profileError) {
        console.error('❌ Error updating user profile premium status:', profileError);
      } else {
        console.log(`✅ Updated premium status for user ${existingSubscription.user_id}`);
      }
    }
  } catch (err) {
    console.error(`❌ Error in handleSubscriptionEvent: ${err.message}`);
  }
}

// ✅ **Handle Payment Success**
async function handleInvoicePayment(invoice) {
  try {
    console.log('🔄 Processing invoice.payment_succeeded');

    const subscriptionId = invoice.subscription;
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_subscription_id', subscriptionId)
      .single();

    if (!subscription) {
      console.error('❌ No matching subscription found for invoice.');
      return;
    }

    console.log('✅ Updating subscription status to ACTIVE');
    const { error } = await supabase
      .from('subscriptions')
      .update({ status: 'active', updated_at: new Date().toISOString() })
      .eq('stripe_subscription_id', subscriptionId);

    if (error) console.error('❌ Supabase Update Error:', error);
  } catch (err) {
    console.error(`❌ Error in handleInvoicePayment: ${err.message}`);
  }
}

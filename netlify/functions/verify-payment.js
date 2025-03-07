const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// CORS headers
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

exports.handler = async (event, context) => {
  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse request body
    const requestBody = JSON.parse(event.body);
    const { sessionId } = requestBody;

    // Validate required parameters
    if (!sessionId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required parameter: sessionId' })
      };
    }

    // Get the authorization header
    const authHeader = event.headers.authorization;
    if (!authHeader) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Missing authorization header' })
      };
    }

    // Verify the user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('Auth error:', authError);
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Unauthorized' })
      };
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Verify that the session is completed and payment is successful
    if (session.status !== 'complete' || session.payment_status !== 'paid') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Payment not completed',
          status: session.status,
          payment_status: session.payment_status
        })
      };
    }

    // Verify that the user ID matches the client_reference_id
    if (session.client_reference_id !== user.id) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'User ID does not match session client_reference_id' })
      };
    }

    // Get subscription details
    const subscriptionId = session.subscription;
    if (!subscriptionId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No subscription found in session' })
      };
    }

    // Get subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const planId = subscription.items.data[0].plan.id;

    // Check if a subscription record already exists for this user
    const { data: existingSubscriptions, error: queryError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id);
      
    if (queryError) {
      console.error('Error querying existing subscriptions:', queryError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Database error when querying subscriptions' })
      };
    }
    
    let subscriptionRecord;
    
    if (existingSubscriptions && existingSubscriptions.length > 0) {
      // Update existing subscription
      const { data, error } = await supabase
        .from('subscriptions')
        .update({
          stripe_customer_id: session.customer,
          stripe_subscription_id: subscriptionId,
          plan_id: planId,
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();
        
      if (error) {
        console.error('Error updating subscription:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Database error when updating subscription' })
        };
      }
      
      subscriptionRecord = data;
    } else {
      // Create new subscription
      const { data, error } = await supabase
        .from('subscriptions')
        .insert([{
          user_id: user.id,
          stripe_customer_id: session.customer,
          stripe_subscription_id: subscriptionId,
          plan_id: planId,
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end
        }])
        .select()
        .single();
        
      if (error) {
        console.error('Error creating subscription:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Database error when creating subscription' })
        };
      }
      
      subscriptionRecord = data;
    }
    
    // Update user profile to set premium status and link subscription
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        is_premium: true,
        subscription_id: subscriptionRecord.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);
      
    if (updateError) {
      console.error('Error updating user profile:', updateError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Database error when updating user profile' })
      };
    }

    // Return success response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Payment verified successfully',
        subscription: {
          id: subscriptionRecord.id,
          status: subscriptionRecord.status,
          current_period_end: subscriptionRecord.current_period_end
        }
      })
    };
  } catch (error) {
    console.error('Verify payment error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: `Server error: ${error.message || 'An unexpected error occurred'}`
      })
    };
  }
};

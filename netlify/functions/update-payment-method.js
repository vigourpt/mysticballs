const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

// Set up Supabase client
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
  // Log the request for debugging
  console.log('Request received:', {
    method: event.httpMethod,
    path: event.path,
    headers: event.headers,
    body: event.body ? JSON.parse(event.body) : null
  });

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
    const { subscriptionId, paymentMethodId } = requestBody;

    // Validate required parameters
    if (!subscriptionId || !paymentMethodId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required parameters: subscriptionId and paymentMethodId are required' })
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

    // Get the subscription from the database to verify ownership
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('stripe_subscription_id', subscriptionId)
      .single();

    if (subscriptionError || !subscription) {
      console.error('Subscription error:', subscriptionError);
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Subscription not found' })
      };
    }

    // Verify that the subscription belongs to the authenticated user
    if (subscription.user_id !== user.id) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'You do not have permission to update this subscription' })
      };
    }

    // Get the Stripe subscription to get the customer ID
    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
    const customerId = stripeSubscription.customer;

    // Attach the payment method to the customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // Set the payment method as the default for the customer
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Update the subscription to use the new payment method
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      default_payment_method: paymentMethodId,
    });

    // Return success
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Payment method updated successfully',
        subscription: {
          id: updatedSubscription.id,
          status: updatedSubscription.status,
          current_period_end: new Date(updatedSubscription.current_period_end * 1000).toISOString()
        }
      })
    };
  } catch (error) {
    console.error('Update payment method error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: `Server error: ${error.message || 'The payment service is currently unavailable. Please try again later.'}`
      })
    };
  }
};

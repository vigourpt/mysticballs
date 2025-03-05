const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

// Set up Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
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
    const { priceId, customerId } = requestBody;

    // Validate required parameters
    if (!priceId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required parameter: priceId' })
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

    // Use the provided customerId or the user's ID
    const userId = customerId || user.id;

    // Get the user's profile to check if they already have a Stripe customer ID
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // Create or get Stripe customer
    let stripeCustomerId;

    if (profileError || !profile || !profile.stripe_customer_id) {
      // Create a new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabaseUserId: userId
        }
      });

      stripeCustomerId = customer.id;

      // Update or create the user profile with the Stripe customer ID
      if (profileError && profileError.code === 'PGRST116') {
        // Profile doesn't exist, create it
        await supabase
          .from('user_profiles')
          .insert([{
            id: userId,
            email: user.email,
            stripe_customer_id: stripeCustomerId,
            readings_count: 0,
            is_premium: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);
      } else {
        // Profile exists but doesn't have a Stripe customer ID, update it
        await supabase
          .from('user_profiles')
          .update({
            stripe_customer_id: stripeCustomerId,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);
      }
    } else {
      // Use existing Stripe customer ID
      stripeCustomerId = profile.stripe_customer_id;
    }

    // Get the origin for success/cancel URLs
    const origin = event.headers.origin || 'https://mysticballs.com';

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/payment/cancel`,
      client_reference_id: userId,
      metadata: {
        userId: userId,
        planName: requestBody.planName || 'Premium Plan'
      },
    });

    // Return the checkout session URL
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        url: session.url,
        sessionId: session.id
      })
    };
  } catch (error) {
    console.error('Checkout session error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: `Server error: ${error.message || 'The payment service is currently unavailable. Please try again later.'}`
      })
    };
  }
};

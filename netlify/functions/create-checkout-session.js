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
  
  // Check if we're in test mode
  const isTestMode = event.headers['x-stripe-test-mode'] === 'true';
  console.log('Stripe mode:', isTestMode ? 'TEST' : 'LIVE');
  
  try {
    // Initialize Stripe with the appropriate key
    stripe = initializeStripe(isTestMode);
  } catch (error) {
    console.error('Stripe initialization error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Payment service configuration error. Please contact support.',
        details: error.message
      })
    };
  }

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

    // Create checkout session with retry logic
    let session;
    try {
      session = await stripe.checkout.sessions.create({
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
        allow_promotion_codes: true,
      });
    } catch (stripeError) {
      console.error('Stripe checkout session creation error:', stripeError);
      
      // Return a more detailed error message
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: `Stripe error: ${stripeError.message}`,
          code: stripeError.code || 'unknown',
          type: stripeError.type || 'unknown'
        })
      };
    }

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
    
    // Determine if this is a network error
    const isNetworkError = error.code === 'ECONNREFUSED' || 
                          error.code === 'ECONNRESET' || 
                          error.code === 'ETIMEDOUT' ||
                          error.message.includes('network') ||
                          error.message.includes('connection');
    
    return {
      statusCode: isNetworkError ? 503 : 500,
      headers,
      body: JSON.stringify({
        error: isNetworkError 
          ? 'Network error: Unable to connect to payment service. Please try again later.'
          : `Server error: ${error.message || 'The payment service is currently unavailable. Please try again later.'}`,
        code: error.code || 'unknown'
      })
    };
  }
};

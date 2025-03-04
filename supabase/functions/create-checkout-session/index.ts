import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { Handler } from '@netlify/functions';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-01-27.acacia'
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const handler: Handler = async (event) => {
  // Log the incoming request for debugging
  console.log('Received request:', {
    method: event.httpMethod,
    path: event.path,
    headers: event.headers,
    body: event.body ? JSON.parse(event.body) : null
  });

  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders
    };
  }

  try {
    // Validate Supabase environment variables
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables');
      throw new Error('Server configuration error: Missing Supabase environment variables');
    }

    // Validate Stripe environment variables
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('Missing Stripe secret key');
      throw new Error('Server configuration error: Missing Stripe secret key');
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the authorization header
    const authHeader = event.headers.authorization;
    if (!authHeader) {
      console.error('Missing authorization header');
      throw new Error('Authentication required: Missing authorization header');
    }

    // Get the authenticated user
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

    if (authError) {
      console.error('Auth error:', authError);
      throw new Error(`Authentication error: ${authError.message}`);
    }

    if (!user) {
      console.error('No user found');
      throw new Error('Authentication error: No user found');
    }

    // Validate request body
    if (!event.body) {
      console.error('Missing request body');
      throw new Error('Invalid request: Missing request body');
    }

    // Parse request body
    const { priceId, customerId, planName } = JSON.parse(event.body);
    
    if (!priceId) {
      console.error('Missing priceId in request body');
      throw new Error('Invalid request: Missing priceId');
    }

    // Use the user ID from the authenticated user if customerId is not provided
    const userId = customerId || user.id;
    
    console.log('Creating checkout session for user:', userId, 'with price:', priceId);

    // Get user profile to check if they already have a Stripe customer ID
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      // If profile doesn't exist, create one
      if (profileError.code === 'PGRST116') {
        console.log('Profile not found, creating new profile');
        await supabase
          .from('user_profiles')
          .insert([{
            id: userId,
            email: user.email,
            readings_count: 0,
            is_premium: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);
      } else {
        throw new Error(`Database error: ${profileError.message}`);
      }
    }

    // Get or create Stripe customer
    let stripeCustomerId = profile?.stripe_customer_id;

    if (!stripeCustomerId) {
      console.log('Creating new Stripe customer for user:', userId);
      
      // Create a new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabaseUserId: userId
        }
      });

      stripeCustomerId = customer.id;

      // Update user profile with Stripe customer ID
      await supabase
        .from('user_profiles')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', userId);
        
      console.log('Created Stripe customer:', stripeCustomerId);
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
        planName: planName || 'Premium Plan'
      },
    });

    console.log('Created checkout session:', session.id);

    // Return the checkout session URL
    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        url: session.url,
        sessionId: session.id
      }),
    };
  } catch (error: unknown) {
    console.error('Checkout session error:', error);
    
    let statusCode = 400; // Default status code
    let errorMessage = 'Checkout session failed'; // Default error message

    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Set appropriate status code based on error type
      if (errorMessage.includes('Authentication')) {
        statusCode = 401;
      } else if (errorMessage.includes('configuration')) {
        statusCode = 500;
      }
    } else {
      console.error('Unknown error:', error);
      statusCode = 500;
      errorMessage = 'Checkout session failed due to an unknown error.';
    }
    
    return {
      statusCode,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: errorMessage }),
    };
  }
};

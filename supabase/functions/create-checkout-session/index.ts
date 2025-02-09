import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { Handler } from '@netlify/functions';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16'
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders
    };
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the authorization header
    const authHeader = event.headers.authorization;
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Get the authenticated user
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    if (!event.body) {
      throw new Error('Missing request body');
    }

    // Get request body
    const { priceId } = JSON.parse(event.body);
    if (!priceId) {
      throw new Error('Missing priceId');
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${event.headers.origin || ''}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${event.headers.origin || ''}/payment/cancel`,
      client_reference_id: user.id,
      customer_email: user.email,
      metadata: {
        id: user.id,
      },
    });

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId: session.id }),
    };
  } catch (error: any) {
    console.error('Checkout session error:', error);
    return {
      statusCode: error.message === 'Unauthorized' ? 401 : 400,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: error.message }),
    };
  }
};
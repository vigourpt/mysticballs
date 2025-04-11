// supabase/functions/store-code-verifier/index.ts

import { createClient } from '@supabase/supabase-js';
// @ts-ignore
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

interface RequestData {
  email: string;
  codeVerifier: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { email, codeVerifier } = await req.json() as RequestData;

    // Validate input
    if (!email || !codeVerifier) {
      return new Response(
        JSON.stringify({ error: 'Email and code verifier are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate Supabase environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error: Missing environment variables' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Delete any existing verifiers for this email
    await supabase
      .from('auth_code_verifiers')
      .delete()
      .eq('user_email', email);

    // Store the new code verifier
    const { data, error } = await supabase
      .from('auth_code_verifiers')
      .insert([
        { 
          user_email: email, 
          code_verifier: codeVerifier,
          expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes expiry
        }
      ])
      .select('id');

    if (error) {
      console.error('Error storing code verifier:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to store code verifier' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        id: data[0].id,
        message: 'Code verifier stored successfully' 
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error processing request:', error);
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

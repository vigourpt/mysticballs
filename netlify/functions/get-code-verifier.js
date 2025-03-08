const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// CORS headers with cache control
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
};

exports.handler = async (event, context) => {
  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers
    };
  }

  // Allow both GET and POST requests
  if (event.httpMethod !== 'GET' && event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    let email;
    
    // Extract email from query parameters (GET) or request body (POST)
    if (event.httpMethod === 'GET') {
      email = event.queryStringParameters?.email;
    } else {
      const requestBody = JSON.parse(event.body);
      email = requestBody.email;
    }

    // Validate required parameters
    if (!email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required parameter: email' })
      };
    }

    // Get the code verifier for this email
    const { data, error } = await supabase
      .from('auth_code_verifiers')
      .select('code_verifier')
      .eq('email', email)
      .single();

    if (error) {
      console.error('Error retrieving code verifier:', error);
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Code verifier not found for this email' })
      };
    }

    // Set an expiration time for the code verifier (10 minutes from now)
    // This allows multiple retrieval attempts while still ensuring it's eventually cleaned up
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);
    
    // Update the code verifier with an expiration time instead of deleting it immediately
    await supabase
      .from('auth_code_verifiers')
      .update({ 
        updated_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString()
      })
      .eq('email', email);
      
    // Log that we're keeping the verifier available for a short time
    console.log(`Code verifier for ${email} will expire at ${expiresAt.toISOString()}`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        codeVerifier: data.code_verifier 
      })
    };
  } catch (error) {
    console.error('Server error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: `Server error: ${error.message}` })
    };
  }
};

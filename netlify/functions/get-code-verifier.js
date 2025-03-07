const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// CORS headers
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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

    // Delete the code verifier after retrieving it (one-time use)
    await supabase
      .from('auth_code_verifiers')
      .delete()
      .eq('email', email);

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

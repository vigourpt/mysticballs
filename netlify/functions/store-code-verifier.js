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
    const { email, codeVerifier } = requestBody;

    // Validate required parameters
    if (!email || !codeVerifier) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required parameters: email and codeVerifier' })
      };
    }

    // Check if a record already exists for this email
    const { data: existingData, error: queryError } = await supabase
      .from('auth_code_verifiers')
      .select('*')
      .eq('email', email)
      .single();

    if (queryError && queryError.code !== 'PGRST116') {
      console.error('Error querying code verifiers:', queryError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Database query error' })
      };
    }

    let result;
    
    if (existingData) {
      // Update existing record
      const { data, error } = await supabase
        .from('auth_code_verifiers')
        .update({
          code_verifier: codeVerifier,
          updated_at: new Date().toISOString()
        })
        .eq('email', email)
        .select();
        
      if (error) {
        console.error('Error updating code verifier:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Failed to update code verifier' })
        };
      }
      
      result = data;
    } else {
      // Create new record
      const { data, error } = await supabase
        .from('auth_code_verifiers')
        .insert([{
          email,
          code_verifier: codeVerifier,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select();
        
      if (error) {
        console.error('Error storing code verifier:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Failed to store code verifier' })
        };
      }
      
      result = data;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, data: result })
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

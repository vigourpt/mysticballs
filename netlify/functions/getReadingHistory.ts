import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

interface ReadingHistoryParams {
  page?: number;
  pageSize?: number;
  readingType?: string;
  startDate?: string;
  endDate?: string;
}

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      } as { [header: string]: string }
    };
  }

  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      } as { [header: string]: string },
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // Check for authentication
    if (!event.headers.authorization) {
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        } as { [header: string]: string },
        body: JSON.stringify({ error: 'Unauthorized' })
      };
    }

    const authHeader = event.headers.authorization;
    
    // Get user from token
    const { data: userData, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !userData.user) {
      console.error('Supabase auth error:', authError);
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        } as { [header: string]: string },
        body: JSON.stringify({ error: 'Unauthorized' })
      };
    }
    
    const userId = userData.user.id;
    
    // Check if user is premium
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('is_premium')
      .eq('id', userId)
      .single();
      
    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        } as { [header: string]: string },
        body: JSON.stringify({ error: 'Error fetching user profile' })
      };
    }
    
    // Only allow premium users to access reading history
    if (!profileData.is_premium) {
      return {
        statusCode: 403,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        } as { [header: string]: string },
        body: JSON.stringify({ 
          error: 'Premium feature',
          message: 'Reading history is only available to premium members. Please upgrade to access this feature.'
        })
      };
    }
    
    // Parse query parameters
    const params: ReadingHistoryParams = {};
    const queryParams = event.queryStringParameters || {};
    
    if (queryParams.page) {
      params.page = parseInt(queryParams.page, 10);
    }
    
    if (queryParams.pageSize) {
      params.pageSize = parseInt(queryParams.pageSize, 10);
    }
    
    if (queryParams.readingType) {
      params.readingType = queryParams.readingType;
    }
    
    if (queryParams.startDate) {
      params.startDate = queryParams.startDate;
    }
    
    if (queryParams.endDate) {
      params.endDate = queryParams.endDate;
    }
    
    // Set defaults
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    
    // Calculate pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    // Build query
    let query = supabase
      .from('reading_history')
      .select('id, reading_type, user_input, reading_output, created_at', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to);
    
    // Apply filters if provided
    if (params.readingType) {
      query = query.eq('reading_type', params.readingType);
    }
    
    if (params.startDate) {
      query = query.gte('created_at', params.startDate);
    }
    
    if (params.endDate) {
      query = query.lte('created_at', params.endDate);
    }
    
    // Execute query
    const { data, error, count } = await query;
    
    if (error) {
      console.error('Error fetching reading history:', error);
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        } as { [header: string]: string },
        body: JSON.stringify({ error: 'Error fetching reading history' })
      };
    }
    
    // Return results with pagination info
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      } as { [header: string]: string },
      body: JSON.stringify({
        readings: data,
        pagination: {
          page,
          pageSize,
          totalItems: count || 0,
          totalPages: count ? Math.ceil(count / pageSize) : 0
        }
      })
    };
  } catch (error) {
    console.error('Error in getReadingHistory:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      } as { [header: string]: string },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

export { handler };

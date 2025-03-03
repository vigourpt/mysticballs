import { Handler } from '@netlify/functions';
import OpenAI from 'openai';
import { rateLimiter } from './utils/rateLimiter';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  defaultHeaders: { 'OpenAI-Project-Id': process.env.OPENAI_PROJECT_ID }
});

// Import from environment variable or use default value of 5
const MAX_FREE_READINGS = parseInt(process.env.FREE_READINGS_LIMIT || '5', 10);

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

const readingConfigs: Record<string, { maxTokens: number; temperature: number; systemPrompt: string }> = {
  'tarot': {
    maxTokens: 1000,
    temperature: 0.7,
    systemPrompt: `You are an experienced tarot reader with deep knowledge of the 78-card deck. Provide a structured reading that includes: 
1. The cards drawn (choose these intuitively)
2. Individual card interpretations
3. How the cards interact
4. Overall message and guidance
Use markdown headers (###) to separate sections.`
  },
  'numerology': {
    maxTokens: 800,
    temperature: 0.6,
    systemPrompt: `You are a skilled numerologist. Analyze the numerical patterns and provide insights into:
1. Life Path Number
2. Destiny Number
3. Soul Urge Number
4. Personality Traits
5. Life Purpose
Use markdown headers (###) for each section.`
  },
  'astrology': {
    maxTokens: 1000,
    temperature: 0.7,
    systemPrompt: `You are an expert astrologer. Provide a detailed reading covering:
1. Sun Sign Characteristics
2. Current Planetary Influences
3. Life Areas Affected
4. Upcoming Opportunities and Challenges
Use markdown headers (###) for each section.`
  },
  'oracle': {
    maxTokens: 800,
    temperature: 0.7,
    systemPrompt: `You are a mystic oracle reader. Based on the seeker's question, provide a detailed oracle reading that includes:
1. Initial Insights
2. Symbolic Interpretations
3. Guidance and Advice
4. Future Possibilities
Use markdown headers (###) for each section.`
  },
  'runes': {
    maxTokens: 800,
    temperature: 0.7,
    systemPrompt: `You are a skilled rune reader versed in Norse wisdom. Provide a detailed rune reading that includes:
1. The runes drawn (choose these intuitively)
2. Individual rune meanings
3. How the runes interact
4. Practical guidance
Use markdown headers (###) for each section.`
  },
  'iching': {
    maxTokens: 1000,
    temperature: 0.6,
    systemPrompt: `You are a wise I Ching interpreter. Provide a detailed reading that includes:
1. The hexagram(s) drawn
2. The changing lines
3. Core meaning and symbolism
4. Advice for the situation
Use markdown headers (###) for each section.`
  },
  'angelnumbers': {
    maxTokens: 800,
    temperature: 0.7,
    systemPrompt: `You are an angel number interpreter. Provide a detailed interpretation that includes:
1. The significance of each number
2. The combined message
3. Spiritual meaning
4. Practical guidance
Use markdown headers (###) for each section.`
  },
  'horoscope': {
    maxTokens: 1000,
    temperature: 0.7,
    systemPrompt: `You are an expert astrologer. Provide a detailed daily horoscope that includes:
1. General Overview
2. Love & Relationships
3. Career & Goals
4. Health & Wellness
5. Lucky Elements for Today
Use markdown headers (###) for each section.`
  },
  'dream': {
    maxTokens: 1000,
    temperature: 0.7,
    systemPrompt: `You are a skilled dream interpreter. Analyze the dream and provide insights including:
1. Symbol Analysis
2. Emotional Context
3. Personal Significance
4. Guidance & Messages
Use markdown headers (###) for each section.`
  },
  'magic8ball': {
    maxTokens: 20,
    temperature: 0.9,
    systemPrompt: `You are a Magic 8 Ball. Provide ONLY short, classic Magic 8 Ball responses (e.g., "It is certain", "Ask again later", "Don't count on it"). Keep responses to 5 words or less. Never provide explanations.`
  },
  'aura': {
    maxTokens: 800,
    temperature: 0.7,
    systemPrompt: `You are an experienced aura reader. Provide insights into:
1. Dominant Aura Colors
2. Energy Patterns
3. Chakra Balance
4. Practical Energy Maintenance
Use markdown headers (###) to separate sections.`
  },
  'pastlife': {
    maxTokens: 1000,
    temperature: 0.8,
    systemPrompt: `You are a past life reader. Create a narrative covering:
1. Time Period Overview
2. Past Life Identity
3. Key Life Events
4. Connection to Present
5. Lessons & Influences
Use markdown headers (###) to separate sections.`
  }
};

const handler: Handler = async (event, context) => {
  console.log('Received event:', JSON.stringify(event));
  try {
    // Apply rate limiting
    try {
      // Check OpenAI rate limit first
      const clientIp = 
        event.headers['client-ip'] ||
        event.headers['x-nf-client-connection-ip'] ||
        'unknown';

      if (rateLimiter.isRateLimited(clientIp)) {
        console.log('Rate limit exceeded for IP:', clientIp);
        return {
          statusCode: 429,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Retry-After': '60'
          },
          body: JSON.stringify({ 
            error: 'Too many requests. Please try again in 1 minute.',
            retryAfter: 60
          })
        };
      }
    } catch (error) {
      console.error('Rate limit error:', error);
      return {
        statusCode: 429,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Retry-After': '60'
        },
        body: JSON.stringify({ 
          error: 'Rate limiting error occurred',
          retryAfter: 60
        })
      };
    }

    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        }
      };
    }

    if (event.httpMethod !== 'POST') {
      console.log('Method not allowed:', event.httpMethod);
      return {
        statusCode: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Method Not Allowed' })
      };
    }

    if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_PROJECT_ID) {
      console.error('OpenAI API key or project ID missing');
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'OpenAI configuration missing' })
      };
    }

    try {
      const authHeader = event.headers.authorization;
      if (!authHeader) {
        console.error('Missing authorization header');
        throw new Error('Missing authorization header');
      }

      // Get user profile
      const { data: { user }, error: authError } = await supabase.auth.getUser(
        authHeader.replace('Bearer ', '')
      );

      if (authError || !user) {
        console.error('Supabase auth error:', authError);
        throw new Error('Unauthorized');
      }

      // Get user profile with readings count
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Supabase Profile Error:', profileError);
        throw new Error('Failed to get user profile');
      }

      // Check if user is premium or has free readings left
      if (!profile.is_premium && profile.readings_count >= MAX_FREE_READINGS) {
        console.log('Free trial ended for user:', user.id);
        return {
          statusCode: 402,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
            error: 'Free trial ended',
            message: 'You have used all your free readings. Please upgrade to continue.',
            requiresUpgrade: true
          })
        };
      }

      const { readingType, userInput } = JSON.parse(event.body || '{}');
      
      if (!readingType || !userInput) {
        console.error('Missing readingType or userInput');
        return {
          statusCode: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ error: 'Missing required parameters' })
        };
      }
      
      // Check if reading type is premium-only
      const premiumReadingTypes = ['pastlife', 'aura', 'astrology'];
      if (premiumReadingTypes.includes(readingType) && !profile.is_premium) {
        console.log('Premium reading requested by non-premium user:', user.id);
        return {
          statusCode: 402,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
            error: 'Premium reading type',
            message: 'This reading type is only available to premium members. Please upgrade to access it.',
            requiresUpgrade: true
          })
        };
      }

      // Input validation for specific reading types
      if (readingType === 'numerology' && (!userInput.fullname || !userInput.birthdate)) {
        console.error('Missing fullname or birthdate for numerology');
        return {
          statusCode: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ error: 'Name and birthdate required for numerology' })
        };
      }

      if (readingType === 'oracle' && !userInput.question) {
        console.error('Missing question for oracle reading');
        return {
          statusCode: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ error: 'Please provide a question for your oracle reading' })
        };
      }

      if (readingType === 'pastlife' && !userInput.concerns) {
        console.error('Missing concerns for pastlife');
        return {
          statusCode: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ error: 'Name and time period required for past life reading' })
        };
      }

      const config = readingConfigs[readingType];
      if (!config) {
        console.error('Unsupported reading type:', readingType);
        return {
          statusCode: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ error: `Unsupported reading type: ${readingType}` })
        };
      }

      const prompts: Record<string, string> = {
        'tarot': `Provide a tarot reading for this question: ${userInput.question}`,
        'numerology': `Analyze the numerological significance of ${userInput.fullname}, born on ${userInput.birthdate}`,
        'pastlife': `Explore past life connections based on current concerns: ${userInput.concerns}${userInput.feelings ? ` and unexplained feelings: ${userInput.feelings}` : ''}`,
        'magic8ball': `${userInput.question}`,
        'astrology': `Analyze the celestial influences for someone born on ${userInput.birthdate}${userInput.birthtime ? ` at ${userInput.birthtime}` : ''} in ${userInput.birthplace}`,
        'oracle': `Interpret the oracle cards for: ${userInput.question}`,
        'runes': `Cast the runes for: ${userInput.question}`,
        'iching': `Consult the I Ching regarding: ${userInput.question}`,
        'angelnumbers': `Interpret the significance of ${userInput.number} for ${userInput.name}`,
        'horoscope': `Provide a detailed horoscope for ${userInput.zodiac}`,
        'dream': `Interpret this dream: ${userInput.dream}`,
        'aura': `Read the aura and energy based on current feelings: ${userInput.feelings}`
      };

      const prompt = prompts[readingType];
      if (!prompt) {
        console.error('Missing prompt for reading type:', readingType);
        return {
          statusCode: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ error: `Missing prompt for reading type: ${readingType}` })
        };
      }

      const completion = await openai.chat.completions.create({
        model: process.env.NODE_ENV === 'production' ? "gpt-4o" : "gpt-3.5-turbo",
        messages: [
          { role: "system", content: config.systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: config.temperature,
        max_tokens: config.maxTokens
      });

      // Update readings count for non-premium users
      if (!profile.is_premium) {
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({
            readings_count: profile.readings_count + 1,
            last_reading_date: new Date().toISOString()
          })
          .eq('id', user.id);

        if (updateError) {
          console.error('Failed to update readings count:', updateError);
        }
      }

      const responseBody: { reading?: string; error?: string; readingsRemaining?: number | null } = { };

      if (completion.choices && completion.choices[0] && completion.choices[0].message && completion.choices[0].message.content) {
          responseBody.reading = completion.choices[0].message.content.trim();
      } else {
          console.error('No response received from OpenAI');
          responseBody.error = 'No response received';
      }

      if (!profile.is_premium) {
          responseBody.readingsRemaining = MAX_FREE_READINGS - (profile.readings_count + 1);
      } else {
          responseBody.readingsRemaining = null;
      }

      let statusCode = 200;
      const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      };

      return {
        statusCode,
        headers,
        body: JSON.stringify(responseBody)
      };
    } catch (error: any) {
      console.error('Full OpenAI Error:', error);
      let errorMessage = 'Reading generation failed';
      let statusCode = 500;
      let retryAfter: string | undefined = undefined;
      if (error instanceof Error) { // Type guard to check if error is an instance of Error
        console.error('OpenAI Error:', {
          message: error.message,
          code: (error as Record<string, any>).code,
          status: (error as Record<string, any>).status,
          stack: error.stack
        });

        if (error.message.includes('API key')) {
          errorMessage = 'Invalid OpenAI API key';
        } else if (error.message.includes('rate limit') || (error as any).status === 429) {
          statusCode = 429;
          errorMessage = 'Too many requests - please try again later';
          retryAfter = '60';
        } else {
          errorMessage = error.message;
        }
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      };

      const responseBody: { error: string; retryAfter?: string } = { error: errorMessage };
      if (retryAfter) {
        responseBody.retryAfter = retryAfter;
        headers['Retry-After'] = retryAfter;
      }

      return {
        statusCode,
        headers,
        body: JSON.stringify(responseBody)
      };
    }
  } catch (error: any) {
    console.error('Outer error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'An unexpected error occurred' })
    };
  }
};

// Clean up expired rate limit entries periodically
setInterval(() => {
  rateLimiter.cleanup();
}, 60000);

export { handler };

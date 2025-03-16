import { Handler, HandlerEvent, HandlerContext, HandlerResponse } from '@netlify/functions';
import OpenAI from 'openai';
import { rateLimiter } from './utils/rateLimiter';
import { createClient } from '@supabase/supabase-js';
import { User } from '@supabase/supabase-js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  defaultHeaders: { 'OpenAI-Project-Id': process.env.OPENAI_PROJECT_ID }
});

// Import from environment variables or use default values
const MAX_FREE_READINGS = parseInt(process.env.FREE_READINGS_LIMIT || '5', 10);
const ANONYMOUS_FREE_READINGS_LIMIT = parseInt(process.env.ANONYMOUS_FREE_READINGS_LIMIT || '2', 10);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'vigourpt@googlemail.com';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
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
    maxTokens: 200,
    temperature: 1.0, // Increased temperature for more randomness
    systemPrompt: `You are a Magic 8 Ball with a fun personality. For each question:

1. First, randomly select ONE response from this list of classic Magic 8 Ball answers:
- It is certain
- It is decidedly so
- Without a doubt
- Yes definitely
- You may rely on it
- As I see it, yes
- Most likely
- Outlook good
- Yes
- Signs point to yes
- Reply hazy, try again
- Ask again later
- Better not tell you now
- Cannot predict now
- Concentrate and ask again
- Don't count on it
- My reply is no
- My sources say no
- Outlook not so good
- Very doubtful

2. Then, add a fun, humorous follow-up paragraph that elaborates on the answer in a mystical, fortune-teller style. This should be 2-3 sentences that playfully expand on the classic response while maintaining the mysterious Magic 8 Ball character.

Format your response with the classic answer in bold, followed by the fun elaboration paragraph.`
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

// List of premium reading types
const premiumReadingTypes = ['pastlife', 'aura', 'astrology'];

// Interface for user profile
interface UserProfile {
  id: string;
  is_premium: boolean;
  readings_count: number;
  last_reading_date?: string;
}

export const handler = async (event: HandlerEvent, context: HandlerContext): Promise<HandlerResponse> => {
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
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: ''
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
      // Parse request body
      const parsedBody = JSON.parse(event.body || '{}');
      const { readingType, userInput, isAnonymous, anonymousReadingsUsed, deviceId: clientDeviceId } = parsedBody;
      
      // Check for required parameters
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
      
      // Variables to track user status
      let user: User | null = null;
      let profile: UserProfile | null = null;
      let isPremium = false;
      let isAdmin = false;
      let readingsCount = 0;
      let freeReadingsRemaining = MAX_FREE_READINGS;
      
      // Handle authenticated users
      if (!isAnonymous) {
        // Check for authorization header (case-insensitive)
        const authHeader = event.headers.authorization || event.headers.Authorization;
        
        if (authHeader) {
          try {
            // Get user profile
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
                },
                body: JSON.stringify({ error: 'Unauthorized: Invalid token' })
              };
            }
            
            user = userData.user;
            
            // Check if user is admin
            isAdmin = user.email === ADMIN_EMAIL;

            // Get user profile with readings count
            const { data: profileData, error: profileError } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('id', user.id)
              .single();

            if (profileError) {
              console.error('Supabase Profile Error:', profileError);
              return {
                statusCode: 500,
                headers: {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Failed to get user profile' })
              };
            }
            
            profile = profileData as UserProfile;
            isPremium = profile.is_premium;
            readingsCount = profile.readings_count || 0;
            freeReadingsRemaining = Math.max(0, MAX_FREE_READINGS - readingsCount);
            
            // Check if user is premium or has free readings left
            if (!isPremium && readingsCount >= MAX_FREE_READINGS) {
              console.log('Free trial ended for user:', user.id);
              return {
                statusCode: 402,
                headers: {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Free trial ended' })
              };
            }
          } catch (error) {
            console.error('Supabase auth error:', error);
            return {
              statusCode: 401,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              },
              body: JSON.stringify({ error: 'Unauthorized: Invalid token' })
            };
          }
        } else {
          console.error('Missing authorization header');
          return {
            statusCode: 401,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ error: 'Missing authorization header' })
          };
        }
      }
      
      // Handle anonymous users
      if (isAnonymous) {
        console.log('Anonymous user reading request');
        
        // For anonymous users, validate using device ID
        const { data: validationData, error: validationError } = await supabase.rpc('validate_reading_limit', {
          p_user_id: null,
          p_device_id: clientDeviceId
        });

        if (validationError) {
          console.error('Error validating reading limit:', validationError);
          return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Error validating reading limit', details: validationError })
          };
        }

        // If validation fails, return error
        if (!validationData) {
          console.log('Reading limit exceeded for anonymous user with device ID:', clientDeviceId);
          return {
            statusCode: 403,
            body: JSON.stringify({ error: 'Reading limit exceeded. Please sign up for more readings.' })
          };
        }
        
        // Track the anonymous reading
        try {
          // Increment the reading count in localStorage
          const currentReadingsUsed = parseInt(event.headers['x-readings-used'] || '0', 10);
          const newReadingsUsed = currentReadingsUsed + 1;
          
          // Try to increment the anonymous reading count in the database
          const { error: incrementError } = await supabase.rpc('increment_anonymous_reading_count', {
            p_device_id: clientDeviceId
          });
          
          if (incrementError) {
            console.error('Error incrementing anonymous reading count:', incrementError);
            // Continue anyway, don't block the reading
          }
        } catch (error) {
          console.error('Error tracking anonymous reading:', error);
          // Continue anyway, don't block the reading
        }
      }
      
      // Check if reading type is premium-only and user has no free readings left
      // Only apply this restriction if the user is authenticated and not premium and not admin
      if (
        premiumReadingTypes.includes(readingType) && 
        user !== null && 
        profile !== null && 
        !isPremium && 
        !isAdmin && 
        freeReadingsRemaining <= 0
      ) {
        console.log('Premium reading requested by non-premium user with no free readings:', user.id);
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

      try {
        console.log('Sending request to OpenAI for reading type:', readingType);
        
        // Add timeout handling for OpenAI requests
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('OpenAI request timeout')), 30000); // 30 second timeout
        });

        let completion: OpenAI.Chat.Completions.ChatCompletion | null = null;
        
        try {
          const openaiPromise = openai.chat.completions.create({
            model: process.env.NODE_ENV === 'production' ? "gpt-4o" : "gpt-3.5-turbo",
            messages: [
              { role: "system", content: config.systemPrompt },
              { role: "user", content: prompt }
            ],
            temperature: config.temperature,
            max_tokens: config.maxTokens
          });

          // Race the OpenAI request against the timeout
          completion = await Promise.race([openaiPromise, timeoutPromise]);
        } catch (error) {
          console.error('OpenAI API error:', error);
          return {
            statusCode: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
              error: 'Failed to generate reading',
              message: error instanceof Error ? error.message : 'Unknown error'
            })
          };
        }

        if (!completion || !completion.choices || completion.choices.length === 0 || !completion.choices[0].message) {
          console.error('OpenAI returned an empty response');
          return {
            statusCode: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ error: 'Failed to generate reading: Empty response from AI service' })
          };
        }

        // Update readings count for authenticated non-premium users
        if (user !== null && profile !== null && !isPremium) {
          const { error: updateError } = await supabase
            .from('user_profiles')
            .update({
              readings_count: readingsCount + 1,
              last_reading_date: new Date().toISOString()
            })
            .eq('id', user.id);

          if (updateError) {
            console.error('Failed to update readings count:', updateError);
          }
        }
        
        // Store reading in history table for authenticated users
        if (user !== null && completion.choices && completion.choices[0] && completion.choices[0].message && completion.choices[0].message.content) {
          const readingOutput = completion.choices[0].message.content.trim();
          
          const { error: historyError } = await supabase
            .from('reading_history')
            .insert([{
              user_id: user.id,
              reading_type: readingType,
              user_input: userInput,
              reading_output: readingOutput
            }]);

          if (historyError) {
            console.error('Failed to store reading history:', historyError);
          }
        }

        const responseBody: { reading?: string; error?: string; readingsRemaining?: number | null } = { };

        if (completion.choices && completion.choices[0] && completion.choices[0].message && completion.choices[0].message.content) {
            responseBody.reading = completion.choices[0].message.content.trim();
        } else {
            console.error('No response received from OpenAI');
            responseBody.error = 'No response received';
        }

        // For authenticated users, return readings remaining
        if (user !== null && profile !== null && !isPremium) {
            responseBody.readingsRemaining = Math.max(0, MAX_FREE_READINGS - (readingsCount + 1));
        } else if (isAnonymous) {
            // For anonymous users, we don't track readings in the database
            responseBody.readingsRemaining = null;
        } else {
            // For premium users
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
      } catch (error) {
        console.error('Error generating reading:', error);
        
        // Check if it's an OpenAI API error
        if (error.response && error.response.status) {
          console.error('OpenAI API error:', error.response.status, error.response.data);
          return {
            statusCode: error.response.status,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
              error: 'OpenAI API error', 
              message: error.response.data?.error?.message || 'Failed to generate reading'
            })
          };
        }
        
        return {
          statusCode: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ error: 'Failed to generate reading', message: error.message })
        };
      }
    } catch (error) {
      console.error('Outer error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'An unexpected error occurred' })
      };
    }
  } catch (error) {
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

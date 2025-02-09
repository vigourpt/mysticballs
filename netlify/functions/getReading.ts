import { Handler } from '@netlify/functions';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Define response configurations for each reading type
const readingConfigs: Record<string, { maxTokens: number; temperature: number; systemPrompt: string }> = {
  'tarot': {
    maxTokens: 1000,
    temperature: 0.7,
    systemPrompt: "You are an experienced tarot reader with deep knowledge of the 78-card deck. Provide a structured reading that includes: \n1. The cards drawn (choose these intuitively)\n2. Individual card interpretations\n3. How the cards interact\n4. Overall message and guidance\nUse markdown headers (###) to separate sections."
  },
  'numerology': {
    maxTokens: 800,
    temperature: 0.6,
    systemPrompt: "You are a skilled numerologist. Analyze the numerical patterns and provide insights into:\n1. Life Path Number\n2. Destiny Number\n3. Soul Urge Number\n4. Personality Traits\n5. Life Purpose\nUse markdown headers (###) for each section."
  },
  'astrology': {
    maxTokens: 1000,
    temperature: 0.7,
    systemPrompt: "You are an expert astrologer. Provide a detailed reading covering:\n1. Sun Sign Characteristics\n2. Current Planetary Influences\n3. Life Areas Affected\n4. Upcoming Opportunities and Challenges\nUse markdown headers (###) for each section."
  },
  'oracle': {
    maxTokens: 600,
    temperature: 0.8,
    systemPrompt: "You are an intuitive oracle card reader. Draw 3 cards and provide:\n1. Card Messages\n2. How they relate to the question\n3. Guidance and Action Steps\nUse markdown headers (###) for each section."
  },
  'runes': {
    maxTokens: 700,
    temperature: 0.7,
    systemPrompt: "You are a rune master versed in Elder Futhark. Draw 3 runes and provide:\n1. Individual Rune Meanings\n2. Combined Interpretation\n3. Practical Guidance\nUse markdown headers (###) for each section."
  },
  'iching': {
    maxTokens: 800,
    temperature: 0.6,
    systemPrompt: "You are an I Ching master. Generate a hexagram and provide:\n1. Hexagram Name and Number\n2. Core Message\n3. Changing Lines (if any)\n4. Practical Application\nUse markdown headers (###) for each section."
  },
  'angels': {
    maxTokens: 500,
    temperature: 0.7,
    systemPrompt: "You are an angel number interpreter. Provide insights into:\n1. Number Significance\n2. Angelic Message\n3. Guidance for Implementation\nUse markdown headers (###) for each section."
  },
  'horoscope': {
    maxTokens: 600,
    temperature: 0.7,
    systemPrompt: "You are an astrologer providing daily guidance. Cover:\n1. General Overview\n2. Love & Relationships\n3. Career & Goals\n4. Health & Well-being\nUse markdown headers (###) for each section."
  },
  'dreams': {
    maxTokens: 700,
    temperature: 0.8,
    systemPrompt: "You are a dream interpreter. Analyze the dream by:\n1. Symbol Meanings\n2. Emotional Context\n3. Personal Significance\n4. Guidance Message\nUse markdown headers (###) for each section."
  },
  'magic8ball': {
    maxTokens: 20,
    temperature: 0.9,
    systemPrompt: "You are a Magic 8 Ball. Provide ONLY short, classic Magic 8 Ball responses (e.g., 'It is certain', 'Ask again later', 'Don't count on it'). Keep responses to 5 words or less. Never provide explanations or additional context."
  },
  'aura': {
    maxTokens: 800,
    temperature: 0.7,
    systemPrompt: "You are an experienced aura reader. Provide insights into:\n1. Dominant Aura Colors\n2. Energy Patterns\n3. Chakra Balance\n4. Practical Energy Maintenance\nUse markdown headers (###) for each section."
  },
  'pastlife': {
    maxTokens: 1000,
    temperature: 0.8,
    systemPrompt: "You are a past life reader. Create a narrative covering:\n1. Time Period Overview\n2. Past Life Identity\n3. Key Life Events\n4. Connection to Present\n5. Lessons & Influences\nUse markdown headers (###) for each section."
  }
};

const handler: Handler = async (event) => {
  // Enable CORS
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

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { readingType, userInput } = JSON.parse(event.body || '{}');
    console.log('Parsed request:', { readingType, userInput });

    if (!readingType || !userInput) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Missing required parameters' })
      };
    }

    const config = readingConfigs[readingType];
    if (!config) {
      console.error('Invalid reading type:', readingType);
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
      'numerology': `Analyze the numerological significance of ${userInput.name}, born on ${userInput.birthdate}`,
      'pastlife': `Explore ${userInput.name}'s most significant past life based on their attraction to the ${userInput.timePeriod} period`,
      'magic8ball': `${userInput.question}`,
      'astrology': `Analyze the celestial influences for a ${userInput.sign} born on ${userInput.birthdate}`,
      'oracle': `Interpret the oracle cards for: ${userInput.question}`,
      'runes': `Cast the runes for: ${userInput.question}`,
      'iching': `Consult the I Ching regarding: ${userInput.question}`,
      'angels': `Interpret the significance of ${userInput.number} for ${userInput.name}`,
      'horoscope': `Provide a detailed horoscope for ${userInput.zodiacSign}`,
      'dreams': `Interpret this dream: ${userInput.dream}`,
      'aura': `Read the aura and energy of ${userInput.name} based on their personality: ${userInput.personality}`
    };

    const prompt = prompts[readingType];
    if (!prompt) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: `Missing prompt for reading type: ${readingType}` })
      };
    }

    console.log('Using prompt:', prompt);

    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key is missing');
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'OpenAI API key is not configured' })
      };
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: config.systemPrompt
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: config.temperature,
      max_tokens: config.maxTokens,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    });

    console.log('OpenAI response:', completion.choices[0]?.message);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        reading: completion.choices[0]?.message?.content?.trim() || 'No response received'
      })
    };
  } catch (error) {
    console.error('Error in getReading:', error);
    
    let errorMessage = 'Reading generation failed';
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Check for specific OpenAI errors
      if (error.message.includes('API key')) {
        errorMessage = 'OpenAI API key is invalid or expired';
      } else if (error.message.includes('rate limit')) {
        errorMessage = 'Too many requests. Please try again in a moment.';
      }
    }

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: errorMessage })
    };
  }
};

export { handler };

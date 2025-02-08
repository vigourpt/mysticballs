import { ReadingTypeId } from '../types';
import { OPENAI_CONFIG } from '../config/openai';
import OpenAI from 'openai';

// Add API key validation
const validateApiKey = (apiKey: string): boolean => {
  if (!apiKey) return false;
  // Accept both old (sk-) and new (sk-proj-) API key formats
  return (apiKey.startsWith('sk-') || apiKey.startsWith('sk-proj-')) && apiKey.length > 20;
};

const openai = new OpenAI({
  apiKey: (() => {
    const apiKey = OPENAI_CONFIG.apiKey;
    if (!validateApiKey(apiKey)) {
      console.error('Invalid OpenAI API key format');
      throw new Error('OpenAI API key is invalid. Please check your configuration.');
    }
    return apiKey;
  })(),
  dangerouslyAllowBrowser: true,
  maxRetries: 3,
  timeout: 30000
});

const formatResponse = (content: string): string => {
  return content.trim();
};

export const getReading = async (
  readingType: ReadingTypeId,
  userInput: Record<string, string>
): Promise<string> => {
  try {
    if (!OPENAI_CONFIG.apiKey) {
      throw new Error('OpenAI API key not configured. Please check your environment variables.');
    }

    // Validate reading type
    if (!readingType || typeof readingType !== 'string') {
      throw new Error(`Invalid reading type: ${JSON.stringify(readingType)}`);
    }

    console.log('Processing reading type:', readingType);

    const prompts: Record<ReadingTypeId, string> = {
      'tarot': `As a tarot reader, interpret the cards for this question: ${userInput.question}. Use markdown headers (###) for different aspects of the reading, and ensure paragraphs are well-separated.`,
      'numerology': `As a numerologist, analyze the numbers and patterns in: ${userInput.numbers}. Use markdown headers (###) for different aspects of the reading, and ensure paragraphs are well-separated.`,
      'pastlife': `As a past life reader, explore the querent's most significant past life based on their current attractions and patterns: ${userInput.patterns}. Create a detailed narrative of their past life, including historical context and how it influences their present journey. Use markdown headers (###) for different aspects of the past life reading, and ensure paragraphs are well-separated.`,
      'magic8ball': `As a mystical Magic 8 Ball oracle, provide a clear and concise answer to this question: ${userInput.question}. Format the response as a single, direct statement in the style of a traditional Magic 8 Ball (e.g., "It is certain", "Ask again later", "Don't count on it").`,
      'astrology': `As an astrologer, provide insights based on the astrological aspects for: ${userInput.question}. Use markdown headers (###) for different aspects of the reading.`,
      'oracle': `As an oracle card reader, interpret the cards for: ${userInput.question}. Use markdown headers (###) for different aspects of the reading.`,
      'runes': `As a rune caster, interpret the runes for: ${userInput.question}. Use markdown headers (###) for different aspects of the reading.`,
      'iching': `As an I Ching interpreter, provide wisdom for: ${userInput.question}. Use markdown headers (###) for different aspects of the reading.`,
      'angels': `As an angel number interpreter, explain the meaning of: ${userInput.numbers}. Use markdown headers (###) for different aspects of the reading.`,
      'horoscope': `As an astrologer, provide a horoscope reading for: ${userInput.sign}. Use markdown headers (###) for different aspects of the reading.`,
      'dreams': `As a dream interpreter, analyze this dream: ${userInput.dream}. Use markdown headers (###) for different aspects of the reading.`,
      'aura': `As an aura reader, interpret the colors and energy of: ${userInput.description}. Use markdown headers (###) for different aspects of the reading.`
    };

    const prompt = prompts[readingType];
    if (!prompt) {
      console.error('Unhandled reading type:', readingType);
      throw new Error(`Unhandled reading type: ${readingType}. Valid types are: ${Object.keys(prompts).join(', ')}`);
    }

    // Validate required input fields
    const requiredFields: Record<ReadingTypeId, string[]> = {
      'tarot': ['question'],
      'numerology': ['numbers'],
      'pastlife': ['patterns'],
      'magic8ball': ['question'],
      'astrology': ['question'],
      'oracle': ['question'],
      'runes': ['question'],
      'iching': ['question'],
      'angels': ['numbers'],
      'horoscope': ['sign'],
      'dreams': ['dream'],
      'aura': ['description']
    };

    const missingFields = requiredFields[readingType]?.filter(field => !userInput[field]);
    if (missingFields?.length > 0) {
      throw new Error(`Missing required fields for ${readingType} reading: ${missingFields.join(', ')}`);
    }

    console.log('Sending OpenAI request:', { readingType, userInput });

    const response = await openai.chat.completions.create({
      model: OPENAI_CONFIG.model,
      messages: [
        {
          role: 'system',
          content: 'You are a mystic reader providing insightful and meaningful readings.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: OPENAI_CONFIG.temperature,
      max_tokens: 2048,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
      stream: false
    });

    if (!response.choices?.[0]?.message?.content) {
      throw new Error('OpenAI returned an empty response');
    }

    console.log('OpenAI response received:', response);
    return formatResponse(response.choices[0].message.content);
  } catch (error: unknown) {
    console.error('OpenAI API Error:', error);
    
    if (error instanceof Error) {
      // Handle specific OpenAI error types
      if (error.message.includes('API key')) {
        throw new Error('OpenAI API key error. Please contact support.');
      }
      if (error.message.includes('rate limit')) {
        throw new Error('Too many requests. Please try again in a moment.');
      }
      throw new Error(`Reading generation failed: ${error.message}`);
    }
    
    throw new Error('Reading generation failed. Please try again.');
  }
};
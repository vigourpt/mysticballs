import { ReadingTypeId } from '../types';
import OpenAI from 'openai';

// Add API key validation
const validateApiKey = (apiKey: string): boolean => {
  if (!apiKey) return false;
  // Accept both old (sk-) and new (sk-proj-) API key formats
  return (apiKey.startsWith('sk-') || apiKey.startsWith('sk-proj-')) && apiKey.length > 20;
};

// Remove API key from build output by using runtime check
const getApiKey = () => {
  // In development, use the environment variable
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_OPENAI_API_KEY;
  }
  
  // In production, get the key from server-side environment
  // The key should be passed through the backend API
  return null;
};

const openai = new OpenAI({
  apiKey: getApiKey(),
  dangerouslyAllowBrowser: true,
  maxRetries: 3,
  timeout: 30000
});

const formatResponse = (content: string): string => {
  return content.trim();
};

const validateRequiredFields = (readingType: ReadingTypeId, userInput: Record<string, string>) => {
  const requiredFields: Record<ReadingTypeId, string[]> = {
    'tarot': ['question'],
    'numerology': ['name', 'birthdate'],
    'pastlife': ['name', 'timePeriod'],
    'magic8ball': ['question'],
    'astrology': ['birthdate'],
    'oracle': ['question'],
    'runes': ['question'],
    'iching': ['question'],
    'angels': ['name', 'number'],
    'horoscope': ['zodiacSign'],
    'dreams': ['dream'],
    'aura': ['name', 'personality']
  };

  const missing = requiredFields[readingType]?.filter(field => !userInput[field]);
  if (missing?.length) {
    throw new Error(`Missing required fields for ${readingType} reading: ${missing.join(', ')}`);
  }
};

export const getReading = async (
  readingType: ReadingTypeId,
  userInput: Record<string, string>
): Promise<string> => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error('OpenAI API key not available. Please ensure you are properly authenticated.');
    }

    // Validate reading type and required fields
    if (!readingType || typeof readingType !== 'string') {
      throw new Error(`Invalid reading type: ${JSON.stringify(readingType)}`);
    }
    validateRequiredFields(readingType, userInput);

    console.log('Processing reading type:', readingType);

    const prompts: Record<ReadingTypeId, string> = {
      'tarot': `As a tarot reader, interpret the cards for this question: ${userInput.question}. Use markdown headers (###) for different aspects of the reading, and ensure paragraphs are well-separated.`,
      'numerology': `As a numerologist, analyze the numerological significance of ${userInput.name}, born on ${userInput.birthdate}. Use markdown headers (###) for different aspects of the reading, and ensure paragraphs are well-separated.`,
      'pastlife': `As a past life reader, explore ${userInput.name}'s most significant past life based on their attraction to the ${userInput.timePeriod} period. Create a detailed narrative of their past life, including historical context and how it influences their present journey. Use markdown headers (###) for different aspects of the past life reading, and ensure paragraphs are well-separated.`,
      'magic8ball': `As a mystical Magic 8 Ball oracle, provide a clear and concise answer to this question: ${userInput.question}. Format the response as a single, direct statement in the style of a traditional Magic 8 Ball.`,
      'astrology': `As an astrologer, analyze the celestial influences for someone born on ${userInput.birthdate}${userInput.birthTime ? ` at ${userInput.birthTime}` : ''}${userInput.location ? ` in ${userInput.location}` : ''}. Use markdown headers (###) for different aspects of the reading, and ensure paragraphs are well-separated.`,
      'oracle': `As an oracle card reader, interpret the cards for: ${userInput.question}. Use markdown headers (###) for different aspects of the reading, and ensure paragraphs are well-separated.`,
      'runes': `As a rune caster, interpret the runes for: ${userInput.question}. Use markdown headers (###) for different aspects of the reading, and ensure paragraphs are well-separated.`,
      'iching': `As an I Ching interpreter, provide wisdom for: ${userInput.question}. Use markdown headers (###) for different aspects of the reading, and ensure paragraphs are well-separated.`,
      'angels': `As an angel number interpreter, analyze the significance of ${userInput.number} for ${userInput.name}. Use markdown headers (###) for different aspects of the reading, and ensure paragraphs are well-separated.`,
      'horoscope': `As an astrologer, provide a detailed horoscope for ${userInput.zodiacSign}. Use markdown headers (###) for different aspects of the reading, and ensure paragraphs are well-separated.`,
      'dreams': `As a dream interpreter, analyze this dream: ${userInput.dream}. Use markdown headers (###) for different aspects of the reading, and ensure paragraphs are well-separated.`,
      'aura': `As an aura reader, interpret the aura and energy of ${userInput.name} based on their personality: ${userInput.personality}. Use markdown headers (###) for different aspects of the reading, and ensure paragraphs are well-separated.`
    };

    const prompt = prompts[readingType];
    if (!prompt) {
      throw new Error(`Unsupported reading type: ${readingType}`);
    }

    console.log('Sending request to OpenAI...');
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are a skilled mystic and spiritual advisor. Provide insightful and meaningful readings that respect the querent's beliefs while maintaining professionalism and ethical standards."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    });

    if (!completion.choices[0]?.message?.content) {
      throw new Error('No response received from OpenAI');
    }

    return formatResponse(completion.choices[0].message.content);
  } catch (error) {
    console.error('Error in getReading:', error);
    
    // Enhance error message for users
    let userMessage = 'Reading generation failed. ';
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        userMessage += 'There was an issue with the API configuration.';
      } else if (error.message.includes('429')) {
        userMessage += 'The service is currently experiencing high demand. Please try again in a few moments.';
      } else if (error.message.includes('network')) {
        userMessage += 'Please check your internet connection and try again.';
      } else if (error.message.includes('Missing required fields')) {
        userMessage += error.message;
      } else {
        userMessage += 'An unexpected error occurred. Please try again.';
      }
    }
    
    throw new Error(userMessage);
  }
};
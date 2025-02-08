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
      'magic8ball': `As a mystical Magic 8 Ball oracle, provide a clear and concise answer to this question: ${userInput.question}. Format the response as a single, direct statement in the style of a traditional Magic 8 Ball.`,
      'astrology': `As an astrologer, analyze the celestial influences for: ${userInput.birthdate}. Use markdown headers (###) for different aspects of the reading, and ensure paragraphs are well-separated.`,
      'oracle': `As an oracle card reader, interpret the cards for: ${userInput.question}. Use markdown headers (###) for different aspects of the reading, and ensure paragraphs are well-separated.`,
      'runes': `As a rune caster, interpret the runes for: ${userInput.question}. Use markdown headers (###) for different aspects of the reading, and ensure paragraphs are well-separated.`,
      'iching': `As an I Ching interpreter, provide wisdom for: ${userInput.question}. Use markdown headers (###) for different aspects of the reading, and ensure paragraphs are well-separated.`,
      'angels': `As an angel card reader, share divine guidance for: ${userInput.question}. Use markdown headers (###) for different aspects of the reading, and ensure paragraphs are well-separated.`,
      'horoscope': `As an astrologer, provide a detailed horoscope for ${userInput.zodiacSign}. Use markdown headers (###) for different aspects of the reading, and ensure paragraphs are well-separated.`,
      'dreams': `As a dream interpreter, analyze this dream: ${userInput.dream}. Use markdown headers (###) for different aspects of the reading, and ensure paragraphs are well-separated.`,
      'aura': `As an aura reader, interpret the colors and energies in: ${userInput.description}. Use markdown headers (###) for different aspects of the reading, and ensure paragraphs are well-separated.`
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
      } else {
        userMessage += 'An unexpected error occurred. Please try again.';
      }
    }
    
    throw new Error(userMessage);
  }
};
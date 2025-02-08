import { ReadingTypeId } from '../types';
import { OPENAI_CONFIG } from '../config/openai';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: OPENAI_CONFIG.apiKey,
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
      throw new Error('OpenAI API key not configured');
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
      throw new Error(`Unhandled reading type: ${readingType}`);
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

    console.log('OpenAI response received:', response);
    return formatResponse(response.choices[0]?.message?.content || 'No response generated');
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('OpenAI API Error:', {
        error: error.message,
        stack: error.stack
      });
      throw new Error(`Reading generation failed: ${error.message}`);
    }
    throw new Error('Reading generation failed due to unexpected error');
  }
};
import { OPENAI_CONFIG } from '../config/openai';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: OPENAI_CONFIG.apiKey,
  dangerouslyAllowBrowser: true,
  maxRetries: 3,
  timeout: 30000
});

export type ReadingType = 'tarot' | 'numerology' | 'pastlife';

const formatResponse = (content: string): string => {
  return content.trim();
};

export const getReading = async (
  readingType: ReadingType,
  userInput: Record<string, string>
): Promise<string> => {
  try {
    if (!OPENAI_CONFIG.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    if (!readingType) {
      console.error('Invalid reading type:', readingType);
      throw new Error('Invalid reading type');
    }

    console.log('Sending OpenAI request:', { readingType, userInput });

    const prompts: Record<ReadingType, string> = {
      tarot: `As a tarot reader, interpret the cards for this question: ${userInput.question}. Use markdown headers (###) for different aspects of the reading, and ensure paragraphs are well-separated.`,
      numerology: `As a numerologist, analyze the numbers and patterns in: ${userInput.numbers}. Use markdown headers (###) for different aspects of the reading, and ensure paragraphs are well-separated.`,
      pastlife: `As a past life reader, explore the querent's most significant past life based on their current attractions and patterns: ${userInput.patterns}. Create a detailed narrative of their past life, including historical context and how it influences their present journey. Use markdown headers (###) for different aspects of the past life reading, and ensure paragraphs are well-separated.`
    };

    const prompt = prompts[readingType];
    if (!prompt) {
      console.error('Invalid reading type:', readingType);
      throw new Error(`Invalid reading type: ${readingType}`);
    }

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
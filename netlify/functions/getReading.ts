import { Handler } from '@netlify/functions';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const handler: Handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed'
    };
  }

  try {
    const { readingType, userInput } = JSON.parse(event.body || '{}');

    if (!readingType || !userInput) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required parameters' })
      };
    }

    const prompts: Record<string, string> = {
      'tarot': `As a tarot reader, interpret the cards for this question: ${userInput.question}. Use markdown headers (###) for different aspects of the reading, and ensure paragraphs are well-separated.`,
      'numerology': `As a numerologist, analyze the numerological significance of ${userInput.name}, born on ${userInput.birthdate}. Use markdown headers (###) for different aspects of the reading, and ensure paragraphs are well-separated.`,
      'pastlife': `As a past life reader, explore ${userInput.name}'s most significant past life based on their attraction to the ${userInput.timePeriod} period. Create a detailed narrative of their past life, including historical context and how it influences their present journey. Use markdown headers (###) for different aspects of the past life reading, and ensure paragraphs are well-separated.`,
      'magic8ball': `As a mystical Magic 8 Ball oracle, provide a clear and concise answer to this question: ${userInput.question}. Format the response as a single, direct statement in the style of a traditional Magic 8 Ball.`,
      'astrology': `As an astrologer, analyze the celestial influences for a ${userInput.sign} born on ${userInput.birthdate}. Use markdown headers (###) for different aspects of the reading, and ensure paragraphs are well-separated.`,
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
      return {
        statusCode: 400,
        body: JSON.stringify({ error: `Unsupported reading type: ${readingType}` })
      };
    }

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

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        reading: completion.choices[0]?.message?.content?.trim() || 'No response received'
      })
    };
  } catch (error) {
    console.error('Error in getReading:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Reading generation failed. Please try again later.' 
      })
    };
  }
};

export { handler };

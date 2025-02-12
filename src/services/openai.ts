import { ReadingTypeId, ReadingType } from '../types';

// Validate required fields before making the request
const validateRequiredFields = (readingType: ReadingTypeId, userInput: Record<string, string>) => {
  const requiredFields: Record<ReadingTypeId, string[]> = {
    'tarot': ['question', 'spread'],
    'numerology': ['birthdate', 'fullname'],
    'astrology': ['birthdate', 'birthplace'],
    'oracle': ['question', 'deck'],
    'runes': ['question', 'spread'],
    'iching': ['question'],
    'angelnumbers': ['numbers'],
    'horoscope': ['zodiac'],
    'dreamanalysis': ['dream'],
    'magic8ball': ['question'],
    'aura': ['feelings'],
    'pastlife': ['concerns']
  };

  const missing = requiredFields[readingType]?.filter(field => !userInput[field]);
  if (missing?.length) {
    throw new Error(`Missing required fields for ${readingType} reading: ${missing.join(', ')}`);
  }
};

export const getReading = async (
  readingType: ReadingType,
  userInput: Record<string, string>
): Promise<string> => {
  try {
    // Validate reading type and required fields
    if (!readingType || typeof readingType !== 'string') {
      throw new Error(`Invalid reading type: ${JSON.stringify(readingType)}`);
    }
    validateRequiredFields(readingType, userInput);

    console.log('Processing reading type:', readingType, typeof readingType, 'with input:', userInput); // <--- Added console.log for typeof readingType
    console.log('ReadingType object:', readingType); // <--- Added console.log for readingType object
    
    const response = await fetch('/.netlify/functions/getReading', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        readingType: (readingType as ReadingType).id,
        userInput
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('API error:', data);
      throw new Error(data.error || 'Reading generation failed');
    }

    if (!data.reading) {
      console.error('No reading in response:', data);
      throw new Error('No reading generated');
    }

    return data.reading;
  } catch (error) {
    console.error('Error in getReading:', error);
    
    // Enhance error message for users
    let userMessage = 'Reading generation failed. ';
    if (error instanceof Error) {
      if (error.message.includes('Missing required fields')) {
        userMessage = error.message;
      } else if (error.message.includes('API key')) {
        userMessage = 'API configuration error. Please contact support.';
      } else if (error.message.includes('rate limit')) {
        userMessage = 'Too many requests. Please try again in a moment.';
      } else {
        userMessage += error.message;
      }
    }
    
    throw new Error(userMessage);
  }
};

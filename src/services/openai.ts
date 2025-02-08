import { ReadingTypeId } from '../types';

// Validate required fields before making the request
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
    // Validate reading type and required fields
    if (!readingType || typeof readingType !== 'string') {
      throw new Error(`Invalid reading type: ${JSON.stringify(readingType)}`);
    }
    validateRequiredFields(readingType, userInput);

    console.log('Processing reading type:', readingType);
    
    const response = await fetch('/.netlify/functions/getReading', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        readingType,
        userInput
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Reading generation failed');
    }

    const data = await response.json();
    return data.reading;
  } catch (error) {
    console.error('Error in getReading:', error);
    
    // Enhance error message for users
    let userMessage = 'Reading generation failed. ';
    if (error instanceof Error) {
      if (error.message.includes('Missing required fields')) {
        userMessage += error.message;
      } else {
        userMessage += 'Please try again later.';
      }
    }
    
    throw new Error(userMessage);
  }
};
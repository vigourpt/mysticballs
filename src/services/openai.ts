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
    if (!readingType || typeof readingType !== 'object' || !readingType.id) {
      throw new Error(`Invalid reading type: ${JSON.stringify(readingType)}`);
    }
    validateRequiredFields(readingType.id, userInput);

    console.log('Processing reading type:', readingType, 'with input:', userInput);
    
    // Get the access token from local storage
    const accessToken = localStorage.getItem('sb-access-token');

    if (!accessToken) {
      throw new Error('Missing access token');
    }

    const response = await fetch('/.netlify/functions/getReading', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}` // Add the Authorization header
      },
      body: JSON.stringify({
        readingType: readingType.id,
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
  } catch (error: any) {
    console.error('Error in getReading:', error);
    throw error;
  }
};
